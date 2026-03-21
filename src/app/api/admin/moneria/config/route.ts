import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

/** POST — guardar configuración de sección Monería */
export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  try {
    const body = await request.json()
    const supabase = createServiceRoleClient() as any
    const { error } = await supabase
      .from('moneria_section_config')
      .upsert({ id: 1, ...body })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error al guardar configuración' }, { status: 500 })
  }
}
