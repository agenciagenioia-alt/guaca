'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronDown, ChevronRight, Eye, Edit } from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import { DropToggle } from '@/components/admin/DropToggle'
import { ProductDeleteButton } from '@/components/admin/ProductDeleteButton'

export type AdminProduct = {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  is_active: boolean
  is_featured: boolean
  category: { name: string } | null
  images: { image_url: string }[] | null
}

export default function AdminProductList({ products }: { products: AdminProduct[] }) {
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const categoriesWithCount = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of products) {
      const name = p.category?.name || 'Sin categoría'
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [products])

  const groupedByCategory = useMemo(() => {
    const map = new Map<string, AdminProduct[]>()
    for (const p of products) {
      const name = p.category?.name || 'Sin categoría'
      if (!map.has(name)) map.set(name, [])
      map.get(name)!.push(p)
    }
    return map
  }, [products])

  const filteredCategories = categoryFilter
    ? categoriesWithCount.filter(([name]) => name === categoryFilter)
    : categoriesWithCount

  const toggleCollapsed = (category: string) => {
    setCollapsed((prev) => ({ ...prev, [category]: !prev[category] }))
  }

  const expandAll = () => {
    setCollapsed({})
  }

  const collapseAll = () => {
    const next: Record<string, boolean> = {}
    filteredCategories.forEach(([name]) => { next[name] = true })
    setCollapsed(next)
  }

  if (!products.length) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="text-center py-12 text-foreground-muted">
          No hay productos todavía. Haz clic en &quot;Nuevo Producto&quot; para empezar.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtro por categoría */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-foreground-muted mr-1">Categoría:</span>
        <button
          type="button"
          onClick={() => setCategoryFilter('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            categoryFilter === ''
              ? 'bg-[#E8E6E1] text-background'
              : 'bg-surface-hover text-foreground hover:bg-surface-hover/80'
          }`}
        >
          Todas ({products.length})
        </button>
        {categoriesWithCount.map(([name, count]) => (
          <button
            key={name}
            type="button"
            onClick={() => setCategoryFilter(name)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              categoryFilter === name
                ? 'bg-[#E8E6E1] text-background'
                : 'bg-surface-hover text-foreground hover:bg-surface-hover/80'
            }`}
          >
            {name} ({count})
          </button>
        ))}
        <span className="text-xs text-foreground-muted ml-2">
          · <button type="button" onClick={expandAll} className="underline hover:no-underline">Abrir todo</button>
          {' · '}
          <button type="button" onClick={collapseAll} className="underline hover:no-underline">Cerrar todo</button>
        </span>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-foreground-muted uppercase bg-surface-hover">
              <tr>
                <th scope="col" className="px-6 py-4 w-8" />
                <th scope="col" className="px-6 py-4">Producto</th>
                <th scope="col" className="px-6 py-4">Categoría</th>
                <th scope="col" className="px-6 py-4">Precio</th>
                <th scope="col" className="px-6 py-4 text-center">Drop</th>
                <th scope="col" className="px-6 py-4">Estado</th>
                <th scope="col" className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            {filteredCategories.map(([categoryName, count]) => {
              const items = groupedByCategory.get(categoryName) ?? []
              const isCollapsed = collapsed[categoryName]

              return (
                <tbody key={categoryName} className="divide-y divide-border">
                  <tr
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleCollapsed(categoryName)}
                    onKeyDown={(e) => e.key === 'Enter' && toggleCollapsed(categoryName)}
                    className="bg-surface-hover/60 hover:bg-surface-hover cursor-pointer select-none"
                  >
                    <td className="px-4 py-3">
                      {isCollapsed ? (
                        <ChevronRight className="w-4 h-4 text-foreground-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-foreground-muted" />
                      )}
                    </td>
                    <td colSpan={6} className="px-4 py-3">
                      <span className="font-medium text-foreground">{categoryName}</span>
                      <span className="text-foreground-muted ml-2">({count})</span>
                    </td>
                  </tr>
                  {!isCollapsed &&
                    items.map((product) => {
                      const primaryImage = product.images?.[0]?.image_url
                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-surface-hover/50 transition-colors"
                        >
                          <td className="px-6 py-4" />
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
                            {product.original_price != null && product.original_price > product.price && (
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
                    })}
                </tbody>
              )
            })}
          </table>
        </div>
      </div>
    </div>
  )
}
