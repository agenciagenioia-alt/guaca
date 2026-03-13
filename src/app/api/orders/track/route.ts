import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { trackBodySchema } from '@/lib/api-validate'

const MAX_BODY = 2048 // 2 KB

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
    if (raw.length > MAX_BODY) {
      return NextResponse.json(
        { error: 'Solicitud demasiado grande' },
        { status: 413 }
      )
    }

    let body: unknown
    try {
      body = JSON.parse(raw)
    } catch {
      return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
    }

    const parsed = trackBodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Número de pedido requerido o inválido' },
        { status: 400 }
      )
    }

    const { orderNumber: orderNumberInput, contact } = parsed.data
    const trimmedOrder = orderNumberInput.toUpperCase()
    const contactRaw = contact ?? ''
    const phoneDigits = contactRaw.replace(/\D/g, '')
    const emailLower = contactRaw.includes('@') ? contactRaw.toLowerCase() : ''

    const supabase = createServiceRoleClient() as any

    const TIMEOUT_MS = 10000
    const queryPromise = supabase
      .from('orders')
      .select('*, order_items(*, products(product_images(image_url)))')
      .eq('order_number', trimmedOrder)
      .single()

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Tiempo de espera agotado')), TIMEOUT_MS)
    )

    let order: unknown = null
    let err: { message?: string } | null = null
    try {
      const result = await Promise.race([queryPromise, timeoutPromise]) as { data: unknown; error: { message?: string } | null }
      order = result.data
      err = result.error
    } catch (e) {
      return NextResponse.json(
        { error: e instanceof Error ? e.message : 'Error al consultar el pedido' },
        { status: 502 }
      )
    }

    if (err || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })
    }

    const orderObj = order as { customer_phone?: string; customer_email?: string }

    // Validación suave por teléfono o email si el cliente los proporciona
    if (phoneDigits) {
      const storedPhoneDigits = String(orderObj.customer_phone ?? '').replace(/\D/g, '')
      if (storedPhoneDigits && storedPhoneDigits !== phoneDigits) {
        return NextResponse.json({ error: 'Los datos no coinciden con el pedido' }, { status: 403 })
      }
    }

    if (emailLower) {
      const storedEmail = (orderObj.customer_email ?? '').toLowerCase()
      if (storedEmail && storedEmail !== emailLower) {
        return NextResponse.json({ error: 'Los datos no coinciden con el pedido' }, { status: 403 })
      }
    }

    return NextResponse.json({ order })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

