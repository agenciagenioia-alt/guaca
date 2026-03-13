'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import type { ProductVariant } from '@/lib/types/database'

interface Props {
    product: {
        id: string
        name: string
        slug: string
        price: number
    }
    primaryImage: string
    variants: ProductVariant[]
}

export function StickyCartBar({ product, primaryImage, variants }: Props) {
    const [isVisible, setIsVisible] = useState(false)
    const [selectedSize, setSelectedSize] = useState<string>('')
    const addItem = useCartStore(s => s.addItem)
    const addToast = useToastStore(s => s.addToast)

    useEffect(() => {
        const handleScroll = () => {
            const ctaBtn = document.getElementById('add-to-cart-btn')
            if (ctaBtn) {
                const rect = ctaBtn.getBoundingClientRect()
                // visible si el CTA main no está en el viewport
                if (rect.bottom < 0 || rect.top > window.innerHeight) {
                    setIsVisible(true)
                } else {
                    setIsVisible(false)
                }
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        window.addEventListener('resize', handleScroll)

        // Initial Check
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleScroll)
        }
    }, [])

    const handleAdd = () => {
        if (!selectedSize) return
        const variant = variants.find(v => v.size === selectedSize)
        if (!variant || variant.stock <= 0) return

        addItem({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            size: selectedSize,
            unitPrice: product.price,
            imageUrl: primaryImage,
        })
        addToast('Agregado al carrito')
    }

    if (!isVisible) return null

    return (
        <div className="flex fixed bottom-0 top-auto md:top-[80px] md:bottom-auto left-0 right-0 z-[40] bg-background/95 backdrop-blur-xl border-t md:border-t-0 md:border-b border-border py-3 md:py-3 px-4 md:px-0 animate-in fade-in slide-in-from-bottom-8 md:slide-in-from-top-4 duration-300 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] md:shadow-none">
            <div className="max-w-[1400px] mx-auto w-full md:px-6 flex items-center justify-between gap-4">

                <div className="hidden md:flex items-center gap-4">
                    <div className="relative w-12 h-16 bg-surface overflow-hidden rounded-sm border border-border">
                        <Image src={primaryImage} alt={product.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex flex-col">
                        <h4 className="text-foreground font-heading tracking-widest uppercase text-sm">{product.name}</h4>
                        <p className="font-mono text-foreground text-[13px]">{formatCOP(product.price)}</p>
                    </div>
                </div>

                {/* Mobile Info (Info reducida) */}
                <div className="flex md:hidden flex-col min-w-0 pr-2">
                    <p className="font-mono text-foreground text-[14px] font-bold">{formatCOP(product.price)}</p>
                    <h4 className="text-foreground-muted font-heading tracking-widest uppercase text-[10px] truncate">{product.name}</h4>
                </div>

                <div className="flex items-center gap-2 md:gap-4 flex-1 md:flex-initial">
                    {/* Select Select Native for minimal impact */}
                    <div className="relative min-w-[35%] md:flex-initial flex-1">
                        <select
                            className="w-full appearance-none bg-surface border border-border text-foreground font-mono text-[12px] md:text-[13px] uppercase px-3 md:px-5 py-3 pr-7 outline-none focus:border-foreground cursor-pointer md:min-w-[120px] rounded-sm"
                            value={selectedSize}
                            onChange={e => setSelectedSize(e.target.value)}
                        >
                            <option value="" disabled className="text-foreground-subtle">TALLA</option>
                            {variants.map(v => (
                                <option key={v.id} value={v.size} disabled={v.stock <= 0} className={v.stock <= 0 ? "text-foreground-muted/50" : "text-foreground"}>
                                    {v.size} {v.stock <= 0 ? '(Agotado)' : ''}
                                </option>
                            ))}
                        </select>
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground-muted text-[10px]">▼</span>
                    </div>


                    <button
                        onClick={handleAdd}
                        disabled={!selectedSize}
                        className="flex-1 md:flex-initial bg-foreground text-background font-heading uppercase tracking-widest px-4 md:px-8 py-3 text-[13px] md:text-sm font-bold hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed rounded-none whitespace-nowrap"
                    >
                        AGREGAR →
                    </button>
                </div>

            </div>
        </div>
    )
}
