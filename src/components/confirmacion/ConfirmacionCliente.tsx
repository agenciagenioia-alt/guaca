'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Image from 'next/image'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline'
import type { Order, OrderItem } from '@/lib/types/database'

type OrderItemWithProduct = OrderItem & {
  products?: { product_images?: { image_url: string }[] } | null
}

interface ConfirmacionClienteProps {
  status: 'success' | 'error'
  order?: (Order & { order_items?: OrderItemWithProduct[] }) | null
  ownerWhatsapp?: string | null
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  if (!domain) return email
  const visible = Math.min(4, Math.max(0, Math.floor(local.length / 2)))
  return `${local.slice(0, visible)}****@${domain}`
}

/** Genera el texto del mensaje de WhatsApp para notificar al negocio (formato acordado). */
function buildWhatsAppOrderMessage(order: {
  order_number: string
  total: number
  order_items?: { product_name: string; size: string; quantity: number; unit_price: number }[]
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_city: string
}): string {
  const lines: string[] = [
    '🛍️ *NUEVO PEDIDO - LA GUACA*',
    '',
    `📦 Pedido: #${order.order_number}`,
    `💰 Total: ${formatCOP(order.total)} COP`,
    '',
    '*Productos:*',
  ]
  if (order.order_items?.length) {
    for (const item of order.order_items) {
      const lineTotal = item.unit_price * item.quantity
      lines.push(`• ${item.product_name} (Talla ${item.size}) x${item.quantity} — ${formatCOP(lineTotal)}`)
    }
  }
  lines.push('', '*Datos de envío:*', `👤 ${order.customer_name}`, `📱 ${order.customer_phone}`, `📍 ${order.customer_address}`, `🏙️ ${order.customer_city}`, '', '✅ Pago confirmado por Wompi')
  return lines.join('\n')
}

