import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

/** Sube un archivo al bucket product-images y devuelve la URL pública. Uso: FormData con "file" y opcional "folder". */
export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file')
  const folder = (formData.get('folder') as string) || 'admin'
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
  }

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${folder}/${Date.now()}.${ext}`
  const buf = Buffer.from(await file.arrayBuffer())

  const { error } = await (supabase as any).storage.from('product-images').upload(path, buf, {
    contentType: file.type,
    upsert: true,
  })
  if (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const { data } = (supabase as any).storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
