'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2 } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist'
import { formatCOP } from '@/lib/utils'
import { WishlistButton } from '@/components/product/WishlistButton'

export default function WishlistPage() {
    const { items, removeItem, clearWishlist } = useWishlistStore()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen bg-[#080808] text-[#E8E6E1] pt-24 pb-32">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Header Wishlist */}
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6 border-b border-white/5 pb-8">
                    <div>
                        <p className="font-mono text-[11px] tracking-[0.4em] text-[#E8E6E1] uppercase mb-3">TU COLECCIÓN</p>
                        <h1 className="font-heading text-4xl md:text-5xl uppercase tracking-tight">WISHLIST</h1>
                    </div>

                    {items.length > 0 && (
                        <button
                            onClick={clearWishlist}
                            className="text-[12px] font-mono tracking-widest uppercase text-[#666] hover:text-[#E8E6E1] transition-colors flex items-center gap-2 w-fit"
                        >
                            <Trash2 className="w-4 h-4" /> VACIAR LISTA
                        </button>
                    )}
                </div>

                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 bg-[#0d0d0d]">
                        <Heart className="w-16 h-16 text-[#E8E6E1]/10 mb-6" strokeWidth={1} />
                        <h2 className="font-heading text-2xl uppercase mb-3">No tienes favoritos aún</h2>
                        <p className="text-[#888] text-[15px] max-w-md mx-auto mb-8 font-body">
                            Explora nuestras colecciones y guarda las prendas que definen tu estilo.
                        </p>
                        <Link
                            href="/catalogo"
                            className="bg-[#E8E6E1] text-[#111110] px-8 py-4 font-heading font-bold uppercase tracking-widest text-[14px] hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors"
                        >
                            DESCUBRIR PRODUCTOS
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {/* Iterando Array Local, Usamos un Custom Card para the Wishlist Page */}
                        {items.map(product => (
                            <article key={product.id} className="group relative flex flex-col bg-[#111] border border-white/5 p-4 md:p-5">
                                <WishlistButton product={product} className="top-6 right-6" />

                                <Link
                                    href={`/producto/${product.slug}`}
                                    className="relative aspect-[4/5] overflow-hidden bg-[#111110] block mb-4"
                                >
                                    <Image
                                        src={product.imageUrl || 'https://picsum.photos/seed/placeholder/400/500'}
                                        alt={product.name}
                                        fill
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </Link>

                                <div className="flex flex-col gap-1">
                                    <Link href={`/producto/${product.slug}`}>
                                        <h3 className="text-[15px] font-bold text-[#E8E6E1] line-clamp-1 hover:text-[#E8E6E1] transition-colors font-body">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <div className="flex items-baseline gap-2 mt-1">
                                        <data value={product.price} className="text-[16px] text-[#E8E6E1] font-mono font-bold tracking-wide">
                                            {formatCOP(product.price)}
                                        </data>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <data value={product.originalPrice} className="text-[12px] text-[#666] line-through font-mono">
                                                {formatCOP(product.originalPrice)}
                                            </data>
                                        )}
                                    </div>

                                    <p className="text-[#666] text-[11px] font-mono mt-3 uppercase tracking-wider">
                                        Agregado el {new Date(product.addedAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