export default function ConfirmacionCliente({
  status,
  order,
  ownerWhatsapp,
}: ConfirmacionClienteProps) {
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)
  const [invitationDismissed, setInvitationDismissed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'success') clearCart()
  }, [status, clearCart])

  // Redirigir automáticamente a WhatsApp con el resumen del pedido (nueva pestaña)
  useEffect(() => {
    if (status !== 'success' || !ownerWhatsapp || !order) return
    const number = ownerWhatsapp.replace(/\D/g, '')
    const text = buildWhatsAppOrderMessage({
      order_number: order.order_number,
      total: order.total,
      order_items: order.order_items,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      customer_city: order.customer_city,
    })
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`
    const t = setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer')
    }, 2500)
    return () => clearTimeout(t)
  }, [status, ownerWhatsapp, order])

  const customerEmail = order?.customer_email?.trim()
  const orderNumber = order?.order_number ?? ''
  const showInvitation =
    status === 'success' &&
    Boolean(customerEmail) &&
    !invitationDismissed

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerEmail || !password || password.length < 6) {
      setLinkError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    setLinkError(null)
    setLinking(true)
    const supabase = createClient()
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email: customerEmail,
        password,
        options: { emailRedirectTo: `${window.location.origin}/mi-cuenta` },
      })
      if (signUpError) throw signUpError
      const res = await fetch('/api/checkout/vincular-pedido', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error((data as { error?: string }).error ?? 'Error al vincular')
      }
      router.push('/mi-cuenta')
      router.refresh()
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setLinking(false)
    }
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground">
        <div className="max-w-[500px] w-full text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-error/10 flex items-center justify-center text-error text-4xl">
            ✕
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold uppercase tracking-tight text-foreground mb-2">
            Error en el pago
          </h1>
          <p className="text-foreground-muted font-body text-[15px] mb-8">
            No pudimos confirmar tu pago. Si se descontó dinero de tu cuenta, contáctanos con el número de transacción.
          </p>
          <Link
            href="/carrito"
            className="inline-block bg-foreground text-background font-heading font-bold uppercase tracking-widest px-8 py-4 text-[16px] hover:bg-black transition-colors rounded-none"
          >
            VOLVER AL CARRITO
          </Link>
        </div>
      </div>
    )
  }

  const whatsappNumber = ownerWhatsapp?.replace(/\D/g, '') ?? '573001234567'
  const whatsappText = order
    ? buildWhatsAppOrderMessage({
        order_number: order.order_number,
        total: order.total,
        order_items: order.order_items,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        customer_city: order.customer_city,
      })
    : `Hola, acabo de completar el pedido ${orderNumber}. ¿Podrían confirmar?`

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-foreground relative">
      <div className="max-w-[520px] w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-5 duration-500">
        <div className="w-24 h-24 mb-6 rounded-full border-2 border-border flex items-center justify-center text-foreground text-4xl">
          ✓
        </div>

        <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight text-foreground mb-2 leading-none">
          ¡Pedido confirmado!
        </h1>
        <p className="font-mono text-[14px] text-foreground-muted uppercase mb-8 tracking-widest">
          Gracias por confiar en La Guaca.
        </p>

        <div className="w-full bg-surface border border-border rounded-none p-6 mb-6 text-left">
          <p className="font-mono text-[11px] text-foreground-subtle uppercase tracking-[0.2em] mb-1">
            Orden
          </p>
          <p className="font-heading text-2xl font-bold text-foreground tracking-widest mb-4">
            {orderNumber}
          </p>

          {order?.status && (
            <div className="mb-6 border-t border-border pt-4">
              <p className="font-mono text-[11px] text-foreground-subtle uppercase tracking-[0.2em] mb-3">
                Estado del pedido
              </p>
              <OrderStatusTimeline status={order.status} />
            </div>
          )}

          {order?.order_items && order.order_items.length > 0 && (
            <div className="mb-4 border-t border-border pt-4">
              <p className="font-mono text-[11px] text-foreground-subtle uppercase tracking-[0.2em] mb-3">
                Productos
              </p>
              <ul className="space-y-4">
                {order.order_items.map((item) => {
                  const img = (item as OrderItemWithProduct).products?.product_images?.[0]?.image_url
                  return (
                    <li
                      key={item.id}
                      className="flex gap-4 items-center text-[14px]"
                    >
                      <div className="relative w-14 h-14 shrink-0 rounded-none overflow-hidden bg-background border border-border">
                        {img ? (
                          <Image
                            src={img}
                            alt={item.product_name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-foreground-subtle text-xs">
                            —
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground font-medium">{item.product_name}</p>
                        <p className="text-[12px] text-foreground-muted">
                          Talla {item.size} · Cantidad: {item.quantity}
                        </p>
                      </div>
                      <span className="text-foreground font-mono shrink-0">
                        {formatCOP(item.unit_price * item.quantity)}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
          <p className="text-[14px] text-foreground-muted">
            Total: <span className="font-bold text-foreground">{order && formatCOP(order.total)}</span>
          </p>
          <p className="text-[13px] text-foreground-subtle mt-3">
            Nos pondremos en contacto contigo para coordinar el envío.
          </p>
        </div>

        {showInvitation && (
          <div className="w-full bg-surface border border-border rounded-none p-6 mb-6 text-left">
            <h3 className="font-heading text-lg uppercase tracking-wider text-foreground mb-2">
              💾 Guarda tu pedido
            </h3>
            <p className="text-sm text-foreground-muted mb-4">
              Crea una cuenta y podrás ver el estado de tus pedidos, comprar más rápido y guardar tu dirección.
            </p>
            <p className="text-xs text-foreground-subtle mb-2">Tu email: {customerEmail ? maskEmail(customerEmail) : ''}</p>
            <form onSubmit={handleCreateAccount} className="space-y-3">
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Crea tu contraseña (mín. 6 caracteres)"
                  minLength={6}
                  className="w-full px-4 py-3 bg-background border border-border text-foreground placeholder:text-foreground-subtle focus:border-foreground outline-none pr-12 rounded-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-muted hover:text-foreground text-sm"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? '👁' : '👁‍🗨'}
                </button>
              </div>
              {linkError && <p className="text-error text-sm">{linkError}</p>}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="submit"
                  disabled={linking}
                  className="flex-1 py-3 bg-foreground text-background font-bold uppercase tracking-wider rounded-none hover:bg-black transition-colors disabled:opacity-50"
                >
                  {linking ? 'Creando cuenta...' : 'Crear mi cuenta gratis'}
                </button>
                <button
                  type="button"
                  onClick={() => setInvitationDismissed(true)}
                  className="py-3 text-foreground-muted hover:text-foreground text-sm uppercase tracking-wider"
                >
                  No gracias, continuar sin cuenta
                </button>
              </div>
            </form>
          </div>
        )}

        {ownerWhatsapp && (
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-heading font-bold uppercase tracking-widest h-[56px] text-[16px] hover:bg-[#20BD5A] transition-colors rounded-none"
          >
            📱 Enviar resumen por WhatsApp
          </a>
        )}

        <div className="w-full flex flex-col sm:flex-row gap-4 flex-wrap">
          <Link
            href="/catalogo"
            className="flex-1 bg-foreground text-background font-heading font-bold uppercase tracking-widest h-[56px] flex items-center justify-center text-[16px] hover:bg-black transition-colors rounded-none"
          >
            Seguir comprando
          </Link>
          <Link
            href={orderNumber ? `/rastreo?order=${encodeURIComponent(orderNumber)}` : '/rastreo'}
            className="flex-1 bg-surface border border-border text-foreground font-heading font-bold uppercase tracking-widest h-[56px] flex items-center justify-center text-[16px] hover:bg-surface-hover transition-colors rounded-none"
          >
            Rastrear mi pedido
          </Link>
        </div>
      </div>
    </div>
  )
}
