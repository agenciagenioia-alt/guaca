'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Store, Megaphone, Link as LinkIcon, AlertCircle, Share2, Type, ImageIcon, MessageSquare, Truck, Shirt } from 'lucide-react'
import { CameraOrGalleryInput } from '@/components/admin/CameraOrGalleryInput'

// Schema con mensajes amigables y validaciones específicas para Colombia
const configSchema = z.object({
  store_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  store_description: z.string().optional(),
  owner_whatsapp: z
    .string()
    .min(10, 'Ingresa un celular válido')
    .regex(/^573\d{9}$/, 'Debe empezar con 57 seguido de 3 y contener 12 dígitos en total. Ej: 573012345678'),
  wompi_payment_link: z
    .string()
    .url('Debe ser una URL válida de Wompi')
    .optional()
    .or(z.literal('')),
  instagram_url: z.string().url('URL inválida').optional().or(z.literal('')),
  tiktok_url: z.string().url('URL inválida').optional().or(z.literal('')),
  whatsapp_url: z.string().url('URL inválida').optional().or(z.literal('')),
  announcement_bar_text: z.string().optional(),
  announcement_bar_active: z.boolean().default(false),
  sold_out_message: z.string().optional(),
  sold_out_whatsapp_message: z.string().optional(),
  shipping_returns_text: z.string().optional(),
  hero_image_url: z.string().url('Debe ser una URL de imagen válida').optional().or(z.literal('')),
  hero_video_url: z.string().url('Debe ser una URL de video válida').optional().or(z.literal('')),
})

type ConfigForm = z.infer<typeof configSchema>

