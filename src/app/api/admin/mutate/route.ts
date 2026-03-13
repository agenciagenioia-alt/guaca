import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

const ALLOWED_TABLES = ['categories', 'brands', 'gallery_images', 'reviews'] as const
type TableName = (typeof ALLOWED_TABLES)[number]

function revalidateForTable(table: TableName) {
  revalidatePath('/', 'layout')
  revalidatePath('/')
  if (table === 'categories') revalidatePath('/catalogo')
}

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: { table: string; operation: string; payload?: Record<string, unknown>; id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const { table, operation, payload, id } = body
  if (!ALLOWED_TABLES.includes(table as TableName)) {
    return NextResponse.json({ error: 'Tabla no permitida' }, { status: 400 })
  }
  if (!['insert', 'update', 'delete'].includes(operation)) {
    return NextResponse.json({ error: 'Operación no permitida' }, { status: 400 })
  }

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const tbl = (supabase as any).from(table)

  try {
    if (operation === 'insert') {
      if (!payload || typeof payload !== 'object') {
        return NextResponse.json({ error: 'Falta payload para insert' }, { status: 400 })
      }
      const { error } = await tbl.insert(payload)
      if (error) throw error
    } else if (operation === 'update') {
      if (!id || (!payload || typeof payload !== 'object')) {
        return NextResponse.json({ error: 'Falta id y payload para update' }, { status: 400 })
      }
      const { error } = await tbl.update(payload).eq('id', id)
      if (error) throw error
    } else {
      if (!id) return NextResponse.json({ error: 'Falta id para delete' }, { status: 400 })
      const { error } = await tbl.delete().eq('id', id)
      if (error) throw error
    }
    revalidateForTable(table as TableName)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error mutate:', err)
    return NextResponse.json({ error: err?.message || 'Error' }, { status: 500 })
  }
}
