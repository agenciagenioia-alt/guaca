import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Vincula un pedido (por order_number) al usuario autenticado. */
export async function POST(req: NextRequest) {
  try {
    const { orderNumber } = (await req.json()) as { orderNumber: string }
    if (!orderNumber?.trim()) {
      return NextResponse.json({ error: 'orderNumber requerido' }, { status: 400 })
    }
    const supabase = (await createClient()) as any
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }
    const { error } = await supabase
      .from('orders')
      .update({ user_id: session.user.id })
      .eq('order_number', orderNumber.trim())
    if (error) {
      return NextResponse.json({ error: 'Error al vincular pedido' }, { status: 500 })
    }
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
