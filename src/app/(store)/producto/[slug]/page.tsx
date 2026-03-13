import { createClient } from '@/lib/supabase/server'
import { unstable_noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import { formatCOP, calcDiscount, getTotalStock } from '@/lib/utils'
import type { Metadata } from 'next'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductGallery } from './ProductGallery'
import { ProductActions } from './ProductActions'
import { StickyCartBar } from '@/components/product/StickyCartBar'
import { ProductViewerCount } from '@/components/product/ProductViewerCount'

interface Props {
    params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params
    const supabase = await createClient()
    const { data: productData } = await supabase
        .from('products')
        .select('*, images:product_images(*)')
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    const product = productData as any

    if (!product) return { title: 'Producto no encontrado' }

    const primaryImage = product.images?.find((i: { is_primary: boolean }) => i.is_primary) || product.images?.[0]

    return {
        title: `Comprar ${product.name} Original | La Guaca Colombia`,
        description: product.description?.slice(0, 150) || `Encuentra ${product.name} al mejor precio. Zapatillas y streetwear original con envío seguro a toda Colombia.`,
        openGraph: {
            title: `${product.name} | La Guaca Streetwear`,
            description: `Stock disponible. Encuentra ${product.name} 100% originales. Compra segura online en Colombia.`,
            images: primaryImage ? [{ url: primaryImage.image_url }] : [],
            url: `https://laguaca.co/producto/${product.slug}`,
            siteName: 'La Guaca',
            type: 'website',
        },
    }
}

