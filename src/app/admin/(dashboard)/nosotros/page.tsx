'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, ImageIcon, Video, Upload, X } from 'lucide-react'
import NextImage from 'next/image'
import { CameraOrGalleryInput } from '@/components/admin/CameraOrGalleryInput'

const NOSOTROS_IG_KEYS = ['nosotros_ig_1_url', 'nosotros_ig_2_url', 'nosotros_ig_3_url', 'nosotros_ig_4_url', 'nosotros_ig_5_url', 'nosotros_ig_6_url'] as const

interface NosotrosConfig {
  nosotros_image_url: string
  nosotros_title: string
  nosotros_text_1: string
  nosotros_text_2: string
  nosotros_text_3: string
  sticky_video_url: string
  store_banner_video_url: string
  nosotros_ig_1_url: string
  nosotros_ig_2_url: string
  nosotros_ig_3_url: string
  nosotros_ig_4_url: string
  nosotros_ig_5_url: string
  nosotros_ig_6_url: string
}

export default function AdminNosotrosPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [form, setForm] = useState<NosotrosConfig>({
    nosotros_image_url: '',
    nosotros_title: 'Nacimos en Montería',
    nosotros_text_1: '',
    nosotros_text_2: '',
    nosotros_text_3: '',
    sticky_video_url: '',
    store_banner_video_url: '',
    nosotros_ig_1_url: '',
    nosotros_ig_2_url: '',
    nosotros_ig_3_url: '',
    nosotros_ig_4_url: '',
    nosotros_ig_5_url: '',
    nosotros_ig_6_url: '',
  })

  const igImageInputRef = useRef<HTMLInputElement>(null)
  const igCameraInputRef = useRef<HTMLInputElement>(null)
  const igSlotRef = useRef<number | null>(null)
  const [uploadingIgSlot, setUploadingIgSlot] = useState<number | null>(null)

  const supabase = createClient() as ReturnType<typeof createClient>

  useEffect(() => {
    const loadConfig = async () => {
      const baseFields = 'nosotros_image_url, nosotros_title, nosotros_text_1, nosotros_text_2, nosotros_text_3, sticky_video_url, store_banner_video_url'
      const igFields = ', nosotros_ig_1_url, nosotros_ig_2_url, nosotros_ig_3_url, nosotros_ig_4_url, nosotros_ig_5_url, nosotros_ig_6_url'

      let data: Record<string, string | null> | null = null
      const { data: fullData, error: fullError } = await (supabase as any)
        .from('store_config')
        .select(baseFields + igFields)
        .eq('id', 1)
        .single()

      if (fullError) {
        const { data: fallbackData } = await (supabase as any)
          .from('store_config')
          .select(baseFields)
          .eq('id', 1)
          .single()
        data = fallbackData
      } else {
        data = fullData
      }

      if (data) {
        setForm({
          nosotros_image_url: data.nosotros_image_url || '',
          nosotros_title: data.nosotros_title || 'Nacimos en Montería',
          nosotros_text_1: data.nosotros_text_1 || '',
          nosotros_text_2: data.nosotros_text_2 || '',
          nosotros_text_3: data.nosotros_text_3 || '',
          sticky_video_url: data.sticky_video_url || '',
          store_banner_video_url: data.store_banner_video_url || '',
          nosotros_ig_1_url: data.nosotros_ig_1_url || '',
          nosotros_ig_2_url: data.nosotros_ig_2_url || '',
          nosotros_ig_3_url: data.nosotros_ig_3_url || '',
          nosotros_ig_4_url: data.nosotros_ig_4_url || '',
          nosotros_ig_5_url: data.nosotros_ig_5_url || '',
          nosotros_ig_6_url: data.nosotros_ig_6_url || '',
        })
      }
      setLoading(false)
    }
    loadConfig()
  }, [])

  const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024 // 4 MB — por encima se sube directo a Supabase

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    if (file.size > LARGE_FILE_THRESHOLD) {
      const urlRes = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, filename: file.name }),
        credentials: 'include',
      })
      const urlData = await urlRes.json().catch(() => ({}))
      if (!urlRes.ok || !urlData.path || !urlData.token || !urlData.publicUrl) {
        const errMsg = urlData?.error || (urlRes.status === 401 ? 'Sesión expirada. Cierra sesión y vuelve a entrar al admin.' : `Error al obtener URL de subida (${urlRes.status})`)
        setMessage({ type: 'error', text: errMsg })
        return null
      }
      const { error } = await (supabase as any).storage.from('product-images').uploadToSignedUrl(urlData.path, urlData.token, file, { contentType: file.type || undefined })
      if (error) {
        setMessage({ type: 'error', text: error.message || 'Error subiendo archivo a Supabase.' })
        return null
      }
      return urlData.publicUrl
    }

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
    let data: { error?: string; url?: string } = {}
    try {
      const text = await res.text()
      if (text) data = JSON.parse(text)
    } catch {
      if (res.status === 413) data = { error: 'Archivo demasiado grande (máx. 4 MB). Comprime el video o usa uno más corto.' }
    }
    if (!res.ok) {
      const msg = res.status === 401
        ? (data?.error || 'Sesión expirada. Cierra sesión y vuelve a entrar al admin.')
        : res.status === 413
          ? (data?.error || 'Archivo demasiado grande. Comprime el video o usa uno más corto.')
          : (data?.error || `Error subiendo archivo (${res.status}). Revisa que SUPABASE_SERVICE_ROLE_KEY y el bucket "product-images" estén configurados en Vercel/Supabase.`)
      setMessage({ type: 'error', text: msg })
      return null
    }
    return data?.url || null
  }

  const saveStoreConfig = async (payload: Record<string, unknown>) => {
    const formData = new FormData()
    formData.append('config', JSON.stringify(payload))
    const res = await fetch('/api/admin/store-config', { method: 'POST', body: formData, credentials: 'include' })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data?.error || res.statusText)
    }
  }

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof NosotrosConfig,
    folder: string
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(field)
    const url = await uploadFile(file, folder)
    if (url) {
      const next = { ...form, [field]: url }
      setForm(next)
      try {
        await saveStoreConfig(next)
        setMessage({ type: 'success', text: '¡Archivo subido y guardado!' })
      } catch (e: any) {
        setMessage({ type: 'error', text: e?.message || 'Error al guardar' })
      }
    }
    setUploading(null)
    e.target.value = ''
    setTimeout(() => setMessage(null), 3000)
  }

  const handleIgImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const slot = igSlotRef.current
    const file = e.target.files?.[0]
    if (!file || slot == null || slot < 1 || slot > 6) return
    igSlotRef.current = null
    const field = NOSOTROS_IG_KEYS[slot - 1]
    setUploadingIgSlot(slot)
    const url = await uploadFile(file, 'nosotros-ig')
    if (url) {
      const next = { ...form, [field]: url }
      setForm(next)
      try {
        await saveStoreConfig(next)
        setMessage({ type: 'success', text: `Imagen ${slot} subida y guardada.` })
      } catch (e: any) {
        setMessage({ type: 'error', text: e?.message || 'Error al guardar. Si faltan columnas nosotros_ig_* en store_config, ejecuta la migración en Supabase.' })
      }
    }
    setUploadingIgSlot(null)
    e.target.value = ''
    setTimeout(() => setMessage(null), 5000)
  }

  const clearField = async (field: keyof NosotrosConfig) => {
    const next = { ...form, [field]: '' }
    setForm(next)
    try {
      await saveStoreConfig(next)
      setMessage({ type: 'success', text: '¡Campo eliminado!' })
    } catch (_) {
      setMessage({ type: 'error', text: 'Error al guardar' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    const payload = {
      nosotros_image_url: form.nosotros_image_url.trim() || null,
      nosotros_title: form.nosotros_title.trim() || null,
      nosotros_text_1: form.nosotros_text_1.trim() || null,
      nosotros_text_2: form.nosotros_text_2.trim() || null,
      nosotros_text_3: form.nosotros_text_3.trim() || null,
      sticky_video_url: form.sticky_video_url.trim() || null,
      store_banner_video_url: form.store_banner_video_url.trim() || null,
    }
    try {
      await saveStoreConfig(payload)
      setMessage({ type: 'success', text: '¡Sección Nosotros actualizada!' })
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Error al guardar' })
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Nosotros</h1>
        <p className="text-sm text-foreground-muted">
          Edita videos, imagen y textos de las secciones del homepage y la página Nosotros.
        </p>
      </div>

      {message && (
        <div className={`p-4 rounded-none border text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* ═══ VIDEO SECCIÓN CULTURA ═══ */}
      <div className="bg-surface border border-border rounded-none p-6 space-y-4">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video — Sección Cultura (Scroll)
        </h2>
        <p className="text-xs text-foreground-muted">
          Video de fondo de la sección con las palabras CULTURA / CALIDAD / EXCLUSIVIDAD. Ideal: interior de la tienda.
        </p>

        {form.sticky_video_url ? (
          <div className="space-y-3">
            <video
              src={form.sticky_video_url}
              className="w-full max-w-[500px] aspect-video object-cover bg-background border border-border"
              muted
              autoPlay
              loop
              playsInline
            />
            <div className="flex flex-wrap items-center gap-2">
              <CameraOrGalleryInput
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'sticky_video_url', 'nosotros-videos')}
                id="sticky-video"
                disabled={uploading === 'sticky_video_url'}
              />
              {uploading === 'sticky_video_url' && <Loader2 className="w-4 h-4 animate-spin" />}
              <button
                type="button"
                onClick={() => clearField('sticky_video_url')}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
              >
                <X className="w-4 h-4" />
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[500px] aspect-video border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-4">
            <span className="text-xs text-foreground-muted">Interior de la tienda</span>
            <CameraOrGalleryInput
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'sticky_video_url', 'nosotros-videos')}
              id="sticky-video-empty"
              disabled={uploading === 'sticky_video_url'}
            />
            {uploading === 'sticky_video_url' && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
        )}
      </div>

      {/* ═══ VIDEO BANNER VISÍTANOS ═══ */}
      <div className="bg-surface border border-border rounded-none p-6 space-y-4">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          <Video className="w-5 h-5" />
          Video — Banner &quot;Visítanos en Montería&quot;
        </h2>
        <p className="text-xs text-foreground-muted">
          Video de fondo del banner grande con la dirección de la tienda. Ideal: exterior de la tienda.
        </p>

        {form.store_banner_video_url ? (
          <div className="space-y-3">
            <video
              src={form.store_banner_video_url}
              className="w-full max-w-[500px] aspect-video object-cover bg-background border border-border"
              muted
              autoPlay
              loop
              playsInline
            />
            <div className="flex flex-wrap items-center gap-2">
              <CameraOrGalleryInput
                accept="video/*"
                onChange={(e) => handleFileUpload(e, 'store_banner_video_url', 'nosotros-videos')}
                id="banner-video"
                disabled={uploading === 'store_banner_video_url'}
              />
              {uploading === 'store_banner_video_url' && <Loader2 className="w-4 h-4 animate-spin" />}
              <button
                type="button"
                onClick={() => clearField('store_banner_video_url')}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
              >
                <X className="w-4 h-4" />
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[500px] aspect-video border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-4">
            <span className="text-xs text-foreground-muted">Exterior de la tienda</span>
            <CameraOrGalleryInput
              accept="video/*"
              onChange={(e) => handleFileUpload(e, 'store_banner_video_url', 'nosotros-videos')}
              id="banner-video-empty"
              disabled={uploading === 'store_banner_video_url'}
            />
            {uploading === 'store_banner_video_url' && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
        )}
      </div>

      {/* ═══ IMAGEN NUESTRA HISTORIA ═══ */}
      <div className="bg-surface border border-border rounded-none p-6 space-y-4">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Imagen — Nuestra Historia
        </h2>
        <p className="text-xs text-foreground-muted">
          Imagen que aparece junto al texto de historia en la página Nosotros.
        </p>

        {form.nosotros_image_url ? (
          <div className="space-y-3">
            <div className="relative w-full max-w-[300px] aspect-[4/5] bg-background border border-border overflow-hidden">
              <NextImage
                src={form.nosotros_image_url}
                alt="Preview"
                fill
                className="object-cover"
                sizes="300px"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <CameraOrGalleryInput
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'nosotros_image_url', 'nosotros-images')}
                id="nosotros-image"
                disabled={uploading === 'nosotros_image_url'}
              />
              {uploading === 'nosotros_image_url' && <Loader2 className="w-4 h-4 animate-spin" />}
              <button
                type="button"
                onClick={() => clearField('nosotros_image_url')}
                className="flex items-center gap-2 px-4 py-2 border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-colors"
              >
                <X className="w-4 h-4" />
                Quitar
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-[300px] aspect-[4/5] border-2 border-dashed border-border flex flex-col items-center justify-center gap-3 p-4">
            <CameraOrGalleryInput
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'nosotros_image_url', 'nosotros-images')}
              id="nosotros-image-empty"
              disabled={uploading === 'nosotros_image_url'}
            />
            {uploading === 'nosotros_image_url' && <Loader2 className="w-6 h-6 animate-spin" />}
          </div>
        )}
      </div>

      {/* ═══ IMÁGENES — EN INSTAGRAM (6 slots) ═══ */}
      <div className="bg-surface border border-border rounded-none p-6 space-y-4">
        <h2 className="text-lg font-bold font-heading flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Imágenes — En Instagram
        </h2>
        <p className="text-xs text-foreground-muted">
          Las 6 imágenes del grid &quot;Síguenos en Instagram&quot; en la página Nosotros. Sube una por cada slot o deja vacío para usar la imagen por defecto.
        </p>

        <input
          ref={igImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleIgImageUpload}
        />
        <input
          ref={igCameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleIgImageUpload}
        />

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {NOSOTROS_IG_KEYS.map((key, index) => {
            const slot = index + 1
            const url = form[key]
            return (
              <div key={key} className="border border-border rounded-none overflow-hidden bg-background">
                <div className="aspect-square relative bg-[#111]">
                  {url ? (
                    <NextImage src={url} alt={`Instagram ${slot}`} fill className="object-cover" sizes="200px" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-foreground-muted text-sm">
                      Slot {slot}
                    </div>
                  )}
                </div>
                <div className="p-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { igSlotRef.current = slot; setUploadingIgSlot(slot); igImageInputRef.current?.click() }}
                    disabled={uploadingIgSlot !== null}
                    className="flex-1 min-w-0 flex items-center justify-center gap-1 px-2 py-1.5 border border-border text-xs hover:bg-surface-hover transition-colors disabled:opacity-50"
                  >
                    {uploadingIgSlot === slot ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    {url ? 'Cambiar' : 'Galería'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { igSlotRef.current = slot; setUploadingIgSlot(slot); igCameraInputRef.current?.click() }}
                    disabled={uploadingIgSlot !== null}
                    className="flex items-center justify-center gap-1 px-2 py-1.5 border border-border text-xs hover:bg-surface-hover transition-colors disabled:opacity-50"
                    title="Tomar foto con la cámara"
                  >
                    📷 Cámara
                  </button>
                  <button
                    type="button"
                    onClick={() => clearField(key)}
                    className="px-2 py-1.5 border border-red-500/30 text-red-400 text-xs hover:bg-red-500/10 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ═══ TEXTOS ═══ */}
      <div className="bg-surface border border-border rounded-none p-6 space-y-4">
        <h2 className="text-lg font-bold font-heading">Textos — Nuestra Historia</h2>

        <div>
          <label className="block text-sm font-medium mb-1.5">Título</label>
          <input
            value={form.nosotros_title}
            onChange={(e) => setForm({ ...form, nosotros_title: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground"
            placeholder="Nacimos en Montería"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Párrafo 1</label>
          <textarea
            rows={3}
            value={form.nosotros_text_1}
            onChange={(e) => setForm({ ...form, nosotros_text_1: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground resize-y"
            placeholder="La Guaca nació con una misión clara..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Párrafo 2</label>
          <textarea
            rows={3}
            value={form.nosotros_text_2}
            onChange={(e) => setForm({ ...form, nosotros_text_2: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground resize-y"
            placeholder="Somos una multi-brand store..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Párrafo 3</label>
          <textarea
            rows={3}
            value={form.nosotros_text_3}
            onChange={(e) => setForm({ ...form, nosotros_text_3: e.target.value })}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground resize-y"
            placeholder="No somos una tienda más..."
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 bg-foreground text-background font-bold px-6 py-3 rounded-none hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Guardar cambios
      </button>
    </div>
  )
}
