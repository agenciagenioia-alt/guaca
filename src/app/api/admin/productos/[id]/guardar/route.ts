import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { isAdminAuthenticated, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!isAdminAuthenticated(cookie)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'ID de producto requerido' }, { status: 400 })
  }

  let body: {
    product: {
      name: string
      description?: string | null
      materials_care?: string | null
      price: number
      original_price?: number | null
      category_id: string
      is_active: boolean
      is_featured: boolean
      low_stock_alert: number
    }
    variants: Array<{ size: string; stock: number }>
    existingImagesCount?: number
    newImageUrls?: string[]
  }
  let imageFiles: File[] = []

  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('multipart/form-data')) {
    const formData = await request.formData()
    const productStr = formData.get('product')
    const variantsStr = formData.get('variants')
    const existingCountStr = formData.get('existingImagesCount')
    if (typeof productStr !== 'string' || typeof variantsStr !== 'string') {
      return NextResponse.json({ error: 'Faltan product o variants' }, { status: 400 })
    }
    body = {
      product: JSON.parse(productStr) as any,
      variants: JSON.parse(variantsStr) as any,
      existingImagesCount: existingCountStr != null ? Number(existingCountStr) : 0,
    }
    const images = formData.getAll('images')
    imageFiles = images.filter((f): f is File => f instanceof File && f.size > 0)
  } else {
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Body JSON inválido' }, { status: 400 })
    }
  }

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>
  const existingCount = body.existingImagesCount ?? 0

  try {
    const priceInt = Math.round(Number(body.product.price)) || 0
    const originalPrice = body.product.original_price != null ? Math.round(Number(body.product.original_price)) : null

    const { error: updateError } = await (supabase as any)
      .from('products')
      .update({
        name: body.product.name,
        description: body.product.description ?? null,
        materials_care: body.product.materials_care?.trim() ?? null,
        price: priceInt,
        original_price: originalPrice,
        category_id: body.product.category_id,
        is_active: body.product.is_active,
        is_featured: body.product.is_featured,
        low_stock_alert: body.product.low_stock_alert ?? 0,
      })
      .eq('id', id)

    if (updateError) throw updateError

    await (supabase as any).from('product_variants').delete().eq('product_id', id)

    const variantsToInsert = body.variants.map((v: { size: string; stock: number }, index: number) => ({
      product_id: id,
      size: String(v.size),
      stock: Number(v.stock) || 0,
      display_order: index,
    }))
    const { error: variantError } = await (supabase as any).from('product_variants').insert(variantsToInsert)
    if (variantError) throw variantError

    const newImageUrls = Array.isArray(body.newImageUrls) ? body.newImageUrls : []
    for (let i = 0; i < newImageUrls.length; i++) {
      const imageUrl = newImageUrls[i]
      if (typeof imageUrl !== 'string' || !imageUrl.trim()) continue
      const { error: imgError } = await (supabase as any).from('product_images').insert({
        product_id: id,
        image_url: imageUrl.trim(),
        is_primary: existingCount === 0 && i === 0,
        display_order: existingCount + i,
      })
      if (imgError) throw imgError
    }

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i]
      const ext = file.name.split('.').pop() || 'jpg'
      const fileName = `${id}/${Date.now()}-${i}.${ext}`
      const buf = Buffer.from(await file.arrayBuffer())
      const { error: uploadError } = await (supabase as any).storage.from('product-images').upload(fileName, buf, {
        contentType: file.type,
        upsert: true,
      })
      if (uploadError) throw uploadError
      const { data: urlData } = (supabase as any).storage.from('product-images').getPublicUrl(fileName)
      const { error: imgError } = await (supabase as any).from('product_images').insert({
        product_id: id,
        image_url: urlData.publicUrl,
        is_primary: existingCount + newImageUrls.length === 0 && i === 0,
        display_order: existingCount + newImageUrls.length + i,
      })
      if (imgError) throw imgError
    }

    const { data: updated } = await (supabase as any).from('products').select('slug').eq('id', id).single()
    const slug = (updated as { slug?: string } | null)?.slug

    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/catalogo')
    if (slug) revalidatePath(`/producto/${slug}`)

    return NextResponse.json({ ok: true, slug })
  } catch (err: any) {
    console.error('Error guardar producto admin:', err)
    const message =
      err?.message ||
      err?.details ||
      (typeof err?.error === 'string' ? err.error : null) ||
      'Error al guardar. Revisa que los datos sean correctos y que el bucket "product-images" exista en Supabase.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
