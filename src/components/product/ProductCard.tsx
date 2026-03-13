'use client'

import Link from 'next/link'
import Image from 'next/image'
import { formatCOP, calcDiscount } from '@/lib/utils'
import type { Product, ProductImage, ProductVariant } from '@/lib/types/database'
import { WishlistButton } from '@/components/product/WishlistButton'
import { useCartStore } from '@/store/cart'
import { ShoppingBag, Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

interface ProductCardProps {
    product: Product & {
        images?: ProductImage[]
        variants?: ProductVariant[]
    }
    index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
    const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0]
    const secondaryImage = product.images?.find((img) => !img.is_primary)

    // Usar siempre las imágenes reales de la base de datos
    const primaryUrl = primaryImage?.image_url || 'https://picsum.photos/seed/placeholder/400/500'
    const secondaryUrl = secondaryImage?.image_url

    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0
    const availableSizes = product.variants?.filter((v) => v.stock > 0).map((v) => v.size) ?? []
    const isOutOfStock = totalStock === 0
    const hasDiscount = product.original_price && product.original_price > product.price
    const discount = hasDiscount ? calcDiscount(product.original_price!, product.price) : 0

    const { addItem, openCart } = useCartStore()

    const [isVisible, setIsVisible] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const cardRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const el = cardRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.disconnect() } },
            { threshold: 0.1 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (isOutOfStock || availableSizes.length === 0) return
        addItem({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            unitPrice: product.price,
            size: availableSizes[0],
            imageUrl: primaryUrl,
        })
        openCart()
    }

    return (
        <article
            ref={cardRef}
            className={`group relative flex flex-col w-full
                opacity-0 translate-y-8 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]
                ${isVisible ? 'opacity-100 translate-y-0' : ''}`}
            style={{ transitionDelay: `${index * 100}ms` }}
            data-testid="product-card"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* CAJA DE IMAGEN (3:4 Aspect) */}
            <div className="relative aspect-[3/4] overflow-hidden bg-surface w-full block transition-all duration-500 group-hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">

                {/* Imagen Principal */}
                <Link
                    href={`/producto/${product.slug}`}
                    className="absolute inset-0 z-0"
                    aria-label={`Ver ${product.name} — ${formatCOP(product.price)}`}
                >
                    {primaryUrl && (
                        <Image
                            src={primaryUrl}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                isHovered && secondaryUrl ? 'opacity-0 scale-105' : 'opacity-100 scale-100'
                            }`}
                            unoptimized={primaryUrl.includes('supabase.co')}
                        />
                    )}

                    {/* Imagen Secundaria (swap en hover) */}
                    {secondaryUrl && (
                        <Image
                            src={secondaryUrl}
                            alt={`${product.name} - vista alternativa`}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                            className={`object-cover transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                                isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                            }`}
                            unoptimized={secondaryUrl.includes('supabase.co')}
                        />
                    )}
                </Link>

                {/* Gradient overlay sutil */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* BADGES */}
                <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 pointer-events-none">
                    {product.is_featured && (
                        <span className="bg-foreground text-background text-[9px] font-bold px-2.5 py-1 font-heading tracking-[0.15em] leading-none uppercase">
                            NUEVO
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-2.5 py-1 font-heading tracking-[0.15em] leading-none">
                            -{discount}%
                        </span>
                    )}
                </div>

                {/* WISHLIST */}
                <WishlistButton
                    product={{
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        originalPrice: product.original_price ?? undefined,
                        imageUrl: primaryUrl
                    }}
                    className="top-3 right-3 w-8 h-8 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 !bg-white/90 hover:!bg-white shadow-lg"
                />

                {/* AGOTADO */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-background/60 backdrop-blur-[3px] flex items-center justify-center z-30 pointer-events-none">
                        <span className="bg-foreground text-background px-4 py-1.5 text-[10px] font-bold font-heading tracking-[0.3em] uppercase">
                            AGOTADO
                        </span>
                    </div>
                )}

                {/* ACCIONES RÁPIDAS EN HOVER */}
                <div className={`absolute bottom-0 left-0 right-0 z-20 p-3 flex gap-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                    <Link
                        href={`/producto/${product.slug}`}
                        className="flex-1 h-10 bg-[rgba(10,10,10,0.92)] text-[rgba(232,230,225,0.96)] font-bold text-[11px] font-heading tracking-[0.12em] uppercase hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg border border-[rgba(232,230,225,0.18)]"
                    >
                        <Eye className="w-3.5 h-3.5 text-[rgba(232,230,225,0.96)]" />
                        VER DETALLES
                    </Link>
                    {!isOutOfStock && (
                        <button
                            onClick={handleAddToCart}
                            className="h-10 w-10 bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                            aria-label="Agregar al carrito"
                        >
                            <ShoppingBag className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* INFO INFERIOR */}
            <div className="pt-4 pb-2 flex flex-col z-10">
                <Link href={`/producto/${product.slug}`}>
                    <h3 className="text-[13px] text-foreground/70 leading-[1.4] line-clamp-2 group-hover:text-foreground transition-colors duration-300 font-body">
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-baseline gap-2.5 mt-1.5">
                    <data value={product.price} className="text-[15px] font-bold text-foreground font-mono tracking-tight">
                        {formatCOP(product.price)}
                    </data>
                    {hasDiscount && (
                        <data value={product.original_price!} className="text-[12px] text-foreground/40 line-through font-mono">
                            {formatCOP(product.original_price!)}
                        </data>
                    )}
                </div>

                {availableSizes.length > 0 && (
                    <div className="flex gap-1 mt-2.5 flex-wrap">
                        {availableSizes.map((size) => (
                            <span key={size} className="text-[10px] font-mono text-foreground/40 tracking-wide uppercase">
                                {size}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </article>
    )
}
