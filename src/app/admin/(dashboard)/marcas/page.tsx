'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, X, Loader2, Tag } from 'lucide-react'

interface Brand {
  id: string
  name: string
  description: string
  slug: string
  is_active: boolean
  display_order: number
}

export default function AdminMarcasPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formName, setFormName] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formSlug, setFormSlug] = useState('')

  const supabase = createClient() as any

  const fetchBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('display_order')
    if (data) setBrands(data)
    setLoading(false)
  }

  useEffect(() => { fetchBrands() }, [])

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

  const openCreate = () => {
    setEditingId(null)
    setFormName('')
    setFormDesc('')
    setFormSlug('')
    setShowModal(true)
  }

  const openEdit = (b: Brand) => {
    setEditingId(b.id)
    setFormName(b.name)
    setFormDesc(b.description)
    setFormSlug(b.slug)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)
    const slug = formSlug || generateSlug(formName)
    const payload = editingId
      ? { name: formName.trim(), description: formDesc.trim(), slug }
      : { name: formName.trim(), description: formDesc.trim(), slug, display_order: brands.length, is_active: true }
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table: 'brands',
        operation: editingId ? 'update' : 'insert',
        payload,
        ...(editingId && { id: editingId }),
      }),
    })
    const result = await res.json().catch(() => ({}))
    if (!res.ok) setMessage({ type: 'error', text: result?.error || 'Error.' })
    else setMessage({ type: 'success', text: editingId ? '¡Marca actualizada!' : '¡Marca agregada!' })
    setShowModal(false)
    setSaving(false)
    await fetchBrands()
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta marca?')) return
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'brands', operation: 'delete', id }),
    })
    if (res.ok) {
      setBrands(prev => prev.filter(b => b.id !== id))
      setMessage({ type: 'success', text: 'Marca eliminada.' })
    } else setMessage({ type: 'error', text: 'Error al eliminar.' })
    setTimeout(() => setMessage(null), 3000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const res = await fetch('/api/admin/mutate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ table: 'brands', operation: 'update', id, payload: { is_active: !current } }),
    })
    if (res.ok) setBrands(prev => prev.map(b => b.id === id ? { ...b, is_active: !current } : b))
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
          <h1 className="text-2xl font-bold font-heading">Marcas</h1>
          <p className="text-sm text-foreground-muted">
            Gestiona las marcas que aparecen en la tienda.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-foreground text-background font-bold px-4 py-2 rounded-none hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nueva Marca
        </button>
      </div>

      {message && (
        <div className={`p-4 border text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Grid de marcas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {brands.length === 0 ? (
          <div className="col-span-2 text-center py-16 border border-dashed border-border">
            <Tag className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
            <p className="text-foreground-muted">No hay marcas.</p>
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className={`bg-surface border border-border p-5 flex items-start justify-between gap-3 ${!brand.is_active ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading text-lg font-bold uppercase">{brand.name}</h3>
                  {!brand.is_active && <span className="text-[10px] font-mono text-foreground-muted uppercase">Oculta</span>}
                </div>
                <p className="text-sm text-foreground/60 leading-relaxed">{brand.description}</p>
                <span className="text-[10px] font-mono text-foreground/30 mt-1 block">/{brand.slug}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(brand.id, brand.is_active)}
                  className={`text-xs font-mono px-2 py-1 border rounded-none transition-colors ${brand.is_active ? 'border-green-500/30 text-green-400' : 'border-border text-foreground-muted'}`}
                >
                  {brand.is_active ? '✓' : '○'}
                </button>
                <button onClick={() => openEdit(brand)} className="p-2 text-foreground-muted hover:text-foreground transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(brand.id)} className="p-2 text-foreground-muted hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading">{editingId ? 'Editar Marca' : 'Nueva Marca'}</h3>
              <button onClick={() => setShowModal(false)} className="text-foreground-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Nombre *</label>
              <input value={formName} onChange={(e) => { setFormName(e.target.value); if (!editingId) setFormSlug(generateSlug(e.target.value)) }}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground" placeholder="NIKE · AIR FORCE 1" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Slug</label>
              <input value={formSlug} onChange={(e) => setFormSlug(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground font-mono text-sm" placeholder="nike-air-force-1" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Descripción</label>
              <textarea value={formDesc} onChange={(e) => setFormDesc(e.target.value)} rows={2}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground resize-none"
                placeholder="Breve descripción de la marca..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || !formName.trim()}
                className="flex-1 bg-foreground text-background font-bold py-3 rounded-none hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingId ? 'Guardar Cambios' : 'Crear Marca'}
              </button>
              <button onClick={() => setShowModal(false)} className="px-6 py-3 border border-border text-foreground rounded-none hover:bg-surface transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
