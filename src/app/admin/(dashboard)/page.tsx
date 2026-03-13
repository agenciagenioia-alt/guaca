import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/utils'
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Dashboard | La Guaca Admin',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // 1. Total ventas (pedidos confirmados / entregados)
  const { data: salesData } = await supabase
    .from('orders')
    .select('total')
    .in('status', ['confirmado', 'enviado', 'entregado'])

  const totalSales = (salesData as { total: number }[] | null)?.reduce((acc, order) => acc + order.total, 0) || 0

  // 2. Pedidos pendientes
  const { count: pendingOrdersCount } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pendiente')

  // 3. Productos activos
  const { count: activeProductsCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true)

  // 4. Últimos pedidos
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, total, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
    
  const typedRecentOrders = recentOrders as {
    id: string
    order_number: string
    customer_name: string
    total: number
    status: string
    created_at: string
  }[] | null

  const stats = [
    {
      title: 'Ventas Totales',
      value: formatCOP(totalSales),
      icon: DollarSign,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      title: 'Pedidos Pendientes',
      value: pendingOrdersCount || 0,
      icon: ShoppingCart,
      color: 'text-[#E8E6E1]',
      bg: 'bg-[#E8E6E1]/10',
    },
    {
      title: 'Productos Activos',
      value: activeProductsCount || 0,
      icon: Package,
      color: 'text-info',
      bg: 'bg-info/10',
    },
    {
      title: 'Tasa de Conversión',
      value: '—', // Requires advanced analytics setup
      icon: TrendingUp,
      color: 'text-foreground-muted',
      bg: 'bg-surface-hover',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Dashboard</h1>
        <p className="text-sm text-foreground-muted">
          Resumen de tu tienda de un vistazo.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="bg-surface border border-border rounded-xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium text-foreground-muted">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <span className="text-3xl font-bold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Últimos Pedidos */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold font-heading">Últimos Pedidos</h2>
          <Link
            href="/admin/pedidos"
            className="text-sm text-[#E8E6E1] hover:text-[#E8E6E1]-hover transition-colors"
          >
            Ver todos
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground-muted uppercase bg-surface-hover">
              <tr>
                <th scope="col" className="px-6 py-3 rounded-tl-lg">Pedido</th>
                <th scope="col" className="px-6 py-3">Cliente</th>
                <th scope="col" className="px-6 py-3">Fecha</th>
                <th scope="col" className="px-6 py-3">Total</th>
                <th scope="col" className="px-6 py-3 rounded-tr-lg">Estado</th>
              </tr>
            </thead>
            <tbody>
              {typedRecentOrders?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-foreground-muted">
                    No hay pedidos todavía.
                  </td>
                </tr>
              ) : (
                typedRecentOrders?.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-border hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-[#E8E6E1]">
                      <Link href={`/admin/pedidos/${order.id}`}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{order.customer_name}</td>
                    <td className="px-6 py-4">
                      {new Date(order.created_at).toLocaleDateString('es-CO')}
                    </td>
                    <td className="px-6 py-4 font-medium">
                      {formatCOP(order.total)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                          order.status === 'pendiente'
                            ? 'bg-warning/10 text-warning'
                            : order.status === 'confirmado'
                            ? 'bg-info/10 text-info'
                            : order.status === 'enviado' || order.status === 'entregado'
                            ? 'bg-success/10 text-success'
                            : 'bg-error/10 text-error'
                        }`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
