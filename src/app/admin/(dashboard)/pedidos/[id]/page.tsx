import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/utils'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, MessageCircle, MapPin, User, Package, CalendarClock, CreditCard } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Detalle de Pedido | La Guaca Admin',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminDetallePedidoPage({ params }: Props) {
  const { id } = await params
  const supabase = (await createClient()) as any

  // 1. Obtener datos del pedido
  const { data: order } = await supabase
    .from('orders')
    .select('*, items:order_items(*)')
    .eq('id', id)
    .single()

  if (!order) notFound()

  // 2. Acción para actualizar estado (Server Action interna manejada vía formulario simple o en BD para MVP)
  // En Next.js App Router, usar server actions es ideal, pero por simplicidad haremos un pequeño formulario que envíe a un endpoint / o cambie el status acá
  // Para MVP sin tocar mucho boilerplate, definiremos una server action acá mismo:
  async function updateStatus(formData: FormData) {
    'use server'
    const newStatus = formData.get('status') as string
    const trackingCode = formData.get('tracking_code') as string

    if (!newStatus) return

    const client = (await createClient()) as any
    await client
      .from('orders')
      .update({
        status: newStatus,
        tracking_code: trackingCode || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    // revalidatePath('/admin/pedidos') (opcional en un flujo normal)
  }

  // Generar link WhatsApp para hablar con cliente
  const waLink = `https://wa.me/${order.customer_phone}?text=Hola%20${order.customer_name},%20te%20escribimos%20de%20La%20Guaca%20respecto%20a%20tu%20pedido%20${order.order_number}`

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/pedidos"
            className="p-2 border border-border rounded-md hover:bg-surface-hover transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold font-heading">
              Pedido {order.order_number}
            </h1>
            <p className="text-sm text-foreground-muted flex items-center gap-1">
              <CalendarClock className="w-4 h-4" />
              {new Date(order.created_at).toLocaleString('es-CO')}
            </p>
          </div>
        </div>

        <span
          className={`px-3 py-1 text-sm font-bold rounded-full ${order.status === 'pendiente'
              ? 'bg-warning/10 text-warning border border-warning/20'
              : order.status === 'confirmado'
                ? 'bg-info/10 text-info border border-info/20'
                : order.status === 'enviado' || order.status === 'entregado'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-error/10 text-error border border-error/20'
            }`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Principal - Items y Editar Estado */}
        <div className="md:col-span-2 space-y-6">
          {/* Productos */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Productos
            </h2>
            <ul className="divide-y divide-border">
              {order.items?.map((item: any) => (
                <li key={item.id} className="py-4 flex justify-between items-start">
                  <div>
                    <p className="font-bold text-foreground">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-foreground-muted">
                      Talla: <span className="text-[#E8E6E1] font-medium">{item.size}</span>
                    </p>
                    <p className="text-xs text-foreground-subtle mt-1">
                      {formatCOP(item.unit_price)} c/u
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Cant: x{item.quantity}</p>
                    <data value={item.unit_price * item.quantity} className="font-bold text-foreground mt-1 block">
                      {formatCOP(item.unit_price * item.quantity)}
                    </data>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-4 border-t border-border flex justify-between items-center text-lg font-bold mt-2">
              <span>Total Pago</span>
              <span className="text-[#E8E6E1]">{formatCOP(order.total)}</span>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-md">
                <p className="text-xs font-bold text-warning uppercase mb-1">Notas del cliente:</p>
                <p className="text-sm italic">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Actualizar Estado */}
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Gestión del Pedido
            </h2>

            <form action={updateStatus} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Estado actual
                </label>
                <select
                  name="status"
                  defaultValue={order.status}
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                >
                  <option value="pendiente">Pendiente (Sin pagar confi)</option>
                  <option value="confirmado">Confirmado (Pagado)</option>
                  <option value="enviado">Enviado (En trayecto)</option>
                  <option value="entregado">Entregado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Guía de envío (Opcional)
                </label>
                <input
                  type="text"
                  name="tracking_code"
                  defaultValue={order.tracking_code || ''}
                  placeholder="Ej: Interrapidisimo - 123456789"
                  className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#E8E6E1] hover:bg-[#E8E6E1]-hover text-background font-bold py-2.5 rounded-md transition-colors"
              >
                Actualizar Pedido
              </button>
            </form>
          </div>
        </div>

        {/* Columna Lateral - Cliente */}
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Cliente
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Nombre</p>
                <p className="font-medium">{order.customer_name}</p>
              </div>

              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Contacto</p>
                <p className="font-medium">{order.customer_phone}</p>
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 w-full bg-[#25D366]/10 text-[#25D366] font-bold py-2 rounded-md hover:bg-[#25D366]/20 transition-colors border border-[#25D366]/30 text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Escribir al WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Envío
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Dirección</p>
                <p className="font-medium text-sm leading-relaxed">{order.customer_address}</p>
              </div>
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Ciudad</p>
                <p className="font-medium">{order.customer_city}</p>
              </div>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold font-heading mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Pago
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-foreground-muted uppercase tracking-wider mb-1">Referencia Wompi</p>
                <p className="font-mono text-xs break-all text-[#E8E6E1] bg-[#E8E6E1]/10 p-2 rounded border border-[rgba(232,230,225,0.25)]/20">
                  {order.wompi_reference || 'Sin registrar aún'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
