import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  let body: { status?: string; tracking_code?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 })
  }

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() }
  if (body.status != null) updatePayload.status = body.status
  if (body.tracking_code != null) updatePayload.tracking_code = body.tracking_code

  const { error } = await (supabase as any).from('orders').update(updatePayload).eq('id', id)
  if (error) {
    console.error('Error update order:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = _request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const { error: itemsError } = await (supabase as any).from('order_items').delete().eq('order_id', id)
  if (itemsError) {
    console.error('Error delete order_items:', itemsError)
    return NextResponse.json({ error: itemsError.message }, { status: 500 })
  }
  const { error: orderError } = await (supabase as any).from('orders').delete().eq('id', id)
  if (orderError) {
    console.error('Error delete order:', orderError)
    return NextResponse.json({ error: orderError.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
