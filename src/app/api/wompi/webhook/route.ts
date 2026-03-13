import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import crypto from 'crypto'

interface WompiWebhookData {
  event: string
  data: {
    transaction: {
      id: string
      status: string
      reference: string
    }
  }
}

const WEBHOOK_MAX_BODY = 8 * 1024 // 8 KB

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    if (raw.length > WEBHOOK_MAX_BODY) {
      return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
    }
    let body: WompiWebhookData
    try {
      body = JSON.parse(raw) as WompiWebhookData
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const signature = req.headers.get('x-event-checksum')
    const eventsKey = process.env.WOMPI_EVENTS_KEY

    // Si tienes WOMPI_EVENTS_KEY, validamos la firma; si no, aceptamos el evento igual (Wompi no siempre muestra la Events key)
    if (eventsKey && signature) {
      const expectedSig = crypto
        .createHash('sha256')
        .update(JSON.stringify(body.data) + eventsKey)
        .digest('hex')
      if (signature !== expectedSig) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    if (body.event === 'transaction.updated') {
      const transaction = body.data?.transaction
      if (transaction?.status === 'APPROVED' && transaction?.reference) {
        const supabase = createServiceRoleClient() as any
        const reference = transaction.reference

        // Obtener la orden (solo si sigue pendiente) con sus items para restar stock
        const { data: order } = await supabase
          .from('orders')
          .select('id, order_number, status')
          .eq('order_number', reference)
          .eq('status', 'pendiente')
          .single()

        if (order) {
          const { data: items } = await supabase
            .from('order_items')
            .select('product_id, size, quantity')
            .eq('order_id', order.id)

          if (items?.length) {
            for (const item of items) {
              await supabase.rpc('decrement_stock', {
                p_product_id: item.product_id,
                p_size: item.size,
                p_quantity: item.quantity ?? 1,
              })
            }
          }

          await supabase
            .from('orders')
            .update({
              status: 'confirmado',
              wompi_reference: reference,
            })
            .eq('id', order.id)
        }
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
