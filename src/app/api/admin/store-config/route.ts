import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const formData = await request.formData()
  const configStr = formData.get('config')
  if (typeof configStr !== 'string') {
    return NextResponse.json({ error: 'Falta config' }, { status: 400 })
  }

  const payload = JSON.parse(configStr) as Record<string, unknown>
  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const heroImage = formData.get('heroImage')
  if (heroImage instanceof File && heroImage.size > 0) {
    const ext = heroImage.name.split('.').pop() || 'jpg'
    const path = `hero/${Date.now()}.${ext}`
    const buf = Buffer.from(await heroImage.arrayBuffer())
    const { error: uploadError } = await (supabase as any).storage.from('product-images').upload(path, buf, {
      contentType: heroImage.type,
      upsert: true,
    })
    if (uploadError) {
      console.error('Upload hero image:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
    const { data: urlData } = (supabase as any).storage.from('product-images').getPublicUrl(path)
    payload.hero_image_url = urlData.publicUrl
  }
  const heroVideo = formData.get('heroVideo')
  if (heroVideo instanceof File && heroVideo.size > 0) {
    const ext = heroVideo.name.split('.').pop() || 'mp4'
    const path = `hero/videos/${Date.now()}.${ext}`
    const buf = Buffer.from(await heroVideo.arrayBuffer())
    const { error: uploadError } = await (supabase as any).storage.from('product-images').upload(path, buf, {
      contentType: heroVideo.type,
      upsert: true,
    })
    if (uploadError) {
      console.error('Upload hero video:', uploadError)
      return NextResponse.json({ error: uploadError.message }, { status: 500 })
    }
    const { data: urlData } = (supabase as any).storage.from('product-images').getPublicUrl(path)
    payload.hero_video_url = urlData.publicUrl
  }

  try {
    const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
    const { error } = await (supabase as any).from('store_config').update(payload).eq('id', 1)
    if (error) throw error
    revalidatePath('/', 'layout')
    revalidatePath('/')
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    console.error('Error store-config:', err)
    return NextResponse.json({ error: err?.message || 'Error al guardar' }, { status: 500 })
  }
}
