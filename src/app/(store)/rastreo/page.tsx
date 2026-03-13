'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline'
import type { Order, OrderItem } from '@/lib/types/database'
import Image from 'next/image'
import { formatCOP } from '@/lib/utils'

type OrderItemWithProduct = OrderItem & {
  products?: { product_images?: { image_url: string }[] } | null
}

interface TrackedOrder extends Order {
  order_items?: OrderItemWithProduct[]
}

export default function RastreoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState('')
  const [contact, setContact] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [order, setOrder] = useState<TrackedOrder | null>(null)

  useEffect(() => {
    const initialOrder = searchParams.get('order')
    if (initialOrder) {
      setOrderNumber(initialOrder.toUpperCase())
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOrder(null)

    if (!orderNumber.trim()) {
      setError('Ingresa el número de pedido')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/orders/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, contact }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'No pudimos encontrar tu pedido. Verifica los datos.')
        return
      }
      setOrder(data.order as TrackedOrder)
    } catch {
      setError('Tuvimos un problema consultando tu pedido. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-[85vh] bg-background text-foreground">
      <section className="pt-20 pb-10 px-6 border-b border-border text-center">
        <h1 className="font-heading font-bold text-[clamp(32px,6vw,52px)] uppercase tracking-[0.2em] mb-3">
          RASTREA TU PEDIDO
        </h1>
        <p className="text-foreground-muted text-sm max-w-xl mx-auto">
          Ingresa el número de pedido que te llegó por correo o WhatsApp. Opcionalmente puedes escribir el
          mismo celular o correo que usaste al comprar para verificar la información.
        </p>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-xl p-6 md:p-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Número de pedido <span className="text-error">*</span>
              </label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] font-mono text-sm tracking-widest"
                placeholder="Ej: LG-2024-1234"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">
                Celular o correo (opcional)
              </label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] text-sm"
                placeholder="Ej: 3001234567 o micorreo@mail.com"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-error mt-2">
              {error}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background font-heading text-[13px] uppercase tracking-[0.2em] rounded-none hover:bg-black transition-colors disabled:opacity-60"
            >
              {loading ? 'BUSCANDO...' : 'RASTREAR PEDIDO'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/catalogo')}
              className="text-[12px] font-mono uppercase tracking-[0.2em] text-foreground-muted hover:text-foreground"
            >
              Volver al catálogo
            </button>
          </div>
        </form>

        {order && (
          <div className="mt-10 bg-surface border border-border rounded-xl p-6 md:p-8">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground-subtle mb-2">
              Pedido
            </p>
            <h2 className="font-heading text-2xl md:text-3xl tracking-widest mb-1">
              {order.order_number}
            </h2>
            <p className="text-sm text-foreground-muted mb-6">
              Realizado el {new Date(order.created_at).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>

            <OrderStatusTimeline status={order.status} className="mb-4" />

            <p className="text-sm font-medium mb-1">
              Total: <span className="font-heading text-lg">{formatCOP(order.total)}</span>
            </p>
            <p className="text-sm text-foreground-muted mb-6">
              Destinatario: {order.customer_name} · {order.customer_city}
            </p>

            {order.order_items && order.order_items.length > 0 && (
              <div>
                <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground-subtle mb-3">
                  Productos
                </p>
                <ul className="space-y-4">
                  {order.order_items.map((item) => {
                    const img = (item as OrderItemWithProduct).products?.product_images?.[0]?.image_url
                    return (
                      <li key={item.id} className="flex gap-4 items-center text-[14px]">
                        <div className="relative w-14 h-14 shrink-0 rounded-none overflow-hidden bg-background border border-border">
                          {img ? (
                            <Image src={img} alt={item.product_name} fill className="object-cover" sizes="56px" />
                          ) : null}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground line-clamp-2">
                            {item.product_name}
                          </p>
                          <p className="text-[12px] text-foreground-muted">
                            Talla {item.size} · x{item.quantity}
                          </p>
                        </div>
                        <p className="text-[13px] font-mono text-foreground">
                          {formatCOP(item.unit_price * item.quantity)}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

