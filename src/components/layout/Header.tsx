'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X, Heart, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useCartStore } from '@/store/cart'
import { useWishlistStore } from '@/store/wishlist'
import { createClient } from '@/lib/supabase/client'

interface NavLink {
    href: string
    label: string
    isSpecial?: boolean
}

export function Header() {
    const [menuOpen, setMenuOpen] = useState(false)
    const [catDropdownOpen, setCatDropdownOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isVisible, setIsVisible] = useState(true)
    const [lastScrollY, setLastScrollY] = useState(0)
    const [addedId, setAddedId] = useState<number>(0)
    const [categoryLinks, setCategoryLinks] = useState<NavLink[]>([])
    const [staticLinks] = useState<NavLink[]>([
        { href: '/', label: 'INICIO' },
        { href: '/catalogo', label: 'VER TODO', isSpecial: true },
        { href: '/marcas', label: 'MARCAS' },
        { href: '/nosotros', label: 'NOSOTROS' },
    ])
    const catDropdownRef = useRef<HTMLDivElement>(null)
    const catDropdownTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

    const totalItems = useCartStore((s) => s.totalItems)
    const items = useCartStore((s) => s.items)
    const openCart = useCartStore((s) => s.openCart)
    const wishlistItems = useWishlistStore((s) => s.items)

    // Load categories dynamically from Supabase
    useEffect(() => {
        setMounted(true)
        const supabase = createClient() as ReturnType<typeof createClient>
        ;(supabase as any)
            .from('categories')
            .select('name, slug, show_in_navbar')
            .eq('is_active', true)
            .order('display_order')
            .then(({ data }: { data: Array<{ name: string; slug: string; show_in_navbar?: boolean }> | null }) => {
                if (data && data.length > 0) {
                    const visibleCats = data.filter(cat => cat.show_in_navbar !== false)
                    setCategoryLinks(visibleCats.map((cat) => ({
                        href: `/catalogo/${cat.slug}`,
                        label: cat.name.toUpperCase(),
                    })))
                }
            })
    }, [])

    // Close dropdowns on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
                setCatDropdownOpen(false)
            }
        }
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [])

    const handleCatMouseEnter = () => {
        if (catDropdownTimer.current) clearTimeout(catDropdownTimer.current)
        setCatDropdownOpen(true)
    }
    const handleCatMouseLeave = () => {
        catDropdownTimer.current = setTimeout(() => setCatDropdownOpen(false), 200)
    }

    // All links for mobile menu
    const allNavLinks: NavLink[] = [
        { href: '/', label: 'INICIO' },
        ...categoryLinks,
        { href: '/catalogo', label: 'VER TODO', isSpecial: true },
        { href: '/marcas', label: 'MARCAS' },
        { href: '/rastreo', label: 'RASTREAR PEDIDO' },
        { href: '/nosotros', label: 'NOSOTROS' },
    ]

    // Trigger bounce animation when cart changes (items array reference changes)
    useEffect(() => {
        if (!mounted) return
        setAddedId(prev => prev + 1)
    }, [items, mounted])

    // Intelligent Header Scroll Logic
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY

            // Si el menú móvil está abierto, no esconder el header
            if (menuOpen) return

            if (currentScrollY > lastScrollY && currentScrollY > 100) {
                // Scrolling down & past 100px -> hide
                setIsVisible(false)
            } else {
                // Scrolling up -> show
                setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY, menuOpen])

    const itemCount = mounted ? totalItems() : 0
    const wishlistCount = mounted ? wishlistItems.length : 0

    return (
        <header
            className={`sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-[24px] saturate-[180%] border-b border-border transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`}
        >
            <div className="max-w-[1400px] mx-auto flex items-center justify-between h-16 md:h-20 px-6 lg:px-12">

                {/* Logo & Desktop Nav grouped intentionally to change order on mobile */}
                <div className="flex items-center gap-12">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="font-heading text-[14px] tracking-[0.15em] text-foreground hover:text-foreground/80 transition-opacity uppercase font-bold"
                        aria-label="La Guaca — Ir al inicio"
                        onClick={() => setMenuOpen(false)}
                    >
                        LA GUACA
                    </Link>

                    {/* Nav desktop */}
                    <nav
                        className="hidden md:flex items-center gap-8"
                        aria-label="Navegación principal"
                    >
                        <Link
                            href="/"
                            className="group relative text-[11px] uppercase tracking-[0.2em] font-medium text-foreground-muted hover:text-foreground transition-colors"
                        >
                            INICIO
                        </Link>

                        {/* Categories Dropdown */}
                        {categoryLinks.length > 0 && (
                            <div
                                ref={catDropdownRef}
                                className="relative"
                                onMouseEnter={handleCatMouseEnter}
                                onMouseLeave={handleCatMouseLeave}
                            >
                                <button
                                    type="button"
                                    onClick={() => setCatDropdownOpen(o => !o)}
                                    className="flex items-center gap-1 text-[11px] uppercase tracking-[0.2em] font-medium text-foreground-muted hover:text-foreground transition-colors"
                                >
                                    CATEGORÍAS
                                    <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                <div
                                    className={`absolute left-0 top-full mt-3 w-48 bg-surface border border-border shadow-xl py-2 z-50 transition-all duration-200 ${catDropdownOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-1 pointer-events-none'}`}
                                >
                                    {categoryLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setCatDropdownOpen(false)}
                                            className="block px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] text-foreground-muted hover:text-foreground hover:bg-surface-hover transition-colors"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    <div className="my-1 h-[1px] bg-border" />
                                    <Link
                                        href="/catalogo"
                                        onClick={() => setCatDropdownOpen(false)}
                                        className="block px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold text-foreground hover:bg-surface-hover transition-colors"
                                    >
                                        VER TODO →
                                    </Link>
                                </div>
                            </div>
                        )}

                        <Link
                            href="/catalogo"
                            className="group relative text-[11px] uppercase tracking-[0.2em] font-medium text-foreground border border-border px-4 py-1.5 rounded-none hover:bg-surface-hover hover:border-border-hover transition-all"
                        >
                            VER TODO
                        </Link>
                        <Link
                            href="/marcas"
                            className="group relative text-[11px] uppercase tracking-[0.2em] font-medium text-foreground-muted hover:text-foreground transition-colors"
                        >
                            MARCAS
                        </Link>
                        <Link
                            href="/rastreo"
                            className="group relative text-[11px] uppercase tracking-[0.2em] font-medium text-foreground-muted hover:text-foreground transition-colors"
                        >
                            RASTREAR PEDIDO
                        </Link>
                        <Link
                            href="/nosotros"
                            className="group relative text-[11px] uppercase tracking-[0.2em] font-medium text-foreground-muted hover:text-foreground transition-colors"
                        >
                            NOSOTROS
                        </Link>
                    </nav>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">

                    {/* Wishlist Button */}
                    <Link
                        href="/favoritos"
                        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-hover transition-colors"
                        aria-label={`Ver favoritos${wishlistCount > 0 ? `, ${wishlistCount} guardados` : ''}`}
                    >
                        <Heart className="w-[18px] h-[18px] text-foreground" aria-hidden="true" strokeWidth={1.5} />
                        {wishlistCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                                aria-hidden="true"
                            >
                                {wishlistCount > 9 ? '9+' : wishlistCount}
                            </span>
                        )}
                    </Link>

                    {/* Cart button */}
                    <button
                        onClick={openCart}
                        key={addedId} // Forcing re-render to trigger animation
                        className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-hover transition-all/10 transition-colors animate-[cart-bounce_400ms_ease-in-out]"
                        aria-label={`Abrir carrito de compras${itemCount > 0 ? `, ${itemCount} artículos` : ''}`}
                    >
                        <ShoppingBag className="w-[18px] h-[18px] text-foreground" aria-hidden="true" strokeWidth={1.5} />
                        {itemCount > 0 && (
                            <span
                                className="absolute -top-1 -right-1 bg-foreground text-background text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full"
                                aria-hidden="true"
                            >
                                {itemCount > 9 ? '9+' : itemCount}
                            </span>
                        )}
                    </button>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMenuOpen(!menuOpen)}
                        className="flex md:hidden items-center justify-center w-10 h-10 rounded-full hover:bg-surface-hover transition-all/10 transition-colors relative z-50 text-foreground"
                        aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
                        aria-expanded={menuOpen}
                    >
                        {menuOpen ? (
                            <X className="w-5 h-5" aria-hidden="true" strokeWidth={1.5} />
                        ) : (
                            <Menu className="w-5 h-5" aria-hidden="true" strokeWidth={1.5} />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile nav Overlay */}
            <div
                className={`fixed inset-0 min-h-screen bg-background z-40 flex flex-col items-center justify-center transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <nav
                    className="relative z-10 w-full px-6 flex flex-col items-center text-center gap-8"
                    aria-label="Navegación principal móvil"
                >
                    {allNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-4xl font-heading tracking-widest text-foreground-muted hover:text-foreground hover:scale-110 transition-all duration-300"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
