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
    const [scrollY, setScrollY] = useState(0)
    const [isMobile, setIsMobile] = useState(false)
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

    // Detección móvil
    useEffect(() => {
        const mql = window.matchMedia('(max-width: 767px)')
        const onMatch = () => setIsMobile(mql.matches)
        onMatch()
        mql.addEventListener('change', onMatch)
        return () => mql.removeEventListener('change', onMatch)
    }, [])

    // Intelligent Header Scroll Logic — en móvil: primero la barra baja un poco, luego se esconde
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY
            setScrollY(currentScrollY)

            if (menuOpen) return

            if (isMobile) {
                // Móvil: al bajar scroll primero la barra "baja" un poco (efecto), luego se esconde
                if (currentScrollY < lastScrollY) {
                    // Scroll up → mostrar
                    setIsVisible(true)
                } else if (currentScrollY > 100) {
                    // Scroll down y pasamos 100px → esconder
                    setIsVisible(false)
                }
            } else {
                if (currentScrollY > lastScrollY && currentScrollY > 100) setIsVisible(false)
                else setIsVisible(true)
            }

            setLastScrollY(currentScrollY)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [lastScrollY, menuOpen, isMobile])

    const itemCount = mounted ? totalItems() : 0
    const wishlistCount = mounted ? wishlistItems.length : 0

    // En móvil: efecto "bajar un poco" al hacer scroll (max 24px) y luego esconder
    const headerTransform = isMobile
        ? (!isVisible ? 'translateY(-100%)' : `translateY(${-Math.min(scrollY * 0.35, 24)}px)`)
        : undefined
    const headerClass = !isMobile
        ? `sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-[24px] saturate-[180%] border-b border-border transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'}`
        : `sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-[24px] saturate-[180%] border-b border-border transition-transform duration-200`

    return (
        <header
            className={headerClass}
            style={headerTransform != null ? { transform: headerTransform } : undefined}
        >
            <div className="max-w-[1400px] mx-auto relative flex items-center justify-between h-16 md:h-20 pl-4 pr-4 sm:pl-6 sm:pr-6 md:px-6 lg:px-12">

                {/* Mobile: iconos a la izquierda (order-1). Desktop: logo+nav a la izquierda (order-1). */}
                <div className="relative z-10 flex items-center gap-1 sm:gap-2 md:gap-4 order-1 md:order-2 md:ml-auto shrink-0">
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
                        key={addedId}
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

                {/* En mobile: logo centrado (absolute). En desktop: logo + nav a la izquierda. */}
                <div className="flex items-center gap-12 flex-1 min-w-0 order-2 md:order-1">
                    {/* Logo: en mobile centrado (absolute), en desktop en flujo normal */}
                    <Link
                        href="/"
                        className="font-heading text-[14px] tracking-[0.15em] text-foreground hover:text-foreground/80 transition-opacity uppercase font-bold absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 md:text-left"
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
            </div>

            {/* Mobile nav Overlay */}
            <div
                className={`fixed inset-0 min-h-screen bg-background z-40 flex flex-col items-center justify-center transition-opacity duration-300 md:hidden ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
            >
                <nav
                    className="relative z-10 w-full px-6 flex flex-col items-center text-center gap-4"
                    aria-label="Navegación principal móvil"
                >
                    {allNavLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            className="text-base font-heading tracking-[0.2em] text-foreground-muted hover:text-foreground transition-colors duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    )
}
