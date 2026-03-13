'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Trash2, Edit, X, Loader2, Eye, EyeOff, Navigation } from 'lucide-react'
import Image from 'next/image'
import { revalidateStore } from '@/app/admin/actions'
import { CameraOrGalleryInput } from '@/components/admin/CameraOrGalleryInput'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
  display_order: number
  is_active: boolean
  show_in_navbar: boolean
  products?: { id: string }[]
}

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Form state
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formImageFile, setFormImageFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [formOrder, setFormOrder] = useState(0)
  const [formActive, setFormActive] = useState(true)
  const [formNavbar, setFormNavbar] = useState(true)

  const supabase = createClient() as any

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*, products(id)')
      .order('display_order')
    if (data) setCategories(data)
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const openCreate = () => {
    setEditingId(null)
    setFormName('')
    setFormSlug('')
    setFormImage('')
    setFormImageFile(null)
    setFormOrder(categories.length)
    setFormActive(true)
    setFormNavbar(true)
    setShowModal(true)
  }

  const openEdit = (cat: Category) => {
    setEditingId(cat.id)
    setFormName(cat.name)
    setFormSlug(cat.slug)
    setFormImage(cat.image_url || '')
    setFormImageFile(null)
    setFormOrder(cat.display_order)
    setFormActive(cat.is_active)
    setFormNavbar(cat.show_in_navbar)
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!formName.trim()) return
    setSaving(true)

    const slug = formSlug.trim() || generateSlug(formName)
    let imageUrl = formImage.trim() || null

    try {
      if (formImageFile) {
        setUploading(true)
        const fileExt = formImageFile.name.split('.').pop() || 'jpg'
        const categoryId = editingId || crypto.randomUUID()
        const fileName = `categories/${categoryId}/${Date.now()}.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, formImageFile, { upsert: true })

        setUploading(false)
        if (uploadError) {
          setMessage({ type: 'error', text: 'Error al subir la imagen. Intenta de nuevo.' })
          setSaving(false)
          return
        }

        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName)
        imageUrl = urlData.publicUrl
      }

      const payload = {
        name: formName.trim(),
        slug,
        image_url: imageUrl,
        display_order: formOrder,
        is_active: formActive,
        show_in_navbar: formNavbar,
      }

      if (editingId) {
        const { error } = await supabase.from('categories').update(payload).eq('id', editingId)
        if (error) {
          setMessage({ type: 'error', text: 'Error al actualizar categoría.' })
        } else {
          setMessage({ type: 'success', text: '¡Categoría actualizada!' })
          await revalidateStore('category')
        }
      } else {
        const { error } = await supabase.from('categories').insert(payload)
        if (error) {
          setMessage({ type: 'error', text: 'Error al crear categoría. Verifica que el slug no esté duplicado.' })
        } else {
          setMessage({ type: 'success', text: '¡Categoría creada!' })
          await revalidateStore('category')
        }
      }
    } catch {
      setUploading(false)
      setMessage({ type: 'error', text: 'Error inesperado.' })
    }

    setShowModal(false)
    setFormImageFile(null)
    setSaving(false)
    await fetchCategories()
    setTimeout(() => setMessage(null), 3000)
  }

  const handleDelete = async (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      setMessage({ type: 'error', text: `No puedes eliminar "${name}" porque tiene ${productCount} productos asignados.` })
      setTimeout(() => setMessage(null), 4000)
      return
    }
    if (!confirm(`¿Eliminar la categoría "${name}"?`)) return

    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id))
      setMessage({ type: 'success', text: 'Categoría eliminada.' })
      await revalidateStore('category')
    } else {
      setMessage({ type: 'error', text: 'Error al eliminar.' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('categories').update({ is_active: !current }).eq('id', id)
    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c))
      await revalidateStore('category')
    }
  }

  const toggleNavbar = async (id: string, current: boolean) => {
    const { error } = await supabase.from('categories').update({ show_in_navbar: !current }).eq('id', id)
    if (!error) {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, show_in_navbar: !current } : c))
      await revalidateStore('category')
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
          <h1 className="text-2xl font-bold font-heading">Categorías</h1>
          <p className="text-sm text-foreground-muted">
            Organiza tus productos por colecciones o tipos.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-foreground text-background font-bold px-4 py-2 rounded-none hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Nueva Categoría
        </button>
      </div>

      {message && (
        <div className={`p-4 rounded-none border text-sm font-medium ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* Tabla de categorías */}
      <div className="bg-surface border border-border rounded-none overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground-muted uppercase bg-background/50">
              <tr>
                <th scope="col" className="px-6 py-4">Categoría</th>
                <th scope="col" className="px-6 py-4">URL Slug</th>
                <th scope="col" className="px-6 py-4">Productos</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4">Navbar</th>
                <th scope="col" className="px-6 py-4">Orden</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.length === 0 ? (
                <tr>
                <td colSpan={7} className="text-center py-8 text-foreground-muted">
                    No hay categorías. Crea la primera.
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 bg-background border border-border overflow-hidden shrink-0">
                          {cat.image_url ? (
                            <Image src={cat.image_url} alt={cat.name} fill className="object-cover" sizes="40px" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-foreground-subtle">N/A</div>
                          )}
                        </div>
                        <span className="font-bold text-foreground">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted font-mono text-xs">
                      /catalogo?categoria={cat.slug}
                    </td>
                    <td className="px-6 py-4 font-medium">{cat.products?.length || 0}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleActive(cat.id, cat.is_active)}
                        className="flex items-center gap-2 group"
                      >
                        <span className={`flex w-2.5 h-2.5 rounded-full ${cat.is_active ? 'bg-green-400' : 'bg-foreground-muted'}`} />
                        <span className="text-xs font-medium group-hover:underline">
                          {cat.is_active ? 'Activa' : 'Oculta'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleNavbar(cat.id, cat.show_in_navbar)}
                        className="flex items-center gap-2 group"
                        title={cat.show_in_navbar ? 'Visible en la barra de navegación' : 'Oculta de la barra'}
                      >
                        <Navigation className={`w-4 h-4 ${cat.show_in_navbar ? 'text-blue-400' : 'text-foreground-muted/40'}`} />
                        <span className="text-xs font-medium group-hover:underline">
                          {cat.show_in_navbar ? 'Sí' : 'No'}
                        </span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-foreground-muted font-mono">{cat.display_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(cat)}
                          className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name, cat.products?.length || 0)}
                          className="p-2 text-foreground-muted hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-border rounded-none w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold font-heading">
                {editingId ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-foreground-muted hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Nombre *</label>
              <input
                value={formName}
                onChange={(e) => {
                  setFormName(e.target.value)
                  if (!editingId) setFormSlug(generateSlug(e.target.value))
                }}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground"
                placeholder="Ej: Camisetas"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Slug (URL)</label>
              <input
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground font-mono text-sm"
                placeholder="camisetas"
              />
              <p className="text-xs text-foreground-muted mt-1">Se genera automáticamente del nombre. Solo editar si es necesario.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Imagen de la categoría</label>
              <div className="flex flex-col gap-3">
                <CameraOrGalleryInput
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setFormImageFile(file)
                      setFormImage('')
                    }
                    e.target.value = ''
                  }}
                  id="cat-image"
                />
                {formImageFile && (
                  <p className="text-sm font-medium text-foreground-muted">📷 {formImageFile.name}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-foreground-muted">
                  <span className="flex-1 h-px bg-border" />
                  <span>o pega una URL</span>
                  <span className="flex-1 h-px bg-border" />
                </div>
                <input
                  value={formImage}
                  onChange={(e) => {
                    setFormImage(e.target.value)
                    if (e.target.value) setFormImageFile(null)
                  }}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground text-sm"
                  placeholder="https://ejemplo.com/imagen.jpg"
                />
                {(formImage || formImageFile) && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    {formImageFile ? 'Se subirá la imagen elegida al guardar.' : 'Se usará la URL al guardar.'}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Orden</label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-none text-foreground"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1.5">Estado</label>
                <button
                  type="button"
                  onClick={() => setFormActive(!formActive)}
                  className={`w-full px-4 py-2.5 border rounded-none font-medium text-sm flex items-center justify-center gap-2 transition-colors ${formActive ? 'border-green-500/30 text-green-400 bg-green-500/5' : 'border-border text-foreground-muted bg-background'}`}
                >
                  {formActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  {formActive ? 'Activa' : 'Oculta'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Mostrar en barra de navegación</label>
              <button
                type="button"
                onClick={() => setFormNavbar(!formNavbar)}
                className={`w-full px-4 py-2.5 border rounded-none font-medium text-sm flex items-center justify-center gap-2 transition-colors ${formNavbar ? 'border-blue-500/30 text-blue-400 bg-blue-500/5' : 'border-border text-foreground-muted bg-background'}`}
              >
                <Navigation className="w-4 h-4" />
                {formNavbar ? 'Visible en navbar' : 'Oculta del navbar'}
              </button>
              <p className="text-xs text-foreground-muted mt-1">Si desactivas esto, la categoría no aparece en el menú de arriba pero sigue accesible por URL directa.</p>
            </div>

            {(saving || uploading) && (
              <div className="flex flex-col gap-2 pt-1">
                <div className="h-1 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full w-[30%] bg-foreground/70 rounded-full admin-upload-indicator" />
                </div>
                <p className="text-xs text-foreground-muted">
                  {uploading ? 'Subiendo imagen al servidor…' : 'Guardando…'}
                </p>
              </div>
            )}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving || !formName.trim()}
                className="flex-1 bg-foreground text-background font-bold py-3 rounded-none hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? (uploading ? 'Subiendo imagen…' : 'Guardando…') : (editingId ? 'Guardar Cambios' : 'Crear Categoría')}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-6 py-3 border border-border text-foreground rounded-none hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
