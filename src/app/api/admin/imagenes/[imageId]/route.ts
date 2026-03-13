import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ imageId: string }> }
) {
  const cookie = _request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { imageId } = await params
  if (!imageId) {
    return NextResponse.json({ error: 'ID de imagen requerido' }, { status: 400 })
  }

  try {
    const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
    const { error } = await (supabase as any).from('product_images').delete().eq('id', imageId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error eliminar imagen:', err)
    return NextResponse.json({ error: err?.message || 'Error al eliminar' }, { status: 500 })
  }
}