export default async function ProductoPage({ params }: Props) {
    unstable_noStore()
    const { slug } = await params
    const supabase = await createClient()

    const { data: productData } = await supabase
        .from('products')
        .select(
            '*, images:product_images(*), variants:product_variants(*), category:categories(*)'
        )
        .eq('slug', slug)
        .eq('is_active', true)
        .single()

    const product = productData as any

    if (!product) notFound()

    const totalStock = getTotalStock(product.variants || [])
    const hasDiscount = product.original_price && product.original_price > product.price
    const discount = hasDiscount ? calcDiscount(product.original_price!, product.price) : 0
    const showUrgency = product.low_stock_alert > 0 && totalStock <= product.low_stock_alert && totalStock > 0

    // Productos relacionados (misma categoría)
    const { data: relatedData } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .eq('category_id', product.category_id!)
        .neq('id', product.id)
        .eq('is_active', true)
        .limit(4)

    const related = relatedData as any[]

    const { data: storeConfig } = await supabase
        .from('store_config')
        .select('sold_out_message, sold_out_whatsapp_message, owner_whatsapp, shipping_returns_text')
        .eq('id', 1)
        .single()

    const sortedImages = [...(product.images || [])].sort(
        (a, b) => a.display_order - b.display_order
    )
    const sortedVariants = [...(product.variants || [])].sort(
        (a, b) => a.display_order - b.display_order
    )
    const primaryImage = sortedImages[0]?.image_url || ''

    // Constructor de SEO Estructurado
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        image: primaryImage,
        description: product.description || `Zapatillas Originales ${product.name} compradas en La Guaca Colombia.`,
        sku: product.id,
        offers: {
            '@type': 'Offer',
            url: `https://laguaca.co/producto/${product.slug}`,
            priceCurrency: 'COP',
            price: product.price,
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
            itemCondition: 'https://schema.org/NewCondition',
            availability: totalStock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            seller: {
                '@type': 'Organization',
                name: 'La Guaca'
            }
        },
        brand: {
            '@type': 'Brand',
            name: product.category?.name || 'Streetwear'
        }
    }

    return (
        <div className="min-h-screen bg-background">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Sticky Bar Client Inyector */}
            <StickyCartBar
                product={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                }}
                primaryImage={primaryImage}
                variants={sortedVariants}
            />

            {/* Breadcrumb Area */}
            <div className="border-b border-border bg-surface">
                <nav
                    className="max-w-[1400px] mx-auto px-6 py-4 text-[12px] font-mono uppercase tracking-widest"
                    aria-label="Ruta de navegación"
                >
                    <ol className="flex items-center gap-3 text-foreground-subtle">
                        <li>
                            <a href="/" className="hover:text-foreground transition-colors">
                                Inicio
                            </a>
                        </li>
                        <li aria-hidden="true" className="text-foreground-subtle/40">/</li>
                        <li>
                            <a href="/catalogo" className="hover:text-foreground transition-colors">
                                {product.category ? product.category.name : 'Catálogo'}
                            </a>
                        </li>
                        <li aria-hidden="true" className="text-foreground-subtle/40">/</li>
                        <li className="text-foreground-muted line-clamp-1">{product.name}</li>
                    </ol>
                </nav>
            </div>

            <div className="max-w-[1400px] mx-auto px-0 md:px-6 pb-24 md:pt-10">
                <div className="flex flex-col md:flex-row gap-0 md:gap-16">

                    <div className="w-full md:w-[55%]">
                        <ProductGallery
                            images={sortedImages}
                            productName={product.name}
                            productId={product.id}
                            productSlug={product.slug}
                            productPrice={product.price}
                            productOriginalPrice={product.original_price ?? undefined}
                        />
                    </div>

                    {/* Column 2: Info + Actions (45% width desktop) */}
                    <div className="w-full md:w-[45%] flex flex-col px-6 md:px-0 mt-8 md:mt-0">

                        {/* Title Section */}
                        <div className="flex flex-col gap-3">
                            <h1 className="text-[22px] md:text-[28px] font-body font-bold text-foreground leading-tight tracking-tight">
                                {product.name}
                            </h1>

                            {/* Price Line */}
                            <div className="flex items-center gap-4 flex-wrap" data-testid="product-price">
                                <span className="text-[32px] font-heading text-foreground tracking-widest leading-none">
                                    {formatCOP(product.price)}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span
                                            className="text-[18px] text-foreground-subtle line-through font-mono font-medium"
                                        >
                                            {formatCOP(product.original_price!)}
                                        </span>
                                        <span className="bg-foreground text-background text-[12px] font-bold px-3 py-1 font-mono uppercase tracking-widest rounded-none border border-foreground/10">
                                            AHORRAS {formatCOP(product.original_price! - product.price)}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Urgency & Viewers Line */}
                        <div className="flex flex-col gap-2 mt-6 mb-8 border-y border-border py-4">
                            {showUrgency && (
                                <p
                                    className="flex items-center gap-2 text-[13px] font-bold text-error uppercase tracking-wider animate-pulse"
                                    role="status"
                                >
                                    <span aria-hidden="true">⚡</span>
                                    Últimas {totalStock} unidades disponibles
                                </p>
                            )}
                            <ProductViewerCount />
                        </div>

                        {/* Size selector + Add to cart */}
                        <ProductActions
                            product={{
                                id: product.id,
                                name: product.name,
                                slug: product.slug,
                                price: product.price,
                            }}
                            variants={sortedVariants}
                            primaryImage={primaryImage}
                            soldOutMessage={storeConfig?.sold_out_message ?? null}
                            ownerWhatsapp={storeConfig?.owner_whatsapp ?? null}
                            soldOutWhatsappMessage={storeConfig?.sold_out_whatsapp_message ?? null}
                        />

                        {/* Description Accordions */}
                        <div className="mt-12 space-y-0 border-t border-border">
                            {product.description && (
                                <details className="group border-b border-border overflow-hidden" open>
                                    <summary className="flex items-center justify-between py-5 cursor-pointer text-[13px] font-bold tracking-widest uppercase text-foreground list-none select-none outline-none [&::-webkit-details-marker]:hidden">
                                        DESCRIPCIÓN
                                        <span className="text-foreground-muted group-open:rotate-45 transition-transform duration-300 transform text-xl font-light leading-none">
                                            +
                                        </span>
                                    </summary>
                                    <div className="pb-6 text-[14px] text-foreground-muted leading-relaxed font-body">
                                        {product.description}
                                    </div>
                                </details>
                            )}

                            <details className="group border-b border-border overflow-hidden">
                                <summary className="flex items-center justify-between py-5 cursor-pointer text-[13px] font-bold tracking-widest uppercase text-foreground list-none select-none outline-none [&::-webkit-details-marker]:hidden">
                                    MATERIALES Y CUIDADOS
                                    <span className="text-foreground-muted group-open:rotate-45 transition-transform duration-300 transform text-xl font-light leading-none">
                                        +
                                    </span>
                                </summary>
                                <div className="pb-6 text-[14px] text-foreground-muted leading-relaxed font-body whitespace-pre-line">
                                    {product.materials_care?.trim() || 'Composición 100% Algodón Premium de alto gramaje. Lavar a máquina en frío con colores similares. No usar blanqueador. Secar a la sombra. No planchar sobre el estampado.'}
                                </div>
                            </details>

                            <details className="group border-b border-border overflow-hidden">
                                <summary className="flex items-center justify-between py-5 cursor-pointer text-[13px] font-bold tracking-widest uppercase text-foreground list-none select-none outline-none [&::-webkit-details-marker]:hidden">
                                    ENVÍOS Y DEVOLUCIONES
                                    <span className="text-foreground-muted group-open:rotate-45 transition-transform duration-300 transform text-xl font-light leading-none">
                                        +
                                    </span>
                                </summary>
                                <div className="pb-6 text-[14px] text-foreground-muted leading-relaxed font-body whitespace-pre-line">
                                    {storeConfig?.shipping_returns_text?.trim() || 'Despachamos en 1-2 días hábiles a todo Colombia. Cambios habilitados dentro de los 5 días siguientes a la recepción del pedido.'}
                                </div>
                            </details>
                        </div>
                    </div>
                </div>

                {/* Relacionados (También te puede gustar) */}
                {related && related.length > 0 && (
                    <section className="mt-24 md:mt-32 px-6 md:px-0" aria-labelledby="related-heading">
                        <div className="flex items-center justify-between mb-8 md:mb-10">
                            <h2
                                id="related-heading"
                                className="text-2xl md:text-4xl font-heading font-bold uppercase tracking-tight text-foreground mb-0"
                            >
                                TAMBIÉN TE PUEDE GUSTAR
                            </h2>
                        </div>

                        {/* Horizontal Scroll Snap Mobile -> Grid Desktop */}
                        <div className="w-full flex overflow-x-auto md:grid md:grid-cols-4 gap-4 md:gap-6 snap-x snap-mandatory hide-scrollbar pb-6 -mx-6 px-6 md:mx-0 md:px-0" style={{ scrollbarWidth: 'none' }}>
                            {related.map((p) => (
                                <div key={p.id} className="w-[85vw] sm:w-[50vw] md:w-auto shrink-0 snap-center">
                                    <ProductCard product={p} />
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
