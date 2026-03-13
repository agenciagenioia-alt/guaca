'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, Trash2, ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { revalidateStore } from '@/app/admin/actions'
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
      id: z.string().optional(),
      size: z.string().min(1),
      stock: z.coerce.number().min(0, 'El stock no puede ser negativo'),
    })
  ).min(1, 'Debe haber al menos una variante'),
})

type ProductForm = z.infer<typeof productSchema>

type ProductImage = { id: string; image_url: string; is_primary: boolean; display_order: number }
type ProductVariant = { id: string; size: string; stock: number; display_order: number }

export default function EditarProductoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [categories, setCategories] = useState<{ id: string; name: string; slug: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string; slug: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [existingImages, setExistingImages] = useState<ProductImage[]>([])
  const [newImages, setNewImages] = useState<File[]>([])
  const [newPreviewUrls, setNewPreviewUrls] = useState<string[]>([])
  const [notFound, setNotFound] = useState(false)

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as any,
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
      variants: [{ size: 'M', stock: 0 }],
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const categoryId = watch('category_id')
  const isCalzado = categories.some(
    (c) => c.id === categoryId && (c.slug?.toLowerCase() === 'calzado' || c.name?.toLowerCase().includes('calzado'))
  )
  const availableSizes = isCalzado ? SIZES_CALZADO : SIZES_ROPA

  useEffect(() => {
    const fetchLookups = async () => {
      const supabase = createClient()
      const [{ data: catData }, { data: brandData }] = await Promise.all([
        supabase.from('categories').select('id, name, slug'),
        supabase.from('brands').select('id, name, slug').eq('is_active', true).order('display_order'),
      ])
      if (catData) setCategories(catData)
      if (brandData) setBrands(brandData)
    }
    fetchLookups()
  }, [])

  useEffect(() => {
    if (!id) return
    const fetchProduct = async () => {
      const supabase = createClient()
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()
      if (productError || !product) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const { data: variants } = await supabase
        .from('product_variants')
        .select('id, size, stock, display_order')
        .eq('product_id', id)
        .order('display_order')
      const { data: images } = await supabase
        .from('product_images')
        .select('id, image_url, is_primary, display_order')
        .eq('product_id', id)
        .order('display_order')
      const p = product as any
      setExistingImages((images as ProductImage[]) || [])
      reset({
        name: p.name,
        description: p.description || '',
        materials_care: p.materials_care || '',
        price: p.price,
        original_price: p.original_price ?? null,
        category_id: p.category_id || '',
        brand_id: p.brand_id || '',
        is_active: p.is_active ?? true,
        is_featured: p.is_featured ?? false,
        low_stock_alert: p.low_stock_alert ?? 5,
        variants: (variants as ProductVariant[])?.length
          ? (variants as ProductVariant[]).map((v) => ({ id: v.id, size: v.size, stock: v.stock }))
          : [{ size: 'M', stock: 0 }],
      })
      setLoading(false)
    }
    fetchProduct()
  }, [id, reset])

  const handleNewImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files)
      setNewImages((prev) => [...prev, ...filesArray])
      const newUrls = filesArray.map((f) => URL.createObjectURL(f))
      setNewPreviewUrls((prev) => [...prev, ...newUrls])
    }
    e.target.value = ''
  }

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index))
    setNewPreviewUrls((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index])
      next.splice(index, 1)
      return next
    })
  }

  const removeExistingImage = async (imageId: string) => {
    const supabase = createClient()
    await supabase.from('product_images').delete().eq('id', imageId)
    setExistingImages((prev) => prev.filter((img) => img.id !== imageId))
  }

  const onSubmit = async (data: ProductForm) => {
    if (!id) return
    setSubmitting(true)
    const supabase = createClient()
    try {
      const payloadWithBrand = {
        name: data.name,
        description: data.description || null,
        materials_care: data.materials_care?.trim() || null,
        price: data.price,
        original_price: data.original_price || null,
        category_id: data.category_id,
        brand_id: data.brand_id || null,
        is_active: data.is_active,
        is_featured: data.is_featured,
        low_stock_alert: data.low_stock_alert,
      }
      const payloadWithoutBrand = {
        name: data.name,
        description: data.description || null,
        materials_care: data.materials_care?.trim() || null,
        price: data.price,
        original_price: data.original_price || null,
        category_id: data.category_id,
        is_active: data.is_active,
        is_featured: data.is_featured,
        low_stock_alert: data.low_stock_alert,
      }

      let updateError = (await (supabase as any).from('products').update(payloadWithBrand).eq('id', id)).error
      if (updateError?.message?.includes('brand_id')) {
        updateError = (await (supabase as any).from('products').update(payloadWithoutBrand).eq('id', id)).error
      }
      if (updateError) throw updateError

      await supabase.from('product_variants').delete().eq('product_id', id)
      const variantsToInsert = data.variants.map((v, index) => ({
        product_id: id,
        size: v.size,
        stock: v.stock,
        display_order: index,
      }))
      const { error: variantError } = await supabase.from('product_variants').insert(variantsToInsert as any)
      if (variantError) throw variantError

      if (newImages.length > 0) {
        const existingCount = existingImages.length
        for (let i = 0; i < newImages.length; i++) {
          const file = newImages[i]
          const ext = file.name.split('.').pop() || 'jpg'
          const fileName = `${id}/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
          await supabase.from('product_images').insert({
            product_id: id,
            image_url: urlData.publicUrl,
            is_primary: existingCount === 0 && i === 0,
            display_order: existingCount + i,
          } as any)
        }
      }

      const { data: updated } = await supabase.from('products').select('slug').eq('id', id).single()
      await revalidateStore('product', (updated as any)?.slug)
      router.push('/admin/productos')
      router.refresh()
    } catch (error: any) {
      console.error('Error al actualizar producto:', error)
      alert(`Error al guardar: ${error?.message || String(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <p className="text-foreground-muted">Producto no encontrado.</p>
        <Link href="/admin/productos" className="text-[#E8E6E1] hover:underline">
          Volver a Productos
        </Link>
      </div>
    )
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
          <h1 className="text-2xl font-bold font-heading">Editar Producto</h1>
          <p className="text-sm text-foreground-muted">Modifica la información del artículo.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">Información Básica</h2>
              <div>
                <label className="block text-sm font-medium mb-1.5">Nombre</label>
                <input
                  {...register('name')}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                  placeholder="Ej: Camiseta Oversize"
                />
                {errors.name && <p className="mt-1 text-sm text-error">{errors.name.message}</p>}
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
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.category_id && <p className="mt-1 text-sm text-error">{errors.category_id.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Marca (opcional)</label>
                  <select
                    {...register('brand_id')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                  >
                    <option value="">Sin marca</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Descripción</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Materiales y cuidados</label>
                <textarea
                  {...register('materials_care')}
                  rows={3}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground resize-none"
                  placeholder="Ej: Composición 100% Algodón. Lavar en frío."
                />
              </div>
            </div>

            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">Precios e Inventario</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Precio Final (COP)</label>
                  <input
                    type="number"
                    {...register('price')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground"
                  />
                  {errors.price && <p className="mt-1 text-sm text-error">{errors.price.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Precio Anterior (COP - Opcional)</label>
                  <input
                    type="number"
                    {...register('original_price')}
                    className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground"
                    placeholder="Para mostrar descuento"
                  />
                </div>
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
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
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
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md"
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
                  {errors.variants && <p className="mt-1 text-sm text-error">{errors.variants.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold font-heading mb-4">Imágenes</h2>
              {existingImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {existingImages.map((img) => (
                    <div key={img.id} className="relative aspect-square rounded-md overflow-hidden bg-background border border-border group">
                      <Image src={img.image_url} alt="" fill className="object-cover" sizes="120px" />
                      {img.is_primary && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#E8E6E1]/90 text-background text-[10px] font-bold text-center py-0.5">
                          PRINCIPAL
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-1 right-1 p-1 bg-background/80 text-error rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center space-y-3">
                <CameraOrGalleryInput
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  id="edit-product-images"
                />
                <p className="text-xs text-foreground-muted">Cámara o galería. Galería permite varias a la vez.</p>
              </div>
              {newPreviewUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {newPreviewUrls.map((url, i) => (
                    <div key={url} className="relative aspect-square rounded-md overflow-hidden bg-background border border-border group">
                      <Image src={url} alt={`Nueva ${i}`} fill className="object-cover" sizes="120px" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(i)}
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
                <input type="checkbox" {...register('is_active')} className="w-4 h-4 rounded border-border text-[#E8E6E1] bg-background" />
                <div>
                  <p className="text-sm font-medium">Producto Activo</p>
                  <p className="text-xs text-foreground-muted">Visible en la tienda</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('is_featured')} className="w-4 h-4 rounded border-border text-[#E8E6E1] bg-background" />
                <div>
                  <p className="text-sm font-medium">Destacado</p>
                  <p className="text-xs text-foreground-muted">Mostrar en inicio</p>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-6 border-t border-border">
          <Link href="/admin/productos" className="px-6 py-3 font-medium text-foreground-muted hover:text-foreground">
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#E8E6E1] text-background font-bold px-8 py-3 rounded-md hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
