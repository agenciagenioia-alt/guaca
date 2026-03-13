import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Devuelve una URL firmada para subir archivos directamente desde el navegador a Supabase Storage.
 * Así se evita el límite de 4.5 MB del body en Vercel y se permiten videos pesados.
 * Body: JSON { folder: string, filename: string }
 */
export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: { folder?: string; filename?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
  }

  const folder = typeof body.folder === 'string' ? body.folder : 'admin'
  const filename = typeof body.filename === 'string' ? body.filename : ''
  const ext = filename.split('.').pop()?.toLowerCase() || 'bin'
  const path = `${folder}/${Date.now()}.${ext}`

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const bucket = (supabase as any).storage.from('product-images')

  const { data: signData, error: signError } = await bucket.createSignedUploadUrl(path, { upsert: true })
  if (signError) {
    console.error('createSignedUploadUrl error:', signError)
    return NextResponse.json(
      { error: signError.message || 'Error al crear URL de subida' },
      { status: 500 }
    )
  }

  const { data: urlData } = (supabase as any).storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({
    path: signData.path,
    token: signData.token,
    publicUrl: urlData.publicUrl,
  })
}
