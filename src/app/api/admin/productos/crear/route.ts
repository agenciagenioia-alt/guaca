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
  const productStr = formData.get('product')
  const variantsStr = formData.get('variants')
  if (typeof productStr !== 'string' || typeof variantsStr !== 'string') {
    return NextResponse.json({ error: 'Faltan product o variants' }, { status: 400 })
  }

  const product = JSON.parse(productStr) as {
    name: string
    slug: string
    description?: string | null
    materials_care?: string | null
    price: number
    original_price?: number | null
    category_id: string
    is_active: boolean
    is_featured: boolean
    low_stock_alert: number
  }
  const variants = JSON.parse(variantsStr) as Array<{ size: string; stock: number }>
  const imageFiles = formData.getAll('images').filter((f): f is File => f instanceof File && f.size > 0)

  const supabase = createServiceRoleClient() as ReturnType<typeof createServiceRoleClient>

  try {
    const { data: newProduct, error: productError } = await (supabase as any)
      .from('products')
      .insert({
        name: product.name,
        slug: product.slug,
        description: product.description ?? null,
        materials_care: product.materials_care ?? null,
        price: product.price,
        original_price: product.original_price ?? null,
        category_id: product.category_id,
        is_active: product.is_active,
        is_featured: product.is_featured,
        low_stock_alert: product.low_stock_alert,
      })
      .select('id, slug')
      .single()

    if (productError) throw productError
    const id = (newProduct as { id: string; slug: string }).id
    const slug = (newProduct as { id: string; slug: string }).slug

    const variantsToInsert = variants.map((v, index) => ({
      product_id: id,
      size: v.size,
      stock: v.stock,
      display_order: index,
    }))
    const { error: variantError } = await (supabase as any).from('product_variants').insert(variantsToInsert)
    if (variantError) throw variantError

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
        is_primary: i === 0,
        display_order: i,
      })
      if (imgError) throw imgError
    }

    revalidatePath('/', 'layout')
    revalidatePath('/')
    revalidatePath('/catalogo')
    if (slug) revalidatePath(`/producto/${slug}`)

    return NextResponse.json({ ok: true, id, slug })
  } catch (err: any) {
    console.error('Error crear producto admin:', err)
    return NextResponse.json({ error: err?.message || 'Error al crear producto' }, { status: 500 })
  }
}
