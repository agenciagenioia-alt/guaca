'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { formatCOP } from '@/lib/utils'

const DISMISS_KEY = 'laguaca-cart-reminder-dismissed'

export function CartReminderBar() {
    const router = useRouter()
    const pathname = usePathname()
    const items = useCartStore((s) => s.items)
    const totalItems = useCartStore((s) => s.totalItems)
    const totalPrice = useCartStore((s) => s.totalPrice)
    const openCart = useCartStore((s) => s.openCart)

    const [mounted, setMounted] = useState(false)
    const [hidden, setHidden] = useState(false)

    useEffect(() => {
        setMounted(true)
        if (typeof window !== 'undefined') {
            const stored = window.sessionStorage.getItem(DISMISS_KEY)
            if (stored === '1') setHidden(true)
        }
    }, [])

    if (!mounted) return null

    const count = totalItems()
    if (count === 0) return null

    // No mostrar en checkout ni en confirmación
    if (pathname?.startsWith('/checkout') || pathname === '/confirmacion') return null
    if (hidden) return null

    const handleDismiss = () => {
        setHidden(true)
        if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(DISMISS_KEY, '1')
        }
    }

    const first = items[0]
    const subtitle =
        count === 1
            ? first?.productName
            : `${first?.productName ?? ''} + ${count - 1} ${count - 1 === 1 ? 'producto más' : 'productos más'}`

    return (
        <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 pointer-events-none">
            <div className="max-w-[1400px] mx-auto pointer-events-auto">
                <div className="bg-surface/95 backdrop-blur-xl border border-border shadow-[0_12px_45px_rgba(0,0,0,0.45)] px-4 md:px-6 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div className="mt-1 hidden sm:block w-2 h-8 bg-foreground" />
                        <div className="flex flex-col">
                            <p className="text-[11px] font-mono uppercase tracking-[0.25em] text-foreground-subtle">
                                Carrito pendiente
                            </p>
                            <p className="text-[14px] md:text-[15px] font-heading text-foreground m-0">
                                Tienes {count} {count === 1 ? 'producto' : 'productos'} listos para enviar —{' '}
                                <span className="font-semibold">{formatCOP(totalPrice())}</span>
                            </p>
                            {subtitle && (
                                <p className="text-[12px] text-foreground-muted mt-1 line-clamp-1">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        <button
                            type="button"
                            onClick={openCart}
                            className="hidden sm:inline-flex items-center justify-center h-10 px-4 text-[11px] font-mono uppercase tracking-[0.18em] rounded-none border border-border text-foreground hover:bg-surface-hover transition-colors"
                        >
                            Ver carrito
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push('/checkout')}
                            className="inline-flex items-center justify-center h-10 md:h-11 px-6 md:px-8 bg-foreground text-background font-heading text-[13px] md:text-[14px] uppercase tracking-[0.18em] rounded-none hover:bg-black transition-colors"
                        >
                            Finalizar compra
                        </button>
                        <button
                            type="button"
                            onClick={handleDismiss}
                            className="ml-1 text-foreground-muted hover:text-foreground text-[11px] font-mono uppercase tracking-[0.2em]"
                            aria-label="Ocultar recordatorio"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

