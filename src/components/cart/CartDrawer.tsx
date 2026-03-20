'use client'

import { useCartStore, type CartItem } from '@/store/cart'
import { formatCOP } from '@/lib/utils'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { trackAddToCart, trackRemoveFromCart } from '@/lib/analytics/ga'
interface OutfitProduct {
    id: string
    name: string
    slug: string
    price: number
    imageUrl: string
    defaultSize: string
}

interface CartDrawerProps {
    outfitEnabled?: boolean
    outfitProducts?: OutfitProduct[]
}

export function CartDrawer({ outfitEnabled = false, outfitProducts = [] }: CartDrawerProps) {
    const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, addItem } =
        useCartStore()
    const drawerRef = useRef<HTMLDivElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    // Focus trap y cierre con Escape
    useEffect(() => {
        if (!isOpen) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeCart()
            }
        }

        document.addEventListener('keydown', handleKeyDown)
        document.body.style.overflow = 'hidden'
        closeButtonRef.current?.focus()

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [isOpen, closeCart])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 bg-black/60 z-40"
                        onClick={closeCart}
                        aria-hidden="true"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="fixed top-0 right-0 bottom-0 z-50 w-full md:w-[420px] bg-background border-l border-border flex flex-col shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Carrito de compras"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-2xl font-heading font-bold flex items-center gap-3 text-foreground m-0 leading-none">
                                MI CARRITO
                                <span className="bg-foreground text-background text-sm font-bold min-w-[24px] h-[24px] rounded-full flex items-center justify-center font-mono">
                                    {items.length}
                                </span>
                            </h2>
                            <button
                                ref={closeButtonRef}
                                onClick={closeCart}
                                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-hover transition-colors text-foreground-muted hover:text-foreground"
                                aria-label="Cerrar carrito"
                            >
                                <X className="w-6 h-6" aria-hidden="true" />
                            </button>
                        </div>

                        {/* Items */}
                        {items.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8 text-center">
                                <ShoppingBag className="w-16 h-16 text-foreground-subtle" aria-hidden="true" />
                                <p className="text-foreground-muted text-[15px] font-mono uppercase tracking-widest">Tu carrito está vacío</p>
                                <Link
                                    href="/catalogo"
                                    onClick={closeCart}
                                    className="bg-foreground text-background font-heading tracking-widest uppercase px-8 py-3 hover:bg-black transition-all text-[14px] font-bold mt-2 rounded-none"
                                >
                                    DESCUBRE NUESTROS PRODUCTOS
                                </Link>
                            </div>
                        ) : (
                            <>
                                <ul className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#333 #0f0f0f' }}>
                                    {items.map((item) => (
                                        <CartItemRow
                                            key={`${item.productId}-${item.size}`}
                                            item={item}
                                            onRemove={() => {
                                                trackRemoveFromCart({
                                                    value: item.unitPrice * item.quantity,
                                                    item: {
                                                        item_id: item.productId,
                                                        item_name: item.productName,
                                                        item_variant: item.size,
                                                        price: item.unitPrice,
                                                        quantity: item.quantity,
                                                    },
                                                })
                                                removeItem(item.productId, item.size)
                                            }}
                                            onUpdateQty={(qty) => {
                                                if (qty <= 0) {
                                                    removeItem(item.productId, item.size)
                                                } else {
                                                    updateQuantity(item.productId, item.size, qty)
                                                }
                                            }}
                                        />
                                    ))}
                                </ul>

                                {/* Completa tu outfit (solo si está activado en Admin y hay productos configurados) */}
                                {outfitEnabled && outfitProducts.length > 0 && (
                                    <div className="p-4 md:p-6 pb-2 border-t border-border bg-surface">
                                        <h3 className="text-[11px] font-mono tracking-[0.2em] text-foreground-subtle uppercase mb-4 flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-foreground rounded-full animate-pulse opacity-50" />
                                            COMPLETA TU OUTFIT
                                        </h3>

                                        <div className="flex overflow-x-auto gap-3 pb-4 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none' }}>
                                            {outfitProducts
                                                .filter((u) => !items.some((i) => i.productId === u.id))
                                                .map((upsell) => (
                                                    <div key={upsell.id} className="min-w-[160px] bg-background border border-border p-2 rounded-[2px] snap-start group relative">
                                                        <div className="flex gap-3">
                                                            <div className="w-[50px] h-[60px] relative bg-surface shrink-0 overflow-hidden">
                                                                {upsell.imageUrl ? (
                                                                    <Image
                                                                        src={upsell.imageUrl}
                                                                        alt={upsell.name}
                                                                        fill
                                                                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                                                        sizes="50px"
                                                                        unoptimized={upsell.imageUrl.includes('supabase.co')}
                                                                    />
                                                                ) : (
                                                                    <div className="absolute inset-0 bg-border flex items-center justify-center text-[10px] text-foreground-muted">IMG</div>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col justify-center min-w-0">
                                                                <span className="text-[12px] font-bold text-foreground line-clamp-1 leading-tight">{upsell.name}</span>
                                                                <span className="text-[11px] font-mono text-foreground-subtle mt-1">{formatCOP(upsell.price)}</span>
                                                            </div>
                                                        </div>

                                                        <button
                                                            onClick={() =>
                                                                {
                                                                    addItem({
                                                                        productId: upsell.id,
                                                                        productName: upsell.name,
                                                                        productSlug: upsell.slug,
                                                                        unitPrice: upsell.price,
                                                                        imageUrl: upsell.imageUrl,
                                                                        size: upsell.defaultSize,
                                                                    })
                                                                    trackAddToCart({
                                                                        value: upsell.price,
                                                                        item: {
                                                                            item_id: upsell.id,
                                                                            item_name: upsell.name,
                                                                            item_variant: upsell.defaultSize,
                                                                            price: upsell.price,
                                                                            quantity: 1,
                                                                        },
                                                                    })
                                                                }
                                                            }
                                                            className="w-full mt-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-surface hover:bg-foreground hover:text-background border border-border transition-colors flex justify-center items-center gap-1 text-foreground"
                                                        >
                                                            <Plus className="w-3 h-3" /> AGREGAR
                                                        </button>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                )}

                                {/* Footer con total y CTA */}
                                <div className="p-6 border-t border-border bg-surface">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-foreground font-mono text-sm uppercase tracking-widest font-bold">SUBTOTAL</span>
                                        <data
                                            value={totalPrice()}
                                            className="text-foreground text-xl font-heading font-bold tracking-wider"
                                        >
                                            {formatCOP(totalPrice())}
                                        </data>
                                    </div>
                                    <p className="text-foreground-muted text-[12px] font-mono text-center mb-6 tracking-wide uppercase">
                                        Envío calculado al finalizar la compra
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        <Link
                                            href="/checkout"
                                            onClick={closeCart}
                                            className="block w-full bg-foreground text-background text-center font-heading font-bold tracking-widest uppercase py-4 hover:bg-black transition-all text-lg rounded-none"
                                        >
                                            IR A PAGAR →
                                        </Link>
                                        <button
                                            onClick={closeCart}
                                            className="block w-full border border-border text-foreground bg-transparent text-center font-heading font-bold tracking-widest uppercase py-4 hover:border-foreground hover:bg-transparent transition-colors text-[14px] rounded-none"
                                        >
                                            SEGUIR COMPRANDO
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function CartItemRow({
    item,
    onRemove,
    onUpdateQty,
}: {
    item: CartItem
    onRemove: () => void
    onUpdateQty: (qty: number) => void
}) {
    return (
        <li className="flex gap-4 p-0 bg-transparent group relative">
            <div className="relative w-[72px] h-[90px] shrink-0 bg-surface rounded-none border border-border overflow-hidden">
                <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                    sizes="72px"
                />
            </div>

            <div className="flex-1 flex flex-col justify-between min-w-0 py-0.5">
                <div className="flex justify-between items-start gap-2">
                    <div>
                        <Link
                            href={`/producto/${item.productSlug}`}
                            className="text-[15px] font-bold text-foreground line-clamp-1 hover:text-foreground-muted transition-colors font-body"
                        >
                            {item.productName}
                        </Link>
                        <p className="text-[13px] text-foreground-subtle mt-1 font-mono uppercase">Talla: <span className="text-foreground">{item.size}</span></p>
                    </div>
                    {/* Botón X Oculto que aparece en Hover */}
                    <button
                        onClick={onRemove}
                        className="opacity-0 group-hover:opacity-100 flex items-center justify-center p-1 text-foreground-subtle hover:text-error transition-all"
                        aria-label={`Eliminar ${item.productName} del carrito`}
                    >
                        <X className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex items-center justify-between mt-2">
                    {/* Cantidad Custom UI */}
                    <div className="flex items-center border border-border rounded-none overflow-hidden">
                        <button
                            onClick={() => onUpdateQty(item.quantity - 1)}
                            className="flex items-center justify-center w-[32px] h-[32px] bg-transparent hover:bg-surface-hover transition-colors text-foreground-muted hover:text-foreground"
                            aria-label={`Reducir cantidad de ${item.productName}`}
                        >
                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                        <span className="w-[32px] text-center text-[13px] font-mono text-foreground font-medium" aria-label={`Cantidad: ${item.quantity}`}>
                            {item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQty(item.quantity + 1)}
                            className="flex items-center justify-center w-[32px] h-[32px] bg-transparent hover:bg-surface-hover transition-colors text-foreground-muted hover:text-foreground"
                            aria-label={`Aumentar cantidad de ${item.productName}`}
                        >
                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                    </div>

                    <data value={item.unitPrice * item.quantity} className="text-[14px] text-foreground font-mono font-bold tracking-wide">
                        {formatCOP(item.unitPrice * item.quantity)}
                    </data>
                </div>
            </div>
        </li>
    )
}
