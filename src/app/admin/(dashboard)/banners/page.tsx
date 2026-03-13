'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, Loader2, Image as ImageIcon, Video, X } from 'lucide-react'
import Image from 'next/image'
import { CameraOrGalleryInput } from '@/components/admin/CameraOrGalleryInput'

export default function AdminBannersPage() {
  const [imageUrl, setImageUrl] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'video' | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [videoPreviewError, setVideoPreviewError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient() as any

  useEffect(() => {
    supabase
      .from('store_config')
      .select('hero_image_url, hero_video_url')
      .eq('id', 1)
      .single()
      .then(({ data }: { data: { hero_image_url: string | null; hero_video_url: string | null } | null }) => {
        if (data) {
          setImageUrl(data.hero_image_url || '')
          setVideoUrl(data.hero_video_url || '')
        }
        setLoading(false)
      })
  }, [])

  const LARGE_FILE = 4 * 1024 * 1024 // 4 MB — por encima se sube directo a Supabase

  const handleSave = async () => {
    setSaving(true)
    try {
      let finalVideoUrl = videoUrl.trim() || null
      if (videoFile) {
        setUploadType('video')
        setUploading(true)
        if (videoFile.size > LARGE_FILE) {
          const urlRes = await fetch('/api/admin/upload-url', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: 'hero/videos', filename: videoFile.name }),
            credentials: 'include',
          })
          const urlData = await urlRes.json().catch(() => ({}))
          if (!urlRes.ok || !urlData.path || !urlData.token || !urlData.publicUrl) {
            throw new Error(urlData?.error || 'Error al obtener URL de subida para el video')
          }
          const { error } = await supabase.storage.from('product-images').uploadToSignedUrl(urlData.path, urlData.token, videoFile, { contentType: videoFile.type || 'video/mp4' })
          if (error) throw new Error(error.message)
          finalVideoUrl = urlData.publicUrl
        }
        setUploading(false)
        setUploadType(null)
      }

      const formData = new FormData()
      formData.append('config', JSON.stringify({
        hero_image_url: imageUrl.trim() || null,
        hero_video_url: finalVideoUrl,
      }))
      if (imageFile) {
        setUploadType('image')
        setUploading(true)
        formData.append('heroImage', imageFile)
      }
      if (videoFile && videoFile.size <= LARGE_FILE) {
        setUploadType('video')
        setUploading(true)
        formData.append('heroVideo', videoFile)
      }
      const res = await fetch('/api/admin/store-config', { method: 'POST', body: formData, credentials: 'include' })
      const result = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(result?.error || res.statusText)
      setMessage({ type: 'success', text: '¡Hero actualizado! Los cambios ya se ven en la tienda.' })
      setImageFile(null)
      setVideoFile(null)
      if (videoFile) setVideoUrl(videoFile.size > LARGE_FILE ? (finalVideoUrl || '') : '')
    } catch (e: any) {
      setMessage({ type: 'error', text: e?.message || 'Error al subir.' })
    }
    setUploading(false)
    setUploadType(null)
    setSaving(false)
    setTimeout(() => setMessage(null), 5000)
  }

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Banner Hero</h1>
          <p className="text-sm text-foreground-muted">
            Cambia la imagen o video del hero directamente aquí.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-foreground text-background font-bold px-5 py-2.5 rounded-none hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? (uploading ? (uploadType === 'video' ? 'Subiendo video…' : 'Subiendo imagen…') : 'Guardando…') : 'Guardar Cambios'}
        </button>
      </div>

      {message && (
        <div className={`p-4 border text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {(saving || uploading) && (
        <div className="flex flex-col gap-2">
          <div className="h-1 w-full max-w-xs bg-border rounded-full overflow-hidden">
            <div className="h-full w-[30%] bg-foreground/70 rounded-full admin-upload-indicator" />
          </div>
          <p className="text-xs text-foreground-muted">
            {uploading ? (uploadType === 'video' ? 'Subiendo video al servidor…' : 'Subiendo imagen al servidor…') : 'Guardando cambios…'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imagen */}
        <div className="bg-surface border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <ImageIcon className="w-5 h-5 text-foreground-muted" />
            <h3 className="font-bold text-lg">Imagen del Hero</h3>
          </div>
          <p className="text-xs text-foreground-muted">
            Sube un archivo o pega la URL. Se usará si no hay video configurado.
          </p>
          <CameraOrGalleryInput
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) { setImageFile(f); setImageUrl('') }
              e.target.value = ''
            }}
            id="hero-image"
          />
          {imageFile && <p className="text-sm text-foreground-muted">📷 {imageFile.name}</p>}
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="flex-1 h-px bg-border" />
            <span>o pega URL</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <div className="flex gap-2">
            <input
              value={imageUrl}
              onChange={(e) => { setImageUrl(e.target.value); if (e.target.value) setImageFile(null) }}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-none text-foreground text-sm"
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {(imageUrl || imageFile) && (
              <button
                onClick={() => { setImageUrl(''); setImageFile(null) }}
                className="p-2 text-foreground-muted hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Preview */}
          <div className="relative aspect-video bg-background border border-border overflow-hidden">
            {(imageUrl || imageFile) ? (
              imageFile ? (
                <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image src={imageUrl} alt="Preview" fill className="object-cover" unoptimized />
              )
            ) : (
              <div className="flex items-center justify-center h-full text-foreground-muted text-sm">
                Sin imagen configurada
              </div>
            )}
          </div>
        </div>

        {/* Video */}
        <div className="bg-surface border border-border p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Video className="w-5 h-5 text-foreground-muted" />
            <h3 className="font-bold text-lg">Video del Hero</h3>
          </div>
          <p className="text-xs text-foreground-muted">
            Sube un archivo de video (MP4/WebM) o pega la URL. Tiene prioridad sobre la imagen.
          </p>
          <CameraOrGalleryInput
            accept="video/mp4,video/webm,video/quicktime,video/*"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) { setVideoFile(f); setVideoUrl('') }
              e.target.value = ''
            }}
            id="hero-video"
          />
          {videoFile && <p className="text-sm text-foreground-muted">🎬 {videoFile.name}</p>}
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <span className="flex-1 h-px bg-border" />
            <span>o pega URL</span>
            <span className="flex-1 h-px bg-border" />
          </div>
          <div className="flex gap-2">
            <input
              value={videoUrl}
              onChange={(e) => { setVideoUrl(e.target.value); if (e.target.value) { setVideoFile(null); setVideoPreviewError(false) } }}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-none text-foreground text-sm"
              placeholder="https://ejemplo.com/video.mp4"
            />
            {(videoUrl || videoFile) && (
              <button
                onClick={() => { setVideoUrl(''); setVideoFile(null) }}
                className="p-2 text-foreground-muted hover:text-red-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          {/* Preview */}
          <div className="relative aspect-video bg-background border border-border overflow-hidden">
            {(videoUrl || videoFile) ? (
              videoFile ? (
                <video
                  key={videoFile.name + videoFile.size}
                  src={URL.createObjectURL(videoFile)}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <>
                  {videoPreviewError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface p-4 text-center z-10">
                      <p className="text-sm text-foreground-muted">No se pudo cargar la vista previa de esta URL.</p>
                      <p className="text-xs text-foreground-subtle">Sube el video desde tu PC para que funcione en la tienda.</p>
                    </div>
                  )}
                  <video
                    key={videoUrl}
                    src={videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="w-full h-full object-cover"
                    onError={() => setVideoPreviewError(true)}
                    onLoadedData={() => setVideoPreviewError(false)}
                  />
                </>
              )
            ) : (
              <div className="flex items-center justify-center h-full text-foreground-muted text-sm">
                Sin video configurado
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-surface border border-border p-4 text-xs text-foreground-muted">
        <strong>💡 Tip:</strong> El video tiene prioridad. Si configuras ambos, se mostrará el video. Para mostrar solo la imagen, deja el video vacío.
      </div>
    </div>
  )
}
