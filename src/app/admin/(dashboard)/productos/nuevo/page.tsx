'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { revalidateStore } from '@/app/admin/actions'
import { slugify } from '@/lib/utils'
import { CameraOrGalleryInput } from '@/components/admin/CameraOrGalleryInput'

const SIZES_ROPA = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ÚNICO']
const SIZES_CALZADO = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', 'ÚNICO']

const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  materials_care: z.string().optional(),
  price: z.coerce.number().min(1, 'El precio debe ser mayor a 0'),
  original_price: z.coerce.number().optional().nullable(),
  category_id: z.string().min(1, 'Selecciona una categoría'),
  brand_id: z.string().optional(),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  low_stock_alert: z.coerce.number().min(0).default(5),
  variants: z.array(
    z.object({
      size: z.string().min(1),
      stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
    })
  ).min(1, 'Debe haber al menos una variante'),
})

type ProductForm = z.infer<typeof productSchema>

export default function NuevoProductoPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      materials_care: '',
      price: 0,
      original_price: null,
      category_id: '',
      brand_id: '',
      is_active: true,
      is_featured: false,
      low_stock_alert: 5,
      variants: [{ size: 'M', stock: 10 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const categoryId = watch('category_id')
  const isCalzado = categories.some(
    (c) => c.id === categoryId && (c.slug?.toLowerCase() === 'calzado' || c.name?.toLowerCase().includes('calzado'))
  )
  const availableSizes = isCalzado ? SIZES_CALZADO : SIZES_ROPA

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()
      const [{ data: catData }, { data: brandData }] = await Promise.all([
        supabase.from('categories').select('id, name, slug'),
        supabase.from('brands').select('id, name, slug').eq('is_active', true).order('display_order'),
      ])
      if (catData) setCategories(catData)
      if (brandData) setBrands(brandData)
    }
    fetchData()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setImages((prev) => [...prev, ...filesArray])

      const newPreviewUrls = filesArray.map((file) => URL.createObjectURL(file))
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls])
    }
  }

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setPreviewUrls((prev) => {
      const newUrls = [...prev]
      URL.revokeObjectURL(newUrls[index])
      newUrls.splice(index, 1)
      return newUrls
    })
  }

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    const supabase = createClient()

    try {
      // 1. Crear producto (slug único a partir del nombre + timestamp)
      const baseSlug = slugify(data.name) || 'producto'
      const slug = `${baseSlug}-${Date.now()}`
      // No enviar brand_id: la columna puede no existir (schema cache)
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .insert({
          name: data.name,
          slug,
          description: data.description || null,
          materials_care: data.materials_care?.trim() || null,
          price: data.price,
          original_price: data.original_price || null,
          category_id: data.category_id,
          is_active: data.is_active,
          is_featured: data.is_featured,
          low_stock_alert: data.low_stock_alert,
        } as any)
        .select()
        .single()

      if (productError) throw productError
      const typedProduct = newProduct as any

      // 2. Crear variantes
      const variantsToInsert = data.variants.map((v: any, index: number) => ({
        product_id: typedProduct.id,
        size: v.size,
        stock: v.stock,
        display_order: index,
      }))
      const { error: variantError } = await supabase
        .from('product_variants')
        .insert(variantsToInsert as any)

      if (variantError) throw variantError

      // 3. Subir imágenes a Storage y registrar URLs
      if (images.length > 0) {
        for (let i = 0; i < images.length; i++) {
          const file = images[i]
          const fileExt = file.name.split('.').pop()
          const fileName = `${typedProduct.id}/${Date.now()}-${i}.${fileExt}`

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file)

          if (uploadError) throw uploadError

          const { data: publicUrlData } = supabase.storage
            .from('product-images')
            .getPublicUrl(fileName)

          await supabase.from('product_images').insert({
            product_id: typedProduct.id,
            image_url: publicUrlData.publicUrl,
            is_primary: i === 0,
            display_order: i,
          } as any)
        }
      }

      await revalidateStore('product', typedProduct.slug ?? undefined)
      router.push('/admin/productos')
      router.refresh()
    } catch (error: any) {
      console.error('Error al crear producto:', error)
      const msg = error?.message || error?.error_description || String(error)
      alert(`Error al crear producto: ${msg}`)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/productos"
          className="p-2 border border-border rounded-md hover:bg-surface-hover transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold font-heading">Nuevo Producto</h1>
          <p className="text-sm text-foreground-muted">
            Agrega un nuevo artículo a tu catálogo.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Columna principal (Datos generales) */}
          <div className="md:col-span-2 space-y-6">
            {/* Básicos */}
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">
                Información Básica
              </h2>

              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                  placeholder="Ej: Camiseta Oversize 'El Patrón'"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-error">{errors.name.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Categoría</label>
                  <select
                    {...register('category_id')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                  >
                    <option value="">Selecciona...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  {errors.category_id && (
                    <p className="mt-1 text-sm text-error">{errors.category_id.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Marca (opcional)</label>
                  <select
                    {...register('brand_id')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                  >
                    <option value="">Sin marca</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Materiales y cuidados</label>
                <textarea
                  {...register('materials_care')}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] resize-none"
                  placeholder="Ej: Composición 100% Algodón. Lavar en frío. No usar blanqueador."
                />
                <p className="mt-1 text-xs text-foreground-muted">Texto que se muestra en la ficha del producto en la sección &quot;Materiales y Cuidados&quot;. Opcional.</p>
              </div>
            </div>

            {/* Precios e Inventario */}
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">
                Precios e Inventario
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Precio Final (COP)
                  </label>
                  <input
                    type="number"
                    {...register('price')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                    placeholder="Ej: 85000"
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-error">{errors.price.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Precio Anterior (COP - Opcional)
                  </label>
                  <input
                    type="number"
                    {...register('original_price')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                    placeholder="Para mostrar descuento"
                  />
                </div>
              </div>

              {/* Guía de tallas — cuadro de referencia para no confundirse */}
              <div className="rounded-lg border border-border bg-background/50 p-4 mb-4">
                <p className="text-sm font-medium text-foreground mb-2">📐 Guía de tallas</p>
                <p className="text-xs text-foreground-muted mb-3">
                  Elige según la categoría del producto. Si es <strong>Calzado</strong> (chancletas, zapatos), usa tallas numéricas. Si es ropa, usa letras.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="font-medium text-foreground-muted mb-1">Ropa (camisetas, pantalones, etc.)</p>
                    <p className="text-foreground-muted">{SIZES_ROPA.join(' · ')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground-muted mb-1">Calzado (chancletas, zapatos)</p>
                    <p className="text-foreground-muted">35 · 36 · 37 · 38 · 39 · 40 · 41 · 42 · 43 · 44 · 45 · ÚNICO</p>
                  </div>
                </div>
                {categoryId && (
                  <p className="text-xs mt-2 text-[#E8E6E1]/80">
                    {isCalzado ? '✅ Categoría Calzado: se muestran tallas de calzado.' : '✅ Se muestran tallas de ropa.'}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border mt-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">
                    Variantes (Tallas y Stock) {isCalzado && <span className="text-foreground-muted font-normal">— calzado</span>}
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ size: isCalzado ? '39' : 'M', stock: 0 })}
                    className="text-xs text-[#E8E6E1] hover:text-[#E8E6E1]-hover flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Añadir variante
                  </button>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <select
                          {...register(`variants.${index}.size`)}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:border-[rgba(232,230,225,0.25)]"
                        >
                          <option value="">Talla...</option>
                          {availableSizes.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <label className="block text-[11px] font-medium text-foreground-muted mb-0.5">Unidades</label>
                        <input
                          type="number"
                          min={0}
                          {...register(`variants.${index}.stock`)}
                          placeholder="Ej: 10"
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:border-[rgba(232,230,225,0.25)]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        disabled={fields.length === 1}
                        className="p-2 text-foreground-muted hover:text-error transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {errors.variants && (
                    <p className="mt-1 text-sm text-error">{errors.variants.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Columna lateral (Imágenes y Visibilidad) */}
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">Imágenes</h2>
              
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
                <CameraOrGalleryInput
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  id="product-images"
                />
                <p className="text-xs text-foreground-muted">PNG, JPG, WEBP max 2MB. Galería permite varias a la vez.</p>
              </div>

              {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previewUrls.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-md overflow-hidden bg-background border border-border group">
                      <Image src={url} alt={`Preview ${i}`} fill className="object-cover" />
                      {i === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#E8E6E1]/90 text-background text-[10px] font-bold text-center py-0.5">
                          PRINCIPAL
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 p-1 bg-background/80 text-error rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">Visibilidad</h2>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_active')}
                  className="w-4 h-4 rounded border-border text-[#E8E6E1] focus:ring-gold bg-background"
                />
                <div>
                  <p className="text-sm font-medium">Producto Activo</p>
                  <p className="text-xs text-foreground-muted">Visible en la tienda</p>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  {...register('is_featured')}
                  className="w-4 h-4 rounded border-border text-[#E8E6E1] focus:ring-gold bg-background"
                />
                <div>
                  <p className="text-sm font-medium">Destacado</p>
                  <p className="text-xs text-foreground-muted">Mostrar en inicio ("Nuevos Drops")</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Acciones base */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
          <Link
            href="/admin/productos"
            className="px-6 py-3 font-medium text-foreground-muted hover:text-foreground transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#E8E6E1] text-background font-bold px-8 py-3 rounded-md hover:bg-[#E8E6E1]-hover transition-colors disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              'Crear Producto'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
