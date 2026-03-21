'use client'

import { useState } from 'react'
import { Loader2, X, Upload, Trash2 } from 'lucide-react'
import Image from 'next/image'
import type { MoneriaProduct } from '@/lib/moneria'
import { createClient } from '@/lib/supabase/client'

const SIZES_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Única']
const LARGE_FILE_THRESHOLD = 4 * 1024 * 1024

interface MoneriaProductFormProps {
  initial?: Partial<MoneriaProduct>
  onClose: () => void
  onSaved: () => void
}

export function MoneriaProductForm({ initial, onClose, onSaved }: MoneriaProductFormProps) {
  const isEdit = Boolean(initial?.id)

  const [name, setName] = useState(initial?.name ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [price, setPrice] = useState(initial?.price ? String(initial.price) : '')
  const [stock, setStock] = useState(initial?.stock ? String(initial.stock) : '0')
  const [sizes, setSizes] = useState<string[]>(initial?.sizes ?? [])
  const [isActive, setIsActive] = useState(initial?.is_active ?? true)
  const [isFeatured, setIsFeatured] = useState(initial?.is_featured ?? false)
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? '')
  const [secondImageUrl, setSecondImageUrl] = useState(initial?.second_image_url ?? '')

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [secondImageFile, setSecondImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState(initial?.image_url ?? '')
  const [secondImagePreview, setSecondImagePreview] = useState(initial?.second_image_url ?? '')

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = createClient() as any

  const toggleSize = (size: string) => {
    setSizes((prev) => prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size])
  }

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'hover') => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    if (type === 'main') { setImageFile(file); setImagePreview(url) }
    else { setSecondImageFile(file); setSecondImagePreview(url) }
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    if (file.size > LARGE_FILE_THRESHOLD) {
      const urlRes = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'moneria', filename, bucket: 'moneria-products' }),
        credentials: 'include',
      })
      const urlData = await urlRes.json().catch(() => ({}))
      if (!urlRes.ok || !urlData.path || !urlData.token || !urlData.publicUrl) {
        const err = urlData?.error || `Error al obtener URL de subida (${urlRes.status})`
        setMessage({ type: 'error', text: err })
        return null
      }
      const { error } = await supabase.storage
        .from('moneria-products')
        .uploadToSignedUrl(urlData.path, urlData.token, file, { contentType: file.type })
      if (error) { setMessage({ type: 'error', text: error.message }); return null }
      return urlData.publicUrl
    }

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', 'moneria')
    fd.append('bucket', 'moneria-products')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd, credentials: 'include' })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { setMessage({ type: 'error', text: data?.error || `Error subiendo imagen (${res.status})` }); return null }
    return data?.url || null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !price) { setMessage({ type: 'error', text: 'Nombre y precio son obligatorios' }); return }

    setSaving(true)
    setMessage(null)

    try {
      let finalImageUrl = imageUrl
      let finalSecondUrl = secondImageUrl

      if (imageFile) {
        const uploaded = await uploadFile(imageFile)
        if (!uploaded) { setSaving(false); return }
        finalImageUrl = uploaded
      }
      if (secondImageFile) {
        const uploaded = await uploadFile(secondImageFile)
        if (!uploaded) { setSaving(false); return }
        finalSecondUrl = uploaded
      }

      if (!finalImageUrl) { setMessage({ type: 'error', text: 'La imagen principal es obligatoria' }); setSaving(false); return }

      const payload = {
        name: name.trim(),
        description: description.trim() || null,
        price: Math.round(Number(price)),
        stock: Number(stock) || 0,
        sizes,
        is_active: isActive,
        is_featured: isFeatured,
        image_url: finalImageUrl,
        second_image_url: finalSecondUrl || null,
        updated_at: new Date().toISOString(),
      }

      let apiRes: Response
      if (isEdit && initial?.id) {
        apiRes = await fetch('/api/admin/moneria/products', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: initial.id, ...payload }),
          credentials: 'include',
        })
      } else {
        apiRes = await fetch('/api/admin/moneria/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          credentials: 'include',
        })
      }

      const apiData = await apiRes.json().catch(() => ({}))
      if (!apiRes.ok) throw new Error(apiData?.error || `Error al guardar (${apiRes.status})`)
      setMessage({ type: 'success', text: isEdit ? 'Producto actualizado' : 'Producto creado' })
      setTimeout(() => { onSaved(); onClose() }, 700)
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 backdrop-blur-sm overflow-y-auto py-8 px-4">
      <div className="bg-surface border border-border w-full max-w-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-display text-lg tracking-widest text-foreground uppercase">
            {isEdit ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-hover transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
              Nombre del producto *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
              placeholder="Ej: Camiseta Monería Oversize"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground resize-none"
              placeholder="Describe el producto..."
            />
          </div>

          {/* Precio y Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
                Precio (COP) *
              </label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                placeholder="85000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
                Stock
              </label>
              <input
                type="number"
                min="0"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
              />
            </div>
          </div>

          {/* Tallas */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-2">
              Tallas disponibles
            </label>
            <div className="flex flex-wrap gap-2">
              {SIZES_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-3 py-1 text-xs font-medium border transition-colors ${
                    sizes.includes(s)
                      ? 'bg-foreground text-background border-foreground'
                      : 'bg-background text-foreground border-border hover:border-foreground-muted'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Imagen principal */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-2">
              Imagen principal *
            </label>
            <div className="flex gap-3 items-start">
              {imagePreview && (
                <div className="relative w-16 h-20 flex-shrink-0 bg-surface border border-border overflow-hidden">
                  <Image src={imagePreview} alt="preview" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(''); setImageUrl('') }}
                    className="absolute top-0 right-0 bg-error text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-background hover:border-foreground-muted transition-colors cursor-pointer py-4 px-3 text-center">
                <Upload className="w-4 h-4 text-foreground-muted" />
                <span className="text-xs text-foreground-muted">Subir imagen</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, 'main')} />
              </label>
            </div>
          </div>

          {/* Imagen hover */}
          <div>
            <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-2">
              Imagen hover (opcional)
            </label>
            <div className="flex gap-3 items-start">
              {secondImagePreview && (
                <div className="relative w-16 h-20 flex-shrink-0 bg-surface border border-border overflow-hidden">
                  <Image src={secondImagePreview} alt="preview hover" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    onClick={() => { setSecondImageFile(null); setSecondImagePreview(''); setSecondImageUrl('') }}
                    className="absolute top-0 right-0 bg-error text-white p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              <label className="flex-1 flex flex-col items-center justify-center gap-2 border border-dashed border-border bg-background hover:border-foreground-muted transition-colors cursor-pointer py-4 px-3 text-center">
                <Upload className="w-4 h-4 text-foreground-muted" />
                <span className="text-xs text-foreground-muted">Subir imagen hover</span>
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImagePick(e, 'hover')} />
              </label>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Activo</span>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative w-10 h-5 transition-colors ${isActive ? 'bg-foreground' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 bg-background transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-foreground">Destacado</span>
              <button
                type="button"
                onClick={() => setIsFeatured(!isFeatured)}
                className={`relative w-10 h-5 transition-colors ${isFeatured ? 'bg-foreground' : 'bg-border'}`}
              >
                <span className={`absolute top-0.5 h-4 w-4 bg-background transition-transform ${isFeatured ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </label>
          </div>

          {/* Message */}
          {message && (
            <div className={`px-4 py-3 text-sm ${message.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
              {message.text}
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-border py-3 text-sm font-medium text-foreground-muted hover:text-foreground hover:border-foreground-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-foreground text-background py-3 text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {saving ? 'Guardando...' : isEdit ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
