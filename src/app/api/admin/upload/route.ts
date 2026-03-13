import { NextRequest, NextResponse } from 'next/server'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024 // 4 MB (Vercel límite ~4.5 MB)

/** Sube un archivo al bucket product-images y devuelve la URL pública. Uso: FormData con "file" y opcional "folder". */
export async function POST(request: NextRequest) {
  try {
    const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (!isAdminAuthenticated(cookie)) {
      return NextResponse.json({ error: 'Sesión expirada. Cierra sesión y vuelve a entrar al admin.' }, { status: 401 })
    }

    let formData: FormData
    try {
      formData = await request.formData()
    } catch {
      return NextResponse.json({ error: 'Error al leer el archivo. Puede ser demasiado grande (máx. 4 MB).' }, { status: 413 })
    }

    const file = formData.get('file')
    const folder = (formData.get('folder') as string) || 'admin'
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ error: 'Falta archivo o está vacío' }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: 'Archivo demasiado grande (máx. 4 MB). Comprime el video o usa uno más corto.' },
        { status: 413 }
      )
    }

    const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${folder}/${Date.now()}.${ext}`

    let buf: Buffer
    try {
      buf = Buffer.from(await file.arrayBuffer())
    } catch {
      return NextResponse.json({ error: 'Error al procesar el archivo.' }, { status: 500 })
    }

    const { error } = await (supabase as any).storage.from('product-images').upload(path, buf, {
      contentType: file.type || (file.name.endsWith('.mp4') ? 'video/mp4' : 'image/jpeg'),
      upsert: true,
    })
    if (error) {
      console.error('Upload error:', error)
      const msg = error.message || 'Error en el almacenamiento'
      return NextResponse.json(
        { error: msg.includes('Bucket') || msg.includes('bucket') ? 'Bucket de almacenamiento no configurado. Crea el bucket "product-images" en Supabase Storage.' : msg },
        { status: 500 }
      )
    }
    const { data } = (supabase as any).storage.from('product-images').getPublicUrl(path)
    return NextResponse.json({ url: data.publicUrl })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al subir el archivo'
    console.error('Upload route error:', err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