export default function AdminConfiguracionPage() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [outfitSectionEnabled, setOutfitSectionEnabled] = useState(false)
  const [selectedOutfitProductIds, setSelectedOutfitProductIds] = useState<string[]>([])
  const [outfitProductsList, setOutfitProductsList] = useState<{ id: string; name: string; slug: string }[]>([])

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(configSchema),
    defaultValues: {
      store_name: '',
      store_description: '',
      owner_whatsapp: '',
      wompi_payment_link: '',
      instagram_url: '',
      tiktok_url: '',
      whatsapp_url: '',
      announcement_bar_text: '',
      announcement_bar_active: false,
      sold_out_message: '',
      sold_out_whatsapp_message: '',
      shipping_returns_text: '',
      hero_image_url: '',
      hero_video_url: '',
    }
  })

  useEffect(() => {
    const fetchConfig = async () => {
      const supabase = createClient() as any
      const { data } = await supabase.from('store_config').select('*').eq('id', 1).single()
      const typedData = data as any // Type escape hatch since Supabase generic config might be incomplete

      if (typedData) {
        reset({
          store_name: typedData.store_name,
          store_description: typedData.store_description || '',
          owner_whatsapp: typedData.owner_whatsapp,
          wompi_payment_link: typedData.wompi_payment_link || '',
          instagram_url: typedData.instagram_url || '',
          tiktok_url: typedData.tiktok_url || '',
          whatsapp_url: typedData.whatsapp_url || '',
          announcement_bar_text: typedData.announcement_bar_text || '',
          announcement_bar_active: typedData.announcement_bar_active,
          sold_out_message: typedData.sold_out_message || '',
          sold_out_whatsapp_message: typedData.sold_out_whatsapp_message || '',
          shipping_returns_text: typedData.shipping_returns_text || '',
          hero_image_url: typedData.hero_image_url || '',
          hero_video_url: typedData.hero_video_url || '',
        })
        setOutfitSectionEnabled(Boolean(typedData.outfit_section_enabled))
        try {
          const ids = typedData.outfit_product_ids ? JSON.parse(typedData.outfit_product_ids) : []
          setSelectedOutfitProductIds(Array.isArray(ids) ? ids : [])
        } catch {
          setSelectedOutfitProductIds([])
        }
      }
      const { data: products } = await supabase.from('products').select('id, name, slug').eq('is_active', true).order('name')
      setOutfitProductsList((products || []) as { id: string; name: string; slug: string }[])
      setLoading(false)
    }
    fetchConfig()
  }, [reset])

  const onSubmit = async (data: any) => {
    setSubmitting(true)
    setMessage(null)
    try {
      const payload: Record<string, unknown> = {
        store_name: data.store_name,
        store_description: data.store_description || null,
        owner_whatsapp: data.owner_whatsapp,
        wompi_payment_link: data.wompi_payment_link || null,
        instagram_url: data.instagram_url || null,
        tiktok_url: data.tiktok_url || null,
        announcement_bar_text: data.announcement_bar_text || null,
        announcement_bar_active: data.announcement_bar_active,
        sold_out_message: data.sold_out_message?.trim() || null,
        sold_out_whatsapp_message: data.sold_out_whatsapp_message?.trim() || null,
        shipping_returns_text: data.shipping_returns_text?.trim() || null,
        hero_image_url: (data.hero_image_url || '').trim() || null,
        hero_video_url: data.hero_video_url || null,
        outfit_section_enabled: outfitSectionEnabled,
        outfit_product_ids: outfitSectionEnabled && selectedOutfitProductIds.length > 0 ? JSON.stringify(selectedOutfitProductIds) : null,
      }
      const formData = new FormData()
      formData.append('config', JSON.stringify(payload))
      if (heroImageFile) {
        setUploading(true)
        formData.append('heroImage', heroImageFile)
      }
      const res = await fetch('/api/admin/store-config', { method: 'POST', body: formData })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result?.error || res.statusText)
      setHeroImageFile(null)
      setMessage({ type: 'success', text: '¡Configuración guardada exitosamente!' })
      router.refresh()
      setTimeout(() => setMessage(null), 8000)
    } catch (err: unknown) {
      setUploading(false)
      const errorMessage = err instanceof Error ? err.message : String(err)
      console.error(err)
      setMessage({
        type: 'error',
        text: `Error al guardar: ${errorMessage}. Revisa tu conexión y que la tabla store_config tenga las columnas correctas.`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8E6E1]" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Configuración General</h1>
        <p className="text-sm text-foreground-muted">
          Ajusta los detalles globales de La Guaca.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-md border text-sm font-medium flex items-center gap-2 ${message.type === 'success' ? 'bg-success/10 border-success/30 text-success' : 'bg-error/10 border-error/30 text-error'
            }`}
        >
          {message.type === 'success' ? <Store className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-12">
        {/* Información Principal */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <Store className="w-5 h-5 text-[#E8E6E1]" />
            Información de la Tienda
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5 flex justify-between">
                <span>Nombre Oficial</span>
                <span className="text-error text-xs">*</span>
              </label>
              <input
                {...register('store_name')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="LA GUACA"
              />
              {errors.store_name && <p className="mt-1 text-sm text-error">{errors.store_name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 flex justify-between">
                <span>WhatsApp de Ventas (Indicativo 57)</span>
                <span className="text-error text-xs">*</span>
              </label>
              <input
                {...register('owner_whatsapp')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="573001234567"
              />
              <p className="mt-1 text-xs text-foreground-muted">Importante: Usa el formato 57 seguido de tu celular de 10 dígitos. A este número llegarán las notificaciones de ventas.</p>
              {errors.owner_whatsapp && <p className="mt-1 text-sm text-error">{errors.owner_whatsapp.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Descripción Corta (Meta y Nosotros)</label>
              <textarea
                {...register('store_description')}
                rows={4}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] resize-none transition-colors"
                placeholder="Streetwear nacido en Montería, Colombia..."
              />
            </div>
          </div>
        </div>

        {/* Pagos / Wompi */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <LinkIcon className="w-5 h-5 text-[#E8E6E1]" />
            Pagos (Wompi)
          </h2>

          <div>
            <label className="block text-sm font-medium mb-1.5">Link Mágico Wompi</label>
            <input
              {...register('wompi_payment_link')}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
              placeholder="https://checkout.wompi.co/l/VPOS_xyz"
            />
            <p className="mt-2 text-xs text-info bg-info/10 p-3 rounded-md border border-info/20 leading-relaxed">
              💡 <strong>Instrucciones Wompi:</strong> Crea un link de pago con nombre abierto y valor abierto en tu panel de Wompi. Pégalo aquí. Nosotros le pasaremos automáticamente el valor total al cliente usando <code>?reference=</code> en la URL final.
            </p>
            {errors.wompi_payment_link && <p className="mt-1 text-sm text-error">{errors.wompi_payment_link.message}</p>}
          </div>
        </div>

        {/* Mensaje producto agotado */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#E8E6E1]" />
            Mensaje cuando producto agotado
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Texto en ficha de producto (todas las tallas vendidas)</label>
            <textarea
              {...register('sold_out_message')}
              rows={3}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] resize-none transition-colors"
              placeholder="No disponible — Todas vendidas. Escríbenos por WhatsApp para saber más de otro producto semejante."
            />
            <p className="mt-2 text-xs text-foreground-muted">
              Este mensaje se muestra cuando un producto no tiene stock en ninguna talla. Si tienes configurado el WhatsApp de ventas, se mostrará un botón para contactar.
            </p>
            <div className="mt-4 pt-4 border-t border-border">
              <label className="block text-sm font-medium mb-1.5">Mensaje predeterminado para el link de WhatsApp</label>
              <textarea
                {...register('sold_out_whatsapp_message')}
                rows={2}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] resize-none transition-colors"
                placeholder="Hola, vi que {{product_name}} está agotado. ¿Tienen algo similar?"
              />
              <p className="mt-2 text-xs text-foreground-muted">
                Este texto se abrirá ya escrito en WhatsApp cuando el cliente haga clic en &quot;Escribir por WhatsApp&quot;. Usa <code className="bg-background px-1 rounded">{'{{product_name}}'}</code> para insertar el nombre del producto.
              </p>
            </div>
          </div>
        </div>

        {/* Completa tu outfit (carrito) */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <Shirt className="w-5 h-5 text-[#E8E6E1]" />
            Completa tu outfit (carrito)
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-background border border-border rounded-lg hover:border-[rgba(232,230,225,0.25)] transition-colors">
              <input
                type="checkbox"
                checked={outfitSectionEnabled}
                onChange={(e) => setOutfitSectionEnabled(e.target.checked)}
                className="w-4 h-4 rounded border-border text-[#E8E6E1] focus:ring-gold bg-background"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Mostrar sección &quot;Completa tu outfit&quot; en el carrito</span>
                <span className="text-xs text-foreground-muted">Cuando el cliente abre el carrito, verá productos sugeridos para agregar.</span>
              </div>
            </label>
            {outfitSectionEnabled && (
              <div className="pt-2 border-t border-border">
                <label className="block text-sm font-medium mb-2">Productos a mostrar (elige los que quieras)</label>
                <p className="text-xs text-foreground-muted mb-3">Marca los productos que quieres recomendar en el carrito. El orden aquí no define el orden en la tienda.</p>
                <div className="max-h-48 overflow-y-auto space-y-2 p-2 bg-background border border-border rounded-md">
                  {outfitProductsList.length === 0 ? (
                    <p className="text-sm text-foreground-muted">No hay productos activos. Crea productos en la sección Productos.</p>
                  ) : (
                    outfitProductsList.map((p) => (
                      <label key={p.id} className="flex items-center gap-3 cursor-pointer py-1.5 px-2 rounded hover:bg-surface-hover">
                        <input
                          type="checkbox"
                          checked={selectedOutfitProductIds.includes(p.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedOutfitProductIds((prev) => [...prev, p.id])
                            } else {
                              setSelectedOutfitProductIds((prev) => prev.filter((id) => id !== p.id))
                            }
                          }}
                          className="w-4 h-4 rounded border-border text-[#E8E6E1] bg-background"
                        />
                        <span className="text-sm text-foreground truncate">{p.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Envíos y devoluciones (texto en ficha de producto) */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <Truck className="w-5 h-5 text-[#E8E6E1]" />
            Envíos y devoluciones (ficha de producto)
          </h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Texto que ve el cliente en cada producto</label>
            <textarea
              {...register('shipping_returns_text')}
              rows={3}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] resize-none transition-colors"
              placeholder="Despachamos en 1-2 días hábiles a todo Colombia. Cambios habilitados dentro de los 5 días siguientes a la recepción del pedido."
            />
            <p className="mt-2 text-xs text-foreground-muted">
              Este texto se muestra en la sección &quot;Envíos y Devoluciones&quot; de cada ficha de producto en la tienda.
            </p>
          </div>
        </div>

        {/* Anuncio Top */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <Megaphone className="w-5 h-5 text-[#E8E6E1]" />
            Barra de Anuncios (Top)
          </h2>

          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer p-3 bg-background border border-border rounded-lg hover:border-[rgba(232,230,225,0.25)] transition-colors">
              <input
                type="checkbox"
                {...register('announcement_bar_active')}
                className="w-4 h-4 rounded border-border text-[#E8E6E1] focus:ring-gold bg-background"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold">Activar barra superior</span>
                <span className="text-xs text-foreground-muted">Mostrar u ocultar en toda la tienda</span>
              </div>
            </label>

            <div>
              <label className="block text-sm font-medium mb-1.5">Texto del anuncio</label>
              <input
                {...register('announcement_bar_text')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="Ej: ENVÍO GRATIS POR COMPRAS SUPERIORES A $150.000 COP 🔥"
              />
            </div>
          </div>
        </div>

        {/* Hero Visuals */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <ImageIcon className="w-5 h-5 text-[#E8E6E1]" />
            Visual y Hero (Banner Inicio)
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Imagen Hero (Banner)</label>
              <div className="flex flex-col gap-2">
                <CameraOrGalleryInput
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) { setHeroImageFile(f); setValue('hero_image_url', '') }
                    e.target.value = ''
                  }}
                  id="config-hero-image"
                />
                {heroImageFile && <p className="text-sm text-foreground-muted">📷 {heroImageFile.name}</p>}
                <p className="text-xs text-foreground-muted">o pega una URL</p>
                <input
                  {...register('hero_image_url')}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                  placeholder="https://tulink.com/imagen.jpg (Solo si no hay video)"
                  onInput={(e) => { if ((e.target as HTMLInputElement).value) setHeroImageFile(null) }}
                />
              </div>
              {errors.hero_image_url && <p className="mt-1 text-sm text-error">{errors.hero_image_url.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">URL Video Hero (MP4)</label>
              <input
                {...register('hero_video_url')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="https://tulink.com/video.mp4"
              />
              <p className="mt-1 text-xs text-foreground-muted">El video tiene prioridad sobre la imagen si ambos están configurados.</p>
              {errors.hero_video_url && <p className="mt-1 text-sm text-error">{errors.hero_video_url.message}</p>}
            </div>
          </div>
        </div>

        {/* Redes Sociales */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h2 className="text-lg font-bold font-heading flex items-center gap-2 mb-6">
            <Share2 className="w-5 h-5 text-[#E8E6E1]" />
            Redes Sociales
          </h2>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Instagram URL</label>
              <input
                {...register('instagram_url')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="https://instagram.com/laguaca"
              />
              {errors.instagram_url && <p className="mt-1 text-sm text-error">{errors.instagram_url.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">TikTok URL</label>
              <input
                {...register('tiktok_url')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="https://tiktok.com/@laguaca"
              />
              {errors.tiktok_url && <p className="mt-1 text-sm text-error">{errors.tiktok_url.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">WhatsApp URL</label>
              <input
                {...register('whatsapp_url')}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="https://wa.me/573001234567"
              />
              <p className="mt-1 text-xs text-foreground-muted">Formato: https://wa.me/57 + tu número sin espacios. Ej: https://wa.me/573116008237</p>
              {errors.whatsapp_url && <p className="mt-1 text-sm text-error">{errors.whatsapp_url.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-end gap-3">
          {(submitting || uploading) && (
            <div className="w-full max-w-md flex flex-col items-center gap-2">
              <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full w-[30%] bg-foreground/70 rounded-full admin-upload-indicator" />
              </div>
              <p className="text-xs text-foreground-muted">
                {uploading ? 'Subiendo imagen al servidor…' : 'Guardando cambios…'}
              </p>
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-[#E8E6E1] text-background font-bold px-8 py-3.5 rounded-md hover:bg-[#E8E6E1]-hover transition-colors disabled:opacity-50 text-lg shadow-lg hover:shadow-gold/20"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {uploading ? 'Subiendo imagen…' : 'Guardando…'}
              </>
            ) : (
              'Guardar Configuración'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
