import { createClient } from '@/lib/supabase/server'
import { unstable_noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product, ProductImage, ProductVariant } from '@/lib/types/database'
import Link from 'next/link'
import CategoryReveal from '@/components/ui/CategoryReveal'

type ProductWithRelations = Product & {
    images?: ProductImage[]
    variants?: ProductVariant[]
}

interface Props {
    params: Promise<{ categoria: string }>
}

export default async function CategoriaPage({ params }: Props) {
    unstable_noStore()
    const { categoria } = await params

    // Create typed server client, escaping strict config typing bounds for generic fetches 
    const supabase = await createClient() as any

    // 1. Buscar la categoría por slug
    const { data: category } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', categoria)
        .eq('is_active', true)
        .single()

    // Si la categoría no existe → 404 dinámico instantaneo (Next Router)
    if (!category) notFound()

    // 2. Buscar productos de esa categoría
    const { data: products } = await supabase
        .from('products')
        .select(`
      *,
      images:product_images(*),
      variants:product_variants(*)
    `)
        .eq('category_id', category.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

    // 3. Guards de safety vs DB nula o RLS triggers inesperados
    const safeProducts = (products ?? []) as ProductWithRelations[]

    return (
        <main className="min-h-[85vh] bg-background">
            <CategoryReveal categoryName={category.name} />
            {/* Header de categoría */}
            <section className="pt-20 pb-10 px-6 border-b border-border text-center">
                <h1 className="font-heading font-bold text-[clamp(48px,10vw,96px)] text-[#E8E6E1] m-0 tracking-tight uppercase">
                    {category.name}
                </h1>
                <p className="text-foreground-muted text-sm mt-2">
                    {safeProducts.length} producto{safeProducts.length !== 1 ? 's' : ''} disponibles
                </p>
            </section>

            {/* Grid de productos o Empty fallback */}
            {safeProducts.length === 0 ? (
                <div className="text-center py-20 px-6 text-foreground-muted flex flex-col items-center justify-center gap-4">
                    <p className="text-xl font-heading tracking-wide">Próximamente nuevos productos</p>
                    <p className="text-sm max-w-md mx-auto">Nuestro equipo de diseño está trabajando en nuevas piezas increíbles para esta colección.</p>
                    <Link
                        href="/catalogo"
                        className="mt-4 text-[#E8E6E1] text-sm font-bold hover:text-[#E8E6E1] transition-colors border border-[rgba(232,230,225,0.25)]/30 hover:border-white/50 px-6 py-3 rounded-full"
                    >
                        Ver todo el catálogo →
                    </Link>
                </div>
            ) : (
                <div className="w-full pt-1">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 md:px-6">
                        {safeProducts.map((product, index) => (
                            <ProductCard key={product.id} product={product} index={index} />
                        ))}
                    </div>
                </div>
            )}
        </main>
    )
}

