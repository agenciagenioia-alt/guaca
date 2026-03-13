import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import {
  crearOrdenBodySchema,
  validateOrderTotal,
  MAX_BODY_SIZE,
} from '@/lib/api-validate'

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type debe ser application/json' },
        { status: 400 }
      )
    }

    const raw = await req.text()
    if (raw.length > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: 'Cuerpo de la solicitud demasiado grande' },
        { status: 413 }
      )
    }

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const parsed = crearOrdenBodySchema.safeParse(body)
    if (!parsed.success) {
      const msg = parsed.error.flatten().formErrors[0] || 'Datos inválidos'
      return NextResponse.json({ error: msg }, { status: 400 })
    }

    const { items, customer, total } = parsed.data

    if (!validateOrderTotal(items, total)) {
      return NextResponse.json(
        { error: 'El total no coincide con los productos' },
        { status: 400 }
      )
    }
    const supabase = (await createClient()) as any
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id ?? null

    const timestamp = Date.now()
    const orderNumber = `LG-${new Date().getFullYear()}-${String(timestamp).slice(-4)}`

    const orderPayload = {
      order_number: orderNumber,
      customer_name: customer.name,
      customer_phone: customer.phone,
      customer_address: customer.address,
      customer_city: customer.city,
      notes: customer.notes ?? null,
      total,
      status: 'pendiente',
    } as Record<string, unknown>

    // Si la tabla tiene user_id y customer_email (migración Paso 3), los usamos
    const orderPayloadExtended = {
      ...orderPayload,
      user_id: userId,
      customer_email: customer.email?.trim() || null,
    }

    let order: { id: string } | null = null

    const result = await supabase
      .from('orders')
      .insert(orderPayloadExtended)
      .select('id')
      .single()

    if (result.error) {
      const msg = (result.error.message || '').toLowerCase()
      const missingColumn = msg.includes('column') && (msg.includes('user_id') || msg.includes('customer_email') || msg.includes('does not exist'))
      if (missingColumn) {
        const fallback = await supabase
          .from('orders')
          .insert(orderPayload)
          .select('id')
          .single()
        if (fallback.error) {
          return NextResponse.json(
            { error: fallback.error.message || 'Error creando orden' },
            { status: 500 }
          )
        }
        order = fallback.data
      } else {
        return NextResponse.json(
          { error: result.error.message || 'Error creando orden' },
          { status: 500 }
        )
      }
    } else {
      order = result.data
    }

    if (!order) {
      return NextResponse.json({ error: 'Error creando orden' }, { status: 500 })
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      size: item.size,
      quantity: item.quantity,
      unit_price: item.unitPrice,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      return NextResponse.json({ error: 'Error guardando items del pedido' }, { status: 500 })
    }

    const amountInCents = Math.round(Number(total) * 100)
    const currency = 'COP'

    // Priorizar variables de entorno (Vercel/producción); si no hay, usar store_config
    const envPublic = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY?.trim()
    const envIntegrity = process.env.WOMPI_INTEGRITY_KEY?.trim()
    let publicKey = envPublic || null
    let integrityKey = envIntegrity || null
    if (!publicKey || !integrityKey) {
      const { data: config } = await supabase
        .from('store_config')
        .select('wompi_public_key, wompi_integrity_key')
        .eq('id', 1)
        .single()
      const cfg = config as { wompi_public_key?: string; wompi_integrity_key?: string } | null
      if (!publicKey) publicKey = cfg?.wompi_public_key?.trim() || null
      if (!integrityKey) integrityKey = cfg?.wompi_integrity_key?.trim() || null
    }

    if (!publicKey || !integrityKey) {
      return NextResponse.json({ error: 'Configuración de pago incompleta. Revisa NEXT_PUBLIC_WOMPI_PUBLIC_KEY y WOMPI_INTEGRITY_KEY en Vercel.' }, { status: 500 })
    }
    const pk = publicKey.trim()
    const sigSecret = integrityKey.trim()
    if (!pk || !sigSecret) {
      return NextResponse.json({ error: 'Llaves de Wompi vacías. Revisa las variables en Vercel.' }, { status: 500 })
    }
    // Firma Wompi: Reference + Amount (centavos) + Currency + IntegritySecret
    const signatureString = `${orderNumber}${amountInCents}${currency}${sigSecret}`
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex')

    return NextResponse.json({
      orderId: order.id,
      orderNumber,
      amountInCents,
      signature,
      publicKey: pk,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error interno'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}
