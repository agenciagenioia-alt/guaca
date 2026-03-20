'use client'

import { useCartStore } from '@/store/cart'
import { formatCOP } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { trackRemoveFromCart } from '@/lib/analytics/ga'

export default function CarritoPage() {
    const { items, removeItem, updateQuantity, totalPrice } = useCartStore()
    const [mounted, setMounted] = useState(false)
    const handleRemove = (item: typeof items[number]) => {
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
    }

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null

    return (
        <div className="min-h-screen">
            <div className="bg-surface py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl font-heading font-bold">Tu Carrito</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
                        <ShoppingBag className="w-20 h-20 text-foreground-subtle" aria-hidden="true" />
                        <div>
                            <p className="text-xl text-foreground-muted mb-2">Tu carrito está vacío</p>
                            <p className="text-sm text-foreground-subtle">
                                Explora nuestro catálogo y encuentra tu próxima pieza favorita
                            </p>
                        </div>
                        <Link
                            href="/catalogo"
                            className="inline-flex items-center gap-2 bg-foreground text-background font-heading tracking-widest font-bold px-8 py-4 rounded-none hover:bg-black transition-colors uppercase"
                        >
                            Ver colección
                            <ArrowRight className="w-5 h-5" aria-hidden="true" />
                        </Link>
                    </div>
                ) : (
                    <>
                        <ul className="space-y-4 mb-8">
                            {items.map((item) => (
                                <li
                                    key={`${item.productId}-${item.size}`}
                                    className="flex gap-4 p-4 bg-surface rounded-lg border border-border"
                                >
                                    <div className="relative w-24 h-30 shrink-0 bg-surface-hover overflow-hidden">
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.productName}
                                            fill
                                            className="object-cover"
                                            sizes="96px"
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <Link
                                                href={`/producto/${item.productSlug}`}
                                                className="font-medium text-foreground hover:text-foreground-muted transition-colors"
                                            >
                                                {item.productName}
                                            </Link>
                                            <p className="text-sm text-foreground-muted mt-1">
                                                Talla: {item.size}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.size,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                    className="flex items-center justify-center w-10 h-10 rounded-md border border-border hover:border-foreground-muted transition-colors"
                                                    aria-label={`Reducir cantidad de ${item.productName}`}
                                                >
                                                    <Minus className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                                <span
                                                    className="w-10 text-center font-medium"
                                                    aria-label={`Cantidad: ${item.quantity}`}
                                                >
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.productId,
                                                            item.size,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                    className="flex items-center justify-center w-10 h-10 rounded-md border border-border hover:border-foreground-muted transition-colors"
                                                    aria-label={`Aumentar cantidad de ${item.productName}`}
                                                >
                                                    <Plus className="w-4 h-4" aria-hidden="true" />
                                                </button>
                                            </div>

                                            <data
                                                value={item.unitPrice * item.quantity}
                                                className="price-cop text-lg font-bold"
                                            >
                                                {formatCOP(item.unitPrice * item.quantity)}
                                            </data>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleRemove(item)}
                                        className="self-start flex items-center justify-center w-10 h-10 text-foreground-subtle hover:text-error transition-colors"
                                        aria-label={`Eliminar ${item.productName} del carrito`}
                                    >
                                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                                    </button>
                                </li>
                            ))}
                        </ul>

                        {/* Subtotal + CTA */}
                        <div className="bg-surface rounded-lg border border-border p-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg text-foreground-muted">Subtotal</span>
                                <data
                                    value={totalPrice()}
                                    className="price-cop text-2xl font-bold"
                                >
                                    {formatCOP(totalPrice())}
                                </data>
                            </div>
                            <Link
                                href="/checkout"
                                className="block w-full bg-foreground text-background font-heading tracking-widest text-center font-bold py-4 rounded-none hover:bg-black transition-colors text-lg uppercase"
                                data-testid="checkout-btn"
                            >
                                IR A PAGAR
                            </Link>
                            <p className="text-xs text-foreground-subtle text-center">
                                Envío calculado al momento de la compra
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
