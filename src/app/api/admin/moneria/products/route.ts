import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

function getSupabase() {
  return createServiceRoleClient() as any
}

function authError(req: NextRequest) {
  const cookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  return !isAdminAuthenticated(cookie)
}

/** POST — crear producto Monería */
export async function POST(request: NextRequest) {
  if (authError(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const supabase = getSupabase()
    const { error, data } = await supabase.from('moneria_products').insert(body).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error al crear producto' }, { status: 500 })
  }
}

/** PATCH — actualizar producto Monería */
export async function PATCH(request: NextRequest) {
  if (authError(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const { id, ...payload } = body
    if (!id) return NextResponse.json({ error: 'Falta el id del producto' }, { status: 400 })
    const supabase = getSupabase()
    const { error, data } = await supabase
      .from('moneria_products')
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error al actualizar producto' }, { status: 500 })
  }
}

/** DELETE — eliminar producto Monería */
export async function DELETE(request: NextRequest) {
  if (authError(request)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const { id } = await request.json()
    if (!id) return NextResponse.json({ error: 'Falta el id del producto' }, { status: 400 })
    const supabase = getSupabase()
    const { error } = await supabase.from('moneria_products').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error al eliminar producto' }, { status: 500 })
  }
}
