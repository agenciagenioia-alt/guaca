'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateStore } from '@/app/admin/actions'
import { Plus, Trash2, GripVertical, Image as ImageIcon, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { CameraOrGalleryInput } from '@/components/admin/CameraOrGalleryInput'

interface GalleryImage {
  id: string
  image_url: string
  alt_text: string
  display_order: number
  is_active: boolean
}

export default function AdminGaleriaPage() {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newAlt, setNewAlt] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient() as any

  const fetchImages = async () => {
    const { data } = await supabase
      .from('gallery_images')
      .select('*')
      .order('display_order')
    if (data) setImages(data)
    setLoading(false)
  }

  useEffect(() => { fetchImages() }, [])

  const addImage = async () => {
    if (!newUrl.trim() && !newImageFile) return
    setSaving(true)
    let imageUrl = newUrl.trim()
    try {
      if (newImageFile) {
        setUploading(true)
        const ext = newImageFile.name.split('.').pop() || 'jpg'
        const path = `gallery/${crypto.randomUUID()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(path, newImageFile, { upsert: true })
        setUploading(false)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path)
        imageUrl = urlData.publicUrl
      }
      const { error } = await supabase.from('gallery_images').insert({
        image_url: imageUrl,
        alt_text: newAlt.trim() || 'La Guaca',
        display_order: images.length,
        is_active: true,
      })
      if (error) {
        setMessage({ type: 'error', text: 'Error al agregar imagen. Verifica permisos.' })
      } else {
        await revalidateStore('gallery')
        setMessage({ type: 'success', text: '¡Imagen agregada!' })
        setNewUrl('')
        setNewImageFile(null)
        setNewAlt('')
        setShowAdd(false)
        await fetchImages()
      }
    } catch (e: any) {
      setUploading(false)
      setMessage({ type: 'error', text: e?.message || 'Error al subir imagen.' })
    }
    setSaving(false)
    setTimeout(() => setMessage(null), 3000)
  }

  const deleteImage = async (id: string) => {
    if (!confirm('¿Eliminar esta imagen de la galería?')) return
    const { error } = await supabase.from('gallery_images').delete().eq('id', id)
    if (!error) {
      setImages(prev => prev.filter(img => img.id !== id))
      await revalidateStore('gallery')
      setMessage({ type: 'success', text: 'Imagen eliminada.' })
    } else {
      setMessage({ type: 'error', text: 'Error al eliminar.' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase
      .from('gallery_images')
      .update({ is_active: !current })
      .eq('id', id)
    if (!error) {
      setImages(prev => prev.map(img => img.id === id ? { ...img, is_active: !current } : img))
      await revalidateStore('gallery')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-foreground-muted" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Galería La Guaca</h1>
          <p className="text-sm text-foreground-muted">
            Fotos del negocio que aparecen en la sección &quot;La Guaca&quot; de la home.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 bg-foreground text-background font-bold px-4 py-2 rounded-none hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Agregar Imagen
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-none border text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Modal para agregar */}
      {showAdd && (
        <div className="bg-surface border border-border p-6 rounded-none space-y-4">
          <h3 className="font-bold font-heading text-lg">Nueva Imagen</h3>
          <div>
            <label className="block text-sm font-medium mb-1.5">Imagen</label>
            <CameraOrGalleryInput
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) { setNewImageFile(f); setNewUrl('') }
                e.target.value = ''
              }}
              id="galeria-new"
              className="mb-2"
            />
            {newImageFile && <p className="text-sm text-foreground-muted mb-2">📷 {newImageFile.name}</p>}
            <p className="text-xs text-foreground-muted mb-2">o pega una URL</p>
            <input
              value={newUrl}
              onChange={(e) => { setNewUrl(e.target.value); if (e.target.value) setNewImageFile(null) }}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground"
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Texto alternativo</label>
            <input
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground"
              placeholder="Descripción de la imagen"
            />
          </div>
          {(saving || uploading) && (
            <div className="flex flex-col gap-2">
              <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                <div className="h-full w-[30%] bg-foreground/70 rounded-full admin-upload-indicator" />
              </div>
              <p className="text-xs text-foreground-muted">
                {uploading ? 'Subiendo imagen al servidor…' : 'Guardando…'}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={addImage}
              disabled={saving || (!newUrl.trim() && !newImageFile)}
              className="bg-foreground text-background font-bold px-6 py-2.5 rounded-none hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {saving ? (uploading ? 'Subiendo imagen…' : 'Guardando…') : 'Guardar'}
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="border border-border text-foreground px-6 py-2.5 rounded-none hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Grid de imágenes */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img) => (
          <div key={img.id} className="relative group bg-surface border border-border rounded-none overflow-hidden">
            <div className="relative aspect-[3/4]">
              <Image
                src={img.image_url}
                alt={img.alt_text}
                fill
                className={`object-cover ${!img.is_active ? 'opacity-30 grayscale' : ''}`}
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              {!img.is_active && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
                  <span className="text-xs font-mono uppercase tracking-widest text-foreground-muted">Oculta</span>
                </div>
              )}
            </div>
            <div className="p-3 flex items-center justify-between">
              <p className="text-xs text-foreground-muted truncate flex-1 mr-2">{img.alt_text}</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(img.id, img.is_active)}
                  className={`text-xs font-mono px-2 py-1 border rounded-none transition-colors ${img.is_active ? 'border-green-500/30 text-green-400 hover:bg-green-500/10' : 'border-border text-foreground-muted hover:bg-surface'}`}
                >
                  {img.is_active ? 'Visible' : 'Oculta'}
                </button>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="text-red-400 hover:text-red-300 transition-colors p-1"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <div className="text-center py-16 border border-dashed border-border rounded-none">
          <ImageIcon className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
          <p className="text-foreground-muted">No hay imágenes en la galería.</p>
          <p className="text-xs text-foreground-subtle mt-1">Agrega fotos del negocio para mostrar en la home.</p>
        </div>
      )}
    </div>
  )
}
