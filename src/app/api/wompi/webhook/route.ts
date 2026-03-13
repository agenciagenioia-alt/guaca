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

    if (!eventsKey) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const expectedSig = crypto
      .createHash('sha256')
      .update(JSON.stringify(body.data) + eventsKey)
      .digest('hex')

    if (signature !== expectedSig) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    if (body.event === 'transaction.updated') {
      const transaction = body.data?.transaction
      if (transaction?.status === 'APPROVED' && transaction?.reference) {
        const supabase = createServiceRoleClient() as any
        await supabase
          .from('orders')
          .update({
            status: 'confirmado',
            wompi_reference: transaction.reference,
          })
          .eq('order_number', transaction.reference)
          .eq('status', 'pendiente')
      }
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Error' }, { status: 500 })
  }
}
