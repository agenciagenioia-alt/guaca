import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import AdminProductList from '@/components/admin/AdminProductList'

export const metadata = {
  title: 'Productos | La Guaca Admin',
}

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: rawProducts } = await supabase
    .from('products')
    .select(`
      id, name, slug, price, original_price, is_active, is_featured,
      category:categories(name),
      images:product_images(image_url)
    `)
    .order('created_at', { ascending: false })

  const products = (rawProducts ?? []) as {
    id: string
    name: string
    slug: string
    price: number
    original_price: number | null
    is_active: boolean
    is_featured: boolean
    category: { name: string } | null
    images: { image_url: string }[] | null
  }[]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Productos</h1>
          <p className="text-sm text-foreground-muted">
            Gestiona el catálogo de tu tienda. Filtra por categoría o abre/cierra bloques.
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="flex items-center gap-2 bg-[#E8E6E1] text-background font-bold px-4 py-2 rounded-md hover:bg-[#E8E6E1]-hover transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      <AdminProductList products={products} />
    </div>
  )
}
