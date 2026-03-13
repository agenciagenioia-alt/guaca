'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToastStore } from '@/store/toast'
import { formatCOP } from '@/lib/utils'
import { Eye } from 'lucide-react'
import { DeleteOrderAction } from './DeleteOrderAction'

interface OrderRow {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  created_at: string
  total: number
  status: string
  wompi_reference: string | null
}

interface PedidosListProps {
  initialOrders: OrderRow[]
}

const STATUS_OPTIONS = [
  { value: 'todos', label: 'Todos' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'confirmado', label: 'Confirmados' },
  { value: 'preparando', label: 'Preparando' },
  { value: 'enviado', label: 'Enviados' },
  { value: 'entregado', label: 'Entregados' },
]

export function PedidosList({ initialOrders }: PedidosListProps) {
  const [orders, setOrders] = useState<OrderRow[]>(initialOrders)
  const [statusFilter, setStatusFilter] = useState<string>('todos')
  const addToast = useToastStore((s) => s.addToast)

  const filteredOrders =
    statusFilter === 'todos'
      ? orders
      : orders.filter((o) => o.status === statusFilter)

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('admin-new-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders' },
        (payload) => {
          const newOrder = payload.new as OrderRow
          setOrders((prev) => [newOrder, ...prev])
          addToast(
            `🛍️ Nuevo pedido de ${newOrder.customer_name} — ${formatCOP(newOrder.total)}`,
            'success'
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [addToast])

  return (
    <div>
      <div className="p-4 border-b border-border flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Estado:</span>
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setStatusFilter(opt.value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              statusFilter === opt.value
                ? 'bg-[#E8E6E1] text-background border-[#E8E6E1]'
                : 'bg-transparent border-border text-foreground-muted hover:text-foreground hover:border-foreground/30'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-foreground-muted uppercase bg-surface-hover">
          <tr>
            <th scope="col" className="px-6 py-4">ID Pedido / Wompi</th>
            <th scope="col" className="px-6 py-4">Cliente</th>
            <th scope="col" className="px-6 py-4">Fecha</th>
            <th scope="col" className="px-6 py-4">Total</th>
            <th scope="col" className="px-6 py-4">Estado</th>
            <th scope="col" className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-12 text-foreground-muted">
                {orders.length === 0
                  ? 'Aún no tienes pedidos registrados.'
                  : `No hay pedidos con estado "${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label ?? statusFilter}".`}
              </td>
            </tr>
          ) : (
            filteredOrders.map((order) => (
              <tr
                id={`order-row-${order.id}`}
                key={order.id}
                className="hover:bg-surface-hover/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div>
                    <p className="font-mono font-bold text-foreground">
                      {order.order_number}
                    </p>
                    {order.wompi_reference && (
                      <p className="text-[10px] text-foreground-subtle truncate max-w-[120px]" title={order.wompi_reference}>
                        Ref: {order.wompi_reference}
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-medium text-foreground">{order.customer_name}</p>
                  <p className="text-xs text-foreground-muted">{order.customer_phone}</p>
                </td>
                <td className="px-6 py-4 text-foreground-muted">
                  {new Date(order.created_at).toLocaleString('es-CO', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-6 py-4 font-bold text-[#E8E6E1]">
                  {formatCOP(order.total)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                      order.status === 'pendiente'
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
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end">
                    <Link
                      href={`/admin/pedidos/${order.id}`}
                      className="flex items-center gap-1 text-xs font-medium text-background bg-[#E8E6E1] hover:bg-[#E8E6E1]-hover px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      Detalle
                    </Link>
                    <DeleteOrderAction orderId={order.id} orderNumber={order.order_number} />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  )
}
