'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { formatCOP } from '@/lib/utils'
import Image from 'next/image'
import {
  Package,
  User,
  Lock,
  Loader2,
  ChevronDown,
  ChevronRight,
  MessageCircle,
} from 'lucide-react'
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline'
import type { Order, OrderItem } from '@/lib/types/database'
import type { UserProfile } from '@/lib/types/database'

type OrderItemWithProduct = OrderItem & {
  products?: { product_images?: { image_url: string }[] } | null
}

type Section = 'pedidos' | 'perfil' | 'contrasena'

const statusLabels: Record<string, string> = {
  pendiente: 'Recibido',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export default function MiCuentaPage() {
  // La sección Mi Cuenta ya no está enlazada en la interfaz.
  // Si en el futuro se reactiva el sistema de usuarios, aquí se puede volver a conectar useAuth.
  const [section, setSection] = useState<Section>('pedidos')
  const [orders, setOrders] = useState<(Order & { order_items?: OrderItemWithProduct[] })[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone: '',
    default_address: '',
    default_city: '',
  })
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: '',
  })

  const supabase = createClient()
  const ownerWhatsapp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '573001234567'

  useEffect(() => {
    if (!user) return
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, order_items(*, products(product_images(image_url)))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      setOrders((data ?? []) as (Order & { order_items?: OrderItemWithProduct[] })[])
      setLoadingOrders(false)
    }
    fetchOrders()
  }, [user, supabase])

  // Actualización en tiempo real: cuando el admin cambia el estado del pedido, se actualiza sin refrescar
  useEffect(() => {
    if (!user || orders.length === 0) return
    const supabase = createClient()
    const channel = supabase
      .channel('mi-cuenta-orders-updates')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders' },
        (payload) => {
          const updated = payload.new as Record<string, unknown>
          const id = updated?.id as string | undefined
          if (!id) return
          setOrders((prev) =>
            prev.map((o) =>
              o.id === id
                ? { ...o, status: (updated.status as any) ?? o.status }
                : o
            )
          )
        }
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, orders.length])

  useEffect(() => {
    if (!user) return
    const fetchProfile = async () => {
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (data) {
        setProfile(data as UserProfile)
        setProfileForm({
          full_name: (data as UserProfile).full_name ?? '',
          phone: (data as UserProfile).phone ?? '',
          default_address: (data as UserProfile).default_address ?? '',
          default_city: (data as UserProfile).default_city ?? '',
        })
      }
      setLoadingProfile(false)
    }
    fetchProfile()
  }, [user, supabase])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSavingProfile(true)
    setMessage(null)
    const { error } = await supabase.from('user_profiles').upsert(
      {
        id: user.id,
        full_name: profileForm.full_name.trim() || null,
        phone: profileForm.phone.trim() || null,
        default_address: profileForm.default_address.trim() || null,
        default_city: profileForm.default_city.trim() || null,
        updated_at: new Date().toISOString(),
      } as any,
      { onConflict: 'id' }
    )
    if (error) setMessage({ type: 'error', text: 'Error al guardar' })
    else setMessage({ type: 'success', text: 'Perfil actualizado' })
    setSavingProfile(false)
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (passwordForm.new !== passwordForm.confirm) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }
    if (passwordForm.new.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }
    setSavingPassword(true)
    const { error } = await supabase.auth.updateUser({ password: passwordForm.new })
    if (error) setMessage({ type: 'error', text: error.message })
    else {
      setMessage({ type: 'success', text: 'Contraseña actualizada' })
      setPasswordForm({ current: '', new: '', confirm: '' })
    }
    setSavingPassword(false)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8E6E1]" />
      </div>
    )
  }

  const displayName = user.user_metadata?.full_name ?? profile?.full_name ?? user.email?.split('@')[0] ?? 'Usuario'

  const sections: { id: Section; label: string; icon: React.ElementType }[] = [
    { id: 'pedidos', label: 'Mis pedidos', icon: Package },
    { id: 'perfil', label: 'Mi perfil', icon: User },
    { id: 'contrasena', label: 'Cambiar contraseña', icon: Lock },
  ]

  return (
    <div className="min-h-screen bg-[#111110] text-[#E8E6E1]">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl md:text-5xl uppercase tracking-tight mb-2">
          Mi cuenta
        </h1>
        <p className="text-[#E8E6E1]/60 text-sm mb-10">Hola, {displayName}</p>

        <div className="flex flex-col md:flex-row gap-8">
          <nav className="md:w-56 shrink-0 border border-white/10 rounded-lg p-2 bg-[#111]">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded text-left transition-colors ${
                  section === id ? 'bg-[#E8E6E1]/20 text-[#E8E6E1] border border-[rgba(232,230,225,0.25)]/30' : 'hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all/5 text-[#E8E6E1]/80'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => signOut()}
              className="w-full flex items-center gap-3 px-4 py-3 rounded text-left text-error hover:bg-error/10 transition-colors mt-2"
            >
              <Lock className="w-5 h-5 shrink-0" />
              Cerrar sesión
            </button>
          </nav>

          <div className="flex-1 min-w-0">
            {message && (
              <div
                className={`mb-6 p-4 rounded text-sm ${
                  message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
                }`}
              >
                {message.text}
              </div>
            )}

            {section === 'pedidos' && (
              <div className="space-y-4">
                <h2 className="font-heading text-2xl uppercase tracking-wider text-[#E8E6E1] mb-6">
                  Mis pedidos
                </h2>
                {loadingOrders ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E8E6E1]" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="border border-white/10 rounded-xl p-12 text-center bg-[#111]">
                    <Package className="w-16 h-16 text-[#E8E6E1]/20 mx-auto mb-4" />
                    <p className="text-[#E8E6E1]/80 mb-6">Aún no tienes pedidos vinculados a esta cuenta.</p>
                    <Link
                      href="/catalogo"
                      className="inline-block bg-[#E8E6E1] text-[#111110] font-bold px-6 py-3 rounded hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                ) : (
                  orders.map((order) => {
                    const isExpanded = expandedOrderId === order.id
                    return (
                      <div
                        key={order.id}
                        className="border border-white/10 rounded-xl overflow-hidden bg-[#111]"
                      >
                        <button
                          type="button"
                          onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                          className="w-full flex items-center justify-between p-6 text-left hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all/5 transition-colors"
                        >
                          <div>
                            <p className="font-heading text-lg tracking-wider">{order.order_number}</p>
                            <p className="text-sm text-[#E8E6E1]/60 mt-1">
                              {new Date(order.created_at).toLocaleDateString('es-CO')} · {formatCOP(order.total)}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-white/10 border border-white/20">
                              {statusLabels[order.status] ?? order.status}
                            </span>
                            {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                          </div>
                        </button>
                        {isExpanded && order.order_items && (
                          <div className="border-t border-white/10 p-6 space-y-6">
                            <div>
                              <p className="text-[11px] text-[#E8E6E1]/50 uppercase tracking-wider mb-2">Estado</p>
                              <OrderStatusTimeline status={order.status} />
                            </div>
                            <div>
                              <p className="text-[11px] text-[#E8E6E1]/50 uppercase tracking-wider mb-3">Productos</p>
                              <div className="space-y-4">
                                {order.order_items.map((item) => {
                                  const img = item.products?.product_images?.[0]?.image_url
                                  return (
                                    <div key={item.id} className="flex gap-4 items-center">
                                      <div className="relative w-14 h-14 bg-white/5 rounded shrink-0 overflow-hidden">
                                        {img ? (
                                          <Image
                                            src={img}
                                            alt={item.product_name}
                                            fill
                                            className="object-cover"
                                            sizes="56px"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center text-[#E8E6E1]/40 text-xs">
                                            —
                                          </div>
                                        )}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-medium text-[#E8E6E1]">{item.product_name}</p>
                                        <p className="text-xs text-[#E8E6E1]/60">Talla {item.size} · {item.quantity} und</p>
                                      </div>
                                      <p className="text-[#E8E6E1] font-mono shrink-0">{formatCOP(item.unit_price * item.quantity)}</p>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                            <a
                              href={`https://wa.me/${ownerWhatsapp.replace(/\D/g, '')}?text=Hola, consulta sobre mi pedido ${order.order_number}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 text-[#E8E6E1] text-sm font-medium hover:text-[#E8E6E1] transition-colors"
                            >
                              <MessageCircle className="w-4 h-4" />
                              Contactar por WhatsApp
                            </a>
                          </div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            )}

            {section === 'perfil' && (
              <div>
                <h2 className="font-heading text-2xl uppercase tracking-wider text-[#E8E6E1] mb-6">
                  Mi perfil
                </h2>
                {loadingProfile ? (
                  <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[#E8E6E1]" />
                  </div>
                ) : (
                  <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Nombre</label>
                      <input
                        type="text"
                        value={profileForm.full_name}
                        onChange={(e) => setProfileForm((p) => ({ ...p, full_name: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Celular (WhatsApp)</label>
                      <input
                        type="tel"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                        placeholder="300 123 4567"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Dirección</label>
                      <input
                        type="text"
                        value={profileForm.default_address}
                        onChange={(e) => setProfileForm((p) => ({ ...p, default_address: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                        placeholder="Dirección de envío"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Ciudad</label>
                      <input
                        type="text"
                        value={profileForm.default_city}
                        onChange={(e) => setProfileForm((p) => ({ ...p, default_city: e.target.value }))}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                        placeholder="Montería"
                      />
                    </div>
                    <p className="text-xs text-[#E8E6E1]/50">Estos datos se usarán para pre-llenar el checkout.</p>
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="bg-[#E8E6E1] text-[#111110] font-bold px-6 py-3 rounded hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      Guardar perfil
                    </button>
                  </form>
                )}
              </div>
            )}

            {section === 'contrasena' && (
              <div>
                <h2 className="font-heading text-2xl uppercase tracking-wider text-[#E8E6E1] mb-6">
                  Cambiar contraseña
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Contraseña actual</label>
                    <input
                      type="password"
                      value={passwordForm.current}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Nueva contraseña</label>
                    <input
                      type="password"
                      value={passwordForm.new}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, new: e.target.value }))}
                      minLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">Confirmar nueva contraseña</label>
                    <input
                      type="password"
                      value={passwordForm.confirm}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                      minLength={6}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] focus:border-[rgba(232,230,225,0.25)] outline-none"
                      placeholder="Repite la contraseña"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="bg-[#E8E6E1] text-[#111110] font-bold px-6 py-3 rounded hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    Actualizar contraseña
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
