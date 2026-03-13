import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/lib/utils'
import { Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { DropToggle } from '@/components/admin/DropToggle'
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton'

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

  const products = rawProducts as {
    id: string
    name: string
    slug: string
    price: number
    original_price: number | null
    is_active: boolean
    is_featured: boolean
    category: { name: string } | null
    images: { image_url: string }[] | null
  }[] | null

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading">Productos</h1>
          <p className="text-sm text-foreground-muted">
            Gestiona el catálogo de tu tienda.
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

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground-muted uppercase bg-surface-hover">
              <tr>
                <th scope="col" className="px-6 py-4">Producto</th>
                <th scope="col" className="px-6 py-4">Categoría</th>
                <th scope="col" className="px-6 py-4">Precio</th>
                <th scope="col" className="px-6 py-4 text-center">Drop</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-foreground-muted">
                    No hay productos todavía. Haz clic en "Nuevo Producto" para empezar.
                  </td>
                </tr>
              ) : (
                products?.map((product) => {
                  const primaryImage = product.images?.[0]?.image_url

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-surface-hover/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-md bg-surface border border-border overflow-hidden shrink-0">
                            {primaryImage ? (
                              <Image
                                src={primaryImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="48px"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-foreground-subtle">
                                N/A
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground line-clamp-1">
                              {product.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-surface-hover px-2.5 py-1 rounded-md text-xs font-medium">
                          {product.category?.name || 'Sin categoría'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {formatCOP(product.price)}
                        {product.original_price && product.original_price > product.price && (
                          <span className="block text-xs text-foreground-subtle line-through">
                            {formatCOP(product.original_price)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <DropToggle productId={product.id} initialFeatured={product.is_featured} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex w-2.5 h-2.5 rounded-full ${
                              product.is_active ? 'bg-success' : 'bg-foreground-muted'
                            }`}
                          />
                          <span className="text-xs font-medium">
                            {product.is_active ? 'Activo' : 'Oculto'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/producto/${product.slug}`}
                            target="_blank"
                            className="p-2 text-foreground-muted hover:text-foreground transition-colors"
                            title="Ver en tienda"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/productos/${product.id}/editar`}
                            className="p-2 text-foreground-muted hover:text-[#E8E6E1] transition-colors"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <ProductDeleteButton productId={product.id} productName={product.name} />
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
