'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import type { ProductVariant } from '@/lib/types/database'
import { Check, Lock, Truck, RefreshCcw } from 'lucide-react'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'

interface ProductActionsProps {
    product: {
        id: string
        name: string
        slug: string
        price: number
    }
    variants: ProductVariant[]
    primaryImage: string
    soldOutMessage?: string | null
    ownerWhatsapp?: string | null
    /** Mensaje que se pre-rellena al abrir WhatsApp. Soporta {{product_name}}. */
    soldOutWhatsappMessage?: string | null
}

const DEFAULT_SOLD_OUT_MESSAGE = 'No disponible — Todas vendidas.'

export function ProductActions({
    product,
    variants,
    primaryImage,
    soldOutMessage,
    ownerWhatsapp,
    soldOutWhatsappMessage,
}: ProductActionsProps) {
    const [selectedSize, setSelectedSize] = useState<string | null>(null)
    const [errorShake, setErrorShake] = useState(false)
    const [added, setAdded] = useState(false)
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)

    const addItem = useCartStore((s) => s.addItem)
    const addToast = useToastStore((s) => s.addToast)
    const totalStock = variants.reduce((sum, v) => sum + (v.stock ?? 0), 0)
    const allSoldOut = totalStock <= 0

    const handleAddToCart = () => {
        if (!selectedSize) {
            setErrorShake(true)
            // Remover la clase despues de la animación (500ms def en CSS)
            setTimeout(() => setErrorShake(false), 800)
            return
        }

        const variant = variants.find((v) => v.size === selectedSize)
        if (!variant || variant.stock <= 0) {
            addToast('Esa talla no está disponible')
            return
        }

        addItem({
            productId: product.id,
            productName: product.name,
            productSlug: product.slug,
            size: selectedSize,
            unitPrice: product.price,
            imageUrl: primaryImage,
        })

        setErrorShake(false)
        setAdded(true)
        addToast('Agregado al carrito')

        if (navigator.vibrate) navigator.vibrate(10)

        // Reset text
        setTimeout(() => setAdded(false), 1500)
    }

    return (
        <div className="flex flex-col gap-6 w-full mt-2">
            {/* Size selector */}
            <div>
                <div className="flex items-center justify-between mb-4 mt-2">
                    <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-foreground-subtle">
                        Talla:
                    </span>
                    <button
                        onClick={() => setIsSizeGuideOpen(true)}
                        className="text-[12px] text-foreground hover:text-foreground-muted transition-colors underline underline-offset-4 decoration-foreground/30 hover:decoration-foreground focus:outline-none font-medium"
                    >
                        Guía de tallas
                    </button>
                </div>

                <div className="flex flex-wrap gap-3">
                    {variants.map((variant) => {
                        const isOutOfStock = variant.stock <= 0
                        const isSelected = selectedSize === variant.size

                        return (
                            <button
                                key={variant.id}
                                onClick={() => {
                                    if (!isOutOfStock) {
                                        setSelectedSize(variant.size)
                                        setErrorShake(false)
                                    }
                                }}
                                disabled={isOutOfStock}
                                title={isOutOfStock ? 'Agotado' : `${variant.size} — ${variant.stock} unidades`}
                                className={`min-w-[48px] min-h-[48px] px-5 font-mono text-base uppercase transition-all flex flex-col items-center justify-center rounded-sm
                                    ${isSelected
                                        ? 'border border-foreground bg-foreground text-background font-bold'
                                        : isOutOfStock
                                            ? 'border border-transparent text-foreground-muted/50 line-through opacity-40 cursor-not-allowed bg-surface font-medium'
                                            : 'border border-border text-foreground hover:border-foreground bg-transparent font-medium hover:bg-surface-hover transition-all'
                                    }`}
                            >
                                <span>{variant.size}</span>
                                {isOutOfStock && <span className="text-[10px] normal-case font-sans mt-0.5">Agotado</span>}
                            </button>
                        )
                    })}
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${errorShake ? 'max-h-12 opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'}`}>
                    <p className="text-[13px] text-error font-medium flex items-center gap-1.5">
                        <span aria-hidden="true" className="text-[16px]">⚠️</span>
                        Selecciona una talla primero
                    </p>
                </div>
            </div>

            {/* CTA Button, FOMO & Trust Badges */}
            <div className="flex flex-col gap-4 mt-2 w-full relative">
                
                {/* FOMO Micro-Interaction */}
                <div className="flex justify-center w-full min-h-[16px]">
                    {selectedSize ? (
                        (() => {
                            const v = variants.find(v => v.size === selectedSize)
                            if (v && v.stock > 0 && v.stock <= 2) {
                                return <p className="text-foreground text-[11px] font-mono tracking-widest animate-pulse flex items-center gap-2">🔥 ÚLTIMA TALLA DISPONIBLE</p>
                            } else if (v && v.stock > 2) {
                                return <p className="text-foreground-muted text-[11px] font-mono tracking-widest flex items-center gap-2">📦 ENVÍO GRATIS HOY</p>
                            }
                            return null
                        })()
                    ) : (
                        <p className="text-foreground-muted text-[11px] font-mono tracking-widest flex items-center gap-2">⚡ ALTA DEMANDA</p>
                    )}
                </div>

                {allSoldOut && (
                    <div className="space-y-3 text-center py-3 px-4 border border-border rounded-none bg-surface/80" role="status">
                        <p className="text-foreground-muted font-mono text-sm tracking-wider">
                            {soldOutMessage?.trim() || DEFAULT_SOLD_OUT_MESSAGE}
                        </p>
                        {ownerWhatsapp && (() => {
                            const cleanNumber = ownerWhatsapp.replace(/\D/g, '')
                            const defaultText = (soldOutWhatsappMessage || 'Hola, vi que este producto está agotado. ¿Tienen algo similar?')
                                .replace(/\{\{product_name\}\}/gi, product.name)
                            const waUrl = `https://wa.me/${cleanNumber}${defaultText ? `?text=${encodeURIComponent(defaultText)}` : ''}`
                            return (
                                <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 w-full max-w-xs mx-auto h-12 bg-[#25D366] hover:bg-[#20bd5a] text-white font-heading font-bold text-sm tracking-widest uppercase rounded-none transition-colors"
                                >
                                    Escribir por WhatsApp
                                </a>
                            )
                        })()}
                    </div>
                )}
                <button
                    id="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={allSoldOut}
                    className={`w-full h-[56px] flex items-center justify-center font-heading tracking-widest uppercase font-bold text-[16px] transition-all duration-200 select-none rounded-none
                        ${added
                            ? 'bg-success text-background border-0'
                            : allSoldOut
                                ? 'bg-foreground/50 text-background/80 cursor-not-allowed border-0'
                                : 'bg-foreground text-background hover:bg-black transition-all border-0 shadow-none'
                        }
                        ${errorShake ? 'animate-shake' : ''}
                    `}
                >
                    {added ? (
                        <span className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                            <Check className="w-5 h-5 stroke-[3]" />
                            ✓ AGREGADO
                        </span>
                    ) : allSoldOut ? (
                        'TODAS VENDIDAS'
                    ) : (
                        'AGREGAR AL CARRITO'
                    )}
                </button>

                <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] text-foreground-subtle font-mono tracking-widest w-full pt-2 uppercase">
                    <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5" /> Pago seguro</span>
                    <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5" /> Envío a Colombia</span>
                    <span className="flex items-center gap-1.5"><RefreshCcw className="w-3.5 h-3.5" /> Cambios fáciles</span>
                </div>
            </div>

            <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20%, 60% { transform: translateX(-6px); }
                    40%, 80% { transform: translateX(6px); }
                }
                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }
            `}</style>
        </div>
    )
}
