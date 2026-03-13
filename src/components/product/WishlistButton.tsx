'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useWishlistStore, type WishlistItem } from '@/store/wishlist'

interface WishlistButtonProps {
    product: Omit<WishlistItem, 'addedAt'>
    className?: string
}

export function WishlistButton({ product, className = "" }: WishlistButtonProps) {
    const { toggleItem, isLiked } = useWishlistStore()
    const [mounted, setMounted] = useState(false)
    const [animateLike, setAnimateLike] = useState(false)

    // Evitar hidratations errors
    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return (
        <button
            className={`absolute top-3 right-3 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md pointer-events-none ${className}`}
            aria-hidden="true"
        >
            <Heart className="w-4 h-4 text-foreground opacity-50" />
        </button>
    )

    const liked = isLiked(product.id)

    const handleToggle = (e: React.MouseEvent) => {
        // Prevenir redirección al link del card
        e.preventDefault()
        e.stopPropagation()

        if (!liked) {
            setAnimateLike(true)
            setTimeout(() => setAnimateLike(false), 300)
        }

        toggleItem(product)
    }

    return (
        <button
            onClick={handleToggle}
            className={`absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full transition-all duration-300 backdrop-blur-md hover:scale-110 active:scale-95
            ${liked ? 'bg-background border border-[var(--border-hover)] shadow-[0_0_15px_rgba(232,230,225,0.05)]' : 'bg-background/40 border border-border hover:bg-background hover:border-border-hover'}
            ${className}`}
            aria-label={liked ? "Eliminar de lista de deseos" : "Agregar a lista de deseos"}
            title={liked ? "Eliminar de mis favoritos" : "Guardar para después"}
        >
            <Heart
                className={`w-[18px] h-[18px] transition-all duration-300
                ${liked ? 'fill-foreground text-foreground stroke-foreground' : 'text-foreground/80'}
                ${animateLike ? 'animate-[ping_0.3s_cubic-bezier(0,0,0.2,1)_1]' : ''}
                `}
                strokeWidth={liked ? 0 : 2}
            />
        </button>
    )
}
