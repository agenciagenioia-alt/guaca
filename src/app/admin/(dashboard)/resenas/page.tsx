'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, X, Loader2, Star, MessageSquare } from 'lucide-react'

interface Review {
  id: string
  customer_name: string
  review_text: string
  rating: number
  is_active: boolean
  display_order: number
}

export default function AdminResenasPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formName, setFormName] = useState('')
  const [formText, setFormText] = useState('')
  const [formRating, setFormRating] = useState(5)
  const [formActive, setFormActive] = useState(true)

  const supabase = createClient() as any

  const fetchReviews = async () => {
    const { data } = await supabase.from('reviews').select('*').order('display_order')
    if (data) setReviews(data)
    setLoading(false)
  }

  useEffect(() => { fetchReviews() }, [])

  const openCreate = () => {
    setEditingId(null)
    setFormName('')
    setFormText('')
    setFormRating(5)
    setFormActive(true)
    setShowModal(true)
  }

  const openEdit = (r: Review) => {
    setEditingId(r.id)
    setFormName(r.customer_name)
    setFormText(r.review_text)
    setFormRating(r.rating)
    setFormActive(r.is_active)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formName.trim() || !formText.trim()) return
    setSaving(true)

    const payload = {
      customer_name: formName.trim(),
      review_text: formText.trim(),
      rating: formRating,
      is_active: formActive,
      display_order: editingId ? undefined : reviews.length,
    }

    if (editingId) {
      const { rating: _r, display_order: _d, ...updatePayload } = { ...payload }
      const { error } = await supabase.from('reviews').update({
        customer_name: formName.trim(),
        review_text: formText.trim(),
        rating: formRating,
        is_active: formActive,
      }).eq('id', editingId)
      if (error) setMessage({ type: 'error', text: 'Error al actualizar.' })
      else setMessage({ type: 'success', text: '¡Reseña actualizada!' })
    } else {
      const { error } = await supabase.from('reviews').insert(payload)
      if (error) setMessage({ type: 'error', text: 'Error al crear. Verifica permisos.' })
      else setMessage({ type: 'success', text: '¡Reseña agregada!' })
    }

    setShowModal(false)
    setSaving(false)
    await fetchReviews()
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta reseña?')) return
    const { error } = await supabase.from('reviews').delete().eq('id', id)
    if (!error) {
      setReviews(prev => prev.filter(r => r.id !== id))
      setMessage({ type: 'success', text: 'Reseña eliminada.' })
    } else setMessage({ type: 'error', text: 'Error al eliminar.' })
    setTimeout(() => setMessage(null), 3000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('reviews').update({ is_active: !current }).eq('id', id)
    if (!error) setReviews(prev => prev.map(r => r.id === id ? { ...r, is_active: !current } : r))
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
          <h1 className="text-2xl font-bold font-heading">Reseñas de Clientes</h1>
          <p className="text-sm text-foreground-muted">
            Gestiona las opiniones que aparecen en la home.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-foreground text-background font-bold px-4 py-2 rounded-none hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nueva Reseña
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-none border text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Lista de reseñas */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border">
            <MessageSquare className="w-12 h-12 text-foreground-muted mx-auto mb-4 opacity-50" />
            <p className="text-foreground-muted">No hay reseñas.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`bg-surface border border-border p-5 flex items-start gap-4 ${!review.is_active ? 'opacity-50' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-bold text-foreground text-sm">{review.customer_name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {!review.is_active && (
                    <span className="text-[10px] font-mono text-foreground-muted uppercase tracking-widest">Oculta</span>
                  )}
                </div>
                <p className="text-sm text-foreground/70 leading-relaxed">&ldquo;{review.review_text}&rdquo;</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => toggleActive(review.id, review.is_active)}
                  className={`text-xs font-mono px-2 py-1 border rounded-none transition-colors ${review.is_active ? 'border-green-500/30 text-green-400' : 'border-border text-foreground-muted'}`}
                >
                  {review.is_active ? '✓' : '○'}
                </button>
                <button onClick={() => openEdit(review)} className="p-2 text-foreground-muted hover:text-foreground transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(review.id)} className="p-2 text-foreground-muted hover:text-red-400 transition-colors">
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
              <h3 className="text-lg font-bold font-heading">{editingId ? 'Editar Reseña' : 'Nueva Reseña'}</h3>
              <button onClick={() => setShowModal(false)} className="text-foreground-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Nombre del cliente *</label>
              <input value={formName} onChange={(e) => setFormName(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground" placeholder="Carlos M." />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Reseña *</label>
              <textarea value={formText} onChange={(e) => setFormText(e.target.value)} rows={3}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground resize-none"
                placeholder="Excelente servicio..." />
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Estrellas</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button key={n} onClick={() => setFormRating(n)} type="button">
                      <Star className={`w-6 h-6 transition-colors ${n <= formRating ? 'fill-amber-400 text-amber-400' : 'text-border'}`} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || !formName.trim() || !formText.trim()}
                className="flex-1 bg-foreground text-background font-bold py-3 rounded-none hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {editingId ? 'Guardar Cambios' : 'Crear Reseña'}
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
