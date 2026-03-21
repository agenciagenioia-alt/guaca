'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { MoneriaProductForm } from './components/MoneriaProductForm'
import type { MoneriaProduct, MoneriaSectionConfig } from '@/lib/moneria'
import { DEFAULT_CONFIG } from '@/lib/moneria'
import { formatCOP } from '@/lib/utils'

type Tab = 'config' | 'productos'

export default function AdminMoneriaPage() {
  const [tab, setTab] = useState<Tab>('productos')
  const [products, setProducts] = useState<MoneriaProduct[]>([])
  const [config, setConfig] = useState<MoneriaSectionConfig>(DEFAULT_CONFIG)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<MoneriaProduct | null>(null)

  // Config form state
  const [cfgVisible, setCfgVisible] = useState(true)
  const [cfgTitle, setCfgTitle] = useState('DROP')
  const [cfgSubtitle, setCfgSubtitle] = useState('MONERÍA STUDIO')
  const [cfgDescription, setCfgDescription] = useState('')
  const [cfgDropLabel, setCfgDropLabel] = useState('DROP 001')

  const supabase = createClient() as any

  const fetchData = async () => {
    setLoading(true)
    try {
      const [productsRes, configRes] = await Promise.all([
        supabase.from('moneria_products').select('*').order('created_at', { ascending: false }),
        supabase.from('moneria_section_config').select('*').eq('id', 1).single(),
      ])
      if (productsRes.data) setProducts(productsRes.data)
      if (configRes.data) {
        const c = configRes.data as MoneriaSectionConfig
        setConfig(c)
        setCfgVisible(c.is_visible)
        setCfgTitle(c.section_title ?? 'DROP')
        setCfgSubtitle(c.section_subtitle ?? 'MONERÍA STUDIO')
        setCfgDescription(c.section_description ?? '')
        setCfgDropLabel(c.drop_label ?? 'DROP 001')
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error cargando datos' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const saveConfig = async () => {
    setSaving(true)
    setMessage(null)
    try {
      const payload = {
        is_visible: cfgVisible,
        section_title: cfgTitle.trim() || 'DROP',
        section_subtitle: cfgSubtitle.trim() || 'MONERÍA STUDIO',
        section_description: cfgDescription.trim() || null,
        drop_label: cfgDropLabel.trim() || 'DROP 001',
      }
      const res = await fetch('/api/admin/moneria/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || 'Error al guardar')
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
    } catch (err: any) {
      setMessage({ type: 'error', text: err?.message || 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (product: MoneriaProduct) => {
    const res = await fetch('/api/admin/moneria/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, is_active: !product.is_active }),
      credentials: 'include',
    })
    if (res.ok) setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
  }

  const toggleFeatured = async (product: MoneriaProduct) => {
    const res = await fetch('/api/admin/moneria/products', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id, is_featured: !product.is_featured }),
      credentials: 'include',
    })
    if (res.ok) setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, is_featured: !p.is_featured } : p))
  }

  const deleteProduct = async (id: string) => {
    if (!confirm('¿Eliminar este producto de Monería? Esta acción no se puede deshacer.')) return
    const res = await fetch('/api/admin/moneria/products', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      credentials: 'include',
    })
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
    else {
      const data = await res.json().catch(() => ({}))
      setMessage({ type: 'error', text: data?.error || 'Error al eliminar' })
    }
  }

  const openCreate = () => { setEditingProduct(null); setShowForm(true) }
  const openEdit = (p: MoneriaProduct) => { setEditingProduct(p); setShowForm(true) }
  const handleSaved = () => { fetchData() }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl tracking-widest text-foreground uppercase">
            Monería Drop
          </h1>
          <p className="text-sm text-foreground-muted mt-1">
            Gestiona la sección Monería Studio en la tienda
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border mb-6">
        {([['productos', 'Productos'], ['config', 'Configuración']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setMessage(null) }}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-foreground text-foreground'
                : 'border-transparent text-foreground-muted hover:text-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Messages */}
      {message && (
        <div className={`mb-4 px-4 py-3 text-sm ${message.type === 'error' ? 'bg-error/10 text-error border border-error/20' : 'bg-success/10 text-success border border-success/20'}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-foreground-muted" />
        </div>
      ) : (
        <>
          {/* ── TAB CONFIGURACIÓN ── */}
          {tab === 'config' && (
            <div className="max-w-lg flex flex-col gap-5">
              {/* Toggle visibilidad */}
              <div className="border border-border p-5 bg-surface">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Sección visible en la tienda</p>
                    <p className="text-xs text-foreground-muted mt-1">
                      Si está desactivado, la sección Monería Drop no aparece en la página de inicio
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCfgVisible(!cfgVisible)}
                    className={`relative w-12 h-6 transition-colors flex-shrink-0 ${cfgVisible ? 'bg-foreground' : 'bg-border'}`}
                  >
                    <span className={`absolute top-1 h-4 w-4 bg-background transition-transform ${cfgVisible ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
                <p className={`mt-3 text-xs font-medium ${cfgVisible ? 'text-success' : 'text-foreground-muted'}`}>
                  {cfgVisible ? '✓ Sección activada' : '— Sección oculta'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
                  Título principal (ej: DROP)
                </label>
                <input
                  value={cfgTitle}
                  onChange={(e) => setCfgTitle(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
                  Subtítulo (ej: MONERÍA STUDIO)
                </label>
                <input
                  value={cfgSubtitle}
                  onChange={(e) => setCfgSubtitle(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
                  Descripción corta
                </label>
                <textarea
                  value={cfgDescription}
                  onChange={(e) => setCfgDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground resize-none"
                  placeholder="Diseño colombiano de autor..."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground-muted uppercase tracking-widest mb-1">
                  Drop label (ej: DROP 001)
                </label>
                <input
                  value={cfgDropLabel}
                  onChange={(e) => setCfgDropLabel(e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 text-sm text-foreground focus:outline-none focus:border-foreground"
                />
              </div>

              <button
                onClick={saveConfig}
                disabled={saving}
                className="bg-foreground text-background py-3 text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {saving ? 'Guardando...' : 'Guardar configuración'}
              </button>
            </div>
          )}

          {/* ── TAB PRODUCTOS ── */}
          {tab === 'productos' && (
            <div>
              {/* Botón agregar */}
              <div className="mb-5">
                <button
                  onClick={openCreate}
                  className="flex items-center gap-2 bg-foreground text-background px-5 py-3 text-sm font-medium hover:bg-foreground/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  AGREGAR PRODUCTO
                </button>
              </div>

              {products.length === 0 ? (
                <div className="border border-border border-dashed py-16 flex flex-col items-center justify-center gap-3 text-center">
                  <p className="text-foreground-muted text-sm">No hay productos de Monería aún</p>
                  <button onClick={openCreate} className="text-xs font-medium text-foreground underline">
                    Agregar el primero
                  </button>
                </div>
              ) : (
                <div className="border border-border overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-surface">
                        <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest">Imagen</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest">Nombre</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest hidden md:table-cell">Precio</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest hidden md:table-cell">Tallas</th>
                        <th className="text-left px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest hidden md:table-cell">Stock</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest">Activo</th>
                        <th className="text-center px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest hidden md:table-cell">Destacado</th>
                        <th className="text-right px-4 py-3 text-xs font-medium text-foreground-muted uppercase tracking-widest">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                          {/* Thumbnail */}
                          <td className="px-4 py-3">
                            <div className="relative w-10 h-10 bg-surface border border-border overflow-hidden flex-shrink-0">
                              <Image
                                src={p.image_url}
                                alt={p.name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground text-sm">{p.name}</p>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-foreground-muted">
                            {formatCOP(p.price)}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {(p.sizes || []).map((s) => (
                                <span key={s} className="text-[10px] border border-border px-1 text-foreground-muted">{s}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell text-foreground-muted text-center">
                            {p.stock}
                          </td>
                          {/* Toggle activo */}
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => toggleActive(p)}
                              className={`relative w-9 h-5 transition-colors ${p.is_active ? 'bg-foreground' : 'bg-border'}`}
                              title={p.is_active ? 'Desactivar' : 'Activar'}
                            >
                              <span className={`absolute top-0.5 h-4 w-4 bg-background transition-transform ${p.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          </td>
                          {/* Toggle destacado */}
                          <td className="px-4 py-3 text-center hidden md:table-cell">
                            <button
                              onClick={() => toggleFeatured(p)}
                              className={`relative w-9 h-5 transition-colors ${p.is_featured ? 'bg-foreground' : 'bg-border'}`}
                              title={p.is_featured ? 'Quitar destacado' : 'Destacar'}
                            >
                              <span className={`absolute top-0.5 h-4 w-4 bg-background transition-transform ${p.is_featured ? 'translate-x-4' : 'translate-x-0.5'}`} />
                            </button>
                          </td>
                          {/* Acciones */}
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEdit(p)}
                                className="p-2 border border-border hover:bg-surface-hover transition-colors text-foreground-muted hover:text-foreground"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteProduct(p.id)}
                                className="p-2 border border-error/30 hover:bg-error/10 transition-colors text-error"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal formulario */}
      {showForm && (
        <MoneriaProductForm
          initial={editingProduct || undefined}
          onClose={() => { setShowForm(false); setEditingProduct(null) }}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
