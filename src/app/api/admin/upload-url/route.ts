import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * Devuelve una URL firmada para subir archivos directamente desde el navegador a Supabase Storage.
 * Así se evita el límite de 4.5 MB del body en Vercel y se permiten videos pesados.
 * Body: JSON { folder: string, filename: string }
 */
export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (!isAdminAuthenticated(cookie)) {
      return NextResponse.json({ error: 'Sesión expirada. Cierra sesión y vuelve a entrar al admin.' }, { status: 401 })
    }

    let body: { folder?: string; filename?: string; bucket?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
    }

    const folder = typeof body.folder === 'string' ? body.folder : 'admin'
    const filename = typeof body.filename === 'string' ? body.filename : ''
    const bucketName = typeof body.bucket === 'string' && body.bucket ? body.bucket : 'product-images'
    const ext = filename.split('.').pop()?.toLowerCase() || 'bin'
    const path = `${folder}/${Date.now()}.${ext}`

    const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
    const bucket = (supabase as any).storage.from(bucketName)

    const { data: signData, error: signError } = await bucket.createSignedUploadUrl(path, { upsert: true })
    if (signError) {
      console.error('createSignedUploadUrl error:', signError)
      const msg = signError.message || 'Error al crear URL de subida'
      return NextResponse.json(
        { error: msg.includes('Bucket') || msg.includes('bucket') ? `Bucket "${bucketName}" no existe en Supabase Storage. Créalo en el dashboard de Supabase.` : msg },
        { status: 500 }
      )
    }

    const { data: urlData } = (supabase as any).storage.from(bucketName).getPublicUrl(path)
    return NextResponse.json({
      path: signData.path,
      token: signData.token,
      publicUrl: urlData.publicUrl,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al obtener URL de subida'
    console.error('Upload-url route error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
