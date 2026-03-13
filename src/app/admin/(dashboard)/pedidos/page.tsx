import { createClient } from '@/lib/supabase/server'
import { Search } from 'lucide-react'
import { PedidosList } from './PedidosList'

export const metadata = {
  title: 'Pedidos | La Guaca Admin',
}

export default async function AdminPedidosPage() {
  const supabase = await createClient()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, created_at, total, status, wompi_reference')
    .order('created_at', { ascending: false })

  const initialOrders = (orders ?? []) as {
    id: string
    order_number: string
    customer_name: string
    customer_phone: string
    created_at: string
    total: number
    status: string
    wompi_reference: string | null
  }[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">Pedidos</h1>
        <p className="text-sm text-foreground-muted">
          Revisa y gestiona las compras realizadas. Los nuevos pedidos aparecen en tiempo real.
        </p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground-muted" />
            <input
              type="text"
              placeholder="Buscar por ID, nombre o celular..."
              disabled
              className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-md text-sm text-foreground focus:border-[rgba(232,230,225,0.25)] opacity-50 cursor-not-allowed"
              title="Búsqueda no implementada en MVP"
            />
          </div>
        </div>

        <PedidosList initialOrders={initialOrders} />
      </div>
    </div>
  )
}
