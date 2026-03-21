import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ConfirmacionCliente from '@/components/confirmacion/ConfirmacionCliente'

export const dynamic = 'force-dynamic'

interface ConfirmacionPageProps {
  searchParams: Promise<{ id?: string }> | { id?: string }
}

export default async function ConfirmacionPage({ searchParams }: ConfirmacionPageProps) {
  const resolved = await Promise.resolve(searchParams)
  const transactionId = resolved.id
  if (!transactionId) redirect('/')

  const wompiRes = await fetch(
    `https://production.wompi.co/v1/transactions/${transactionId}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.WOMPI_PRIVATE_KEY}`,
      },
      cache: 'no-store',
    }
  )

  if (!wompiRes.ok) {
    return <ConfirmacionCliente status="error" />
  }

  const wompiData = await wompiRes.json()
  const transaction = wompiData.data
  const isPaid = transaction?.status === 'APPROVED'
  const reference = transaction?.reference

  if (!isPaid || !reference) {
    return <ConfirmacionCliente status="error" />
  }

  const supabase = createServiceRoleClient() as any

  // Obtener orden actual para no restar stock dos veces si recargan la página
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id, status')
    .eq('order_number', reference)
    .single()

  const alreadyConfirmed = existingOrder?.status === 'confirmado'

  const { data: order, error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'confirmado',
      wompi_reference: reference,
    })
    .eq('order_number', reference)
    .select('*, order_items(*, products(product_images(image_url)))')
    .single()

  if (updateError || !order) {
    return <ConfirmacionCliente status="error" />
  }

  // Restar inventario solo la primera vez que se confirma el pago
  if (!alreadyConfirmed && order.order_items && Array.isArray(order.order_items)) {
    for (const item of order.order_items) {
      if (item.product_source === 'moneria') {
        const { data: mp } = await supabase
          .from('moneria_products')
          .select('variants, stock')
          .eq('id', item.product_id)
          .single()
        if (mp) {
          const variants = Array.isArray(mp.variants) ? mp.variants : []
          const updated = variants.map((v: { size: string; stock: number }) =>
            v.size === item.size
              ? { ...v, stock: Math.max(0, v.stock - (item.quantity ?? 1)) }
              : v
          )
          const newTotal = updated.reduce((s: number, v: { stock: number }) => s + v.stock, 0)
          await supabase
            .from('moneria_products')
            .update({ variants: updated, stock: newTotal })
            .eq('id', item.product_id)
        }
      } else {
        await supabase.rpc('decrement_stock', {
          p_product_id: item.product_id,
          p_size: item.size,
          p_quantity: item.quantity,
        })
      }
    }
  }

  const { data: config } = await supabase
    .from('store_config')
    .select('owner_whatsapp')
    .single()

  return (
    <ConfirmacionCliente
      status="success"
      order={order}
      ownerWhatsapp={config?.owner_whatsapp}
    />
  )
}
