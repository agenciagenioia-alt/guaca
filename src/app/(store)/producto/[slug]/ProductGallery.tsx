'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import type { ProductImage } from '@/lib/types/database'
import { WishlistButton } from '@/components/product/WishlistButton'

interface ProductGalleryProps {
    images: ProductImage[]
    productName: string
    productId: string
    productSlug: string
    productPrice: number
    productOriginalPrice?: number
}

export function ProductGallery({ images, productName, productId, productSlug, productPrice, productOriginalPrice }: ProductGalleryProps) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isLightboxOpen, setIsLightboxOpen] = useState(false)

    const scrollRef = useRef<HTMLDivElement>(null)

    const handleThumbClick = (i: number) => {
        if (i !== activeIndex) {
            setActiveIndex(i)
        }
    }

    const handleScroll = () => {
        if (!scrollRef.current) return
        const scrollLeft = scrollRef.current.scrollLeft
        const width = scrollRef.current.clientWidth
        // Adding a slight offset for calculation robustness
        const newIndex = Math.round(scrollLeft / width)
        if (newIndex !== activeIndex) {
            setActiveIndex(newIndex)
        }
    }

    // Lightbox escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsLightboxOpen(false)
        }
        if (isLightboxOpen) window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isLightboxOpen])

    if (images.length === 0) {
        return (
            <div className="aspect-[4/5] bg-surface rounded-none flex items-center justify-center">
                <p className="text-foreground-muted font-mono uppercase tracking-widest">Sin imagen</p>
            </div>
        )
    }

    const displayImages = images.slice(0, 5) // max 5 thumbnails for desktop

    return (
        <div className="flex flex-col gap-4 w-full select-none">

            {/* BOTÓN FLOTANTE UNIVERSAL DE WISHLIST */}
            <WishlistButton
                product={{
                    id: productId,
                    name: productName,
                    slug: productSlug,
                    price: productPrice,
                    originalPrice: productOriginalPrice,
                    imageUrl: images[0]?.image_url || ''
                }}
                className="top-2 right-2 md:top-4 md:right-4"
            />

            {/* MOBILE GALLERY (Horizontal Swipe + flechas) */}
            <div className="md:hidden relative w-full">
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar w-full"
                    style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {images.map((img, i) => (
                        <div key={img.id} className="w-full shrink-0 snap-center relative aspect-[4/5] bg-surface">
                            <Image
                                src={img.image_url}
                                alt={`${productName} - Vista ${i + 1}`}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                priority={i === 0}
                            />
                        </div>
                    ))}
                </div>
                {/* Flechas móvil */}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => {
                                const next = activeIndex === 0 ? images.length - 1 : activeIndex - 1
                                setActiveIndex(next)
                                scrollRef.current?.scrollTo({ left: next * (scrollRef.current?.clientWidth ?? 0), behavior: 'smooth' })
                            }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 border border-border shadow flex items-center justify-center text-foreground"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const next = activeIndex === images.length - 1 ? 0 : activeIndex + 1
                                setActiveIndex(next)
                                scrollRef.current?.scrollTo({ left: next * (scrollRef.current?.clientWidth ?? 0), behavior: 'smooth' })
                            }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-background/90 border border-border shadow flex items-center justify-center text-foreground"
                            aria-label="Siguiente imagen"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </>
                )}
                {/* Dots Indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === activeIndex ? 'w-6 bg-foreground' : 'w-1.5 bg-foreground/20'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* DESKTOP GALLERY (Crossfade, flechas y thumbnails) */}
            <div className="hidden md:flex flex-col gap-4">
                {/* Main Image View con flechas */}
                <div className="relative aspect-[4/5] w-full bg-surface overflow-hidden group">
                    {displayImages.map((img, i) => (
                        <Image
                            key={img.id}
                            src={img.image_url}
                            alt={`${productName} - Vista ${i + 1}`}
                            fill
                            className={`object-cover transition-opacity duration-200 ease-in-out cursor-zoom-in ${i === activeIndex ? 'opacity-100 relative z-10' : 'opacity-0 absolute inset-0 z-0'}`}
                            sizes="60vw"
                            priority={i === 0}
                            onClick={() => setIsLightboxOpen(true)}
                        />
                    ))}
                    {/* Flechas para pasar imágenes */}
                    {displayImages.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev === 0 ? displayImages.length - 1 : prev - 1)) }}
                                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-background/90 hover:bg-background border border-border shadow-md flex items-center justify-center text-foreground transition-all hover:scale-105"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setActiveIndex((prev) => (prev === displayImages.length - 1 ? 0 : prev + 1)) }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-background/90 hover:bg-background border border-border shadow-md flex items-center justify-center text-foreground transition-all hover:scale-105"
                                aria-label="Siguiente imagen"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}
                </div>

                {/* Bottom Thumbnails */}
                {displayImages.length > 1 && (
                    <div className="flex gap-3">
                        {displayImages.map((img, i) => (
                            <button
                                key={img.id}
                                onClick={() => handleThumbClick(i)}
                                className={`relative w-[80px] h-[80px] shrink-0 overflow-hidden outline-none bg-surface ${i === activeIndex ? 'border border-foreground' : 'border border-transparent hover:border-foreground/30'} transition-all duration-200 cursor-pointer`}
                            >
                                <Image
                                    src={img.image_url}
                                    alt="thumbnail"
                                    fill
                                    className={`object-cover ${i !== activeIndex ? 'opacity-60' : 'opacity-100'}`}
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* FULLSCREEN LIGHTBOX (Desktop Only) */}
            {isLightboxOpen && (
                <div
                    className="hidden md:flex fixed inset-0 z-[200] bg-background/95 backdrop-blur-lg items-center justify-center p-8 animate-in fade-in duration-300"
                    onClick={() => setIsLightboxOpen(false)}
                >
                    <button
                        className="absolute top-8 right-8 text-foreground-muted hover:text-foreground transition-colors z-50 p-3 bg-surface rounded-full hover:bg-surface-hover shadow-sm"
                        onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false) }}
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <div className="relative w-full h-full max-w-5xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
                        <Image
                            src={displayImages[activeIndex]?.image_url || images[0].image_url}
                            alt={productName}
                            fill
                            className="object-contain"
                            sizes="100vw"
                            quality={100}
                            priority
                        />
                    </div>
                </div>
            )}

            <style jsx global>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    )
}
