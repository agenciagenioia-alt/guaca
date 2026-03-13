'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState, useCallback, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { SlidersHorizontal, X } from 'lucide-react'
import type { Product, ProductImage, ProductVariant, Category, Brand } from '@/lib/types/database'

type ProductWithRelations = Product & {
    images: ProductImage[]
    variants: ProductVariant[]
    // relación opcional a marca cuando se use brand_id
    brand?: { name: string; slug: string } | null
}

// Ropa y tallas numéricas en orden (pantalones/calzado hasta 38)
const SIZES = [
    'XS', 'S', 'M', 'L', 'XL', 'XXL', 'ÚNICO',
    '26', '28', '30', '32', '34', '35', '36', '37', '38'
]
const SIZES_INITIAL_COUNT = 10 // cuántas tallas mostrar antes de "Ver más"

function CatalogoContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const [products, setProducts] = useState<ProductWithRelations[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [brands, setBrands] = useState<Brand[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [sizesExpanded, setSizesExpanded] = useState(false)

    const selectedCategory = searchParams.get('categoria') || ''
    const selectedSize = searchParams.get('talla') || ''
    const selectedBrandsParam = searchParams.get('marca') || ''
    const selectedBrands = selectedBrandsParam
        ? selectedBrandsParam.split(',').filter(Boolean)
        : []

    const updateFilter = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) {
            params.set(key, value)
        } else {
            params.delete(key)
        }
        router.push(`/catalogo?${params.toString()}`, { scroll: false })
    }, [searchParams, router])

    const clearFilters = useCallback(() => {
        router.push('/catalogo', { scroll: false })
    }, [router])

    const hasFilters = selectedCategory || selectedSize || selectedBrands.length > 0

    // Cargar categorías y marcas
    useEffect(() => {
        const supabase = createClient()

        Promise.all([
            supabase
                .from('categories')
                .select('*')
                .eq('is_active', true)
                .order('display_order'),
            supabase
                .from('brands')
                .select('*')
                .eq('is_active', true)
                .order('display_order'),
        ]).then(([catRes, brandRes]) => {
            if (catRes.data) setCategories(catRes.data as Category[])
            if (brandRes.data) setBrands(brandRes.data as Brand[])
        })
    }, [])

    // Cargar productos con filtros
    useEffect(() => {
        const loadProducts = async () => {
            const supabase = createClient()
            setLoading(true)
            setError(null)

            const applyClientFilters = (rows: any[] | null) => {
                let filtered = (rows || []) as any[]

                // Filtrar por talla con stock
                if (selectedSize) {
                    filtered = filtered.filter((p) =>
                        p.variants?.some(
                            (v: ProductVariant) => v.size === selectedSize && v.stock > 0
                        )
                    )
                }

                // Filtrar por marcas (multi-marca)
                if (selectedBrands.length > 0) {
                    filtered = filtered.filter((p) => {
                        const name: string = (p.name || '') as string
                        const lower = name.toLowerCase()

                        // 1) Si el producto tiene marca asociada en BD, usamos su slug
                        const brandSlug: string | undefined = (p as any).brand?.slug
                        if (brandSlug) {
                            const normalizedBrand = brandSlug.toLowerCase()
                            if (selectedBrands.some((slug) => slug.toLowerCase() === normalizedBrand)) {
                                return true
                            }
                        }

                        // 2) Fallback: usar el nombre del producto (para productos sin brand_id)
                        return selectedBrands.some((slug) => {
                            const normalized = slug.toLowerCase().replace(/%20/g, ' ')
                            const tokens = normalized.replace(/-/g, ' ').split(/\s+/).filter(Boolean)
                            // Coincide si al menos uno de los tokens de la marca está en el nombre
                            return tokens.some((token) => lower.includes(token))
                        })
                    })
                }

                const safeProducts = filtered ?? []
                setProducts(safeProducts as ProductWithRelations[])
                setLoading(false)
            }

            try {
                // Primer intento: con relación de marca
                let query = supabase
                    .from('products')
                    .select('*, images:product_images(*), variants:product_variants(*), brand:brands(name,slug), categories!inner(slug)')
                    .eq('is_active', true)
                    .order('created_at', { ascending: false })

                if (selectedCategory) {
                    query = query.eq('categories.slug', selectedCategory)
                }

                const { data, error } = await query
                if (error) {
                    throw error
                }
                applyClientFilters(data)
            } catch (err: any) {
                const message = err?.message || ''

                // Fallback silencioso si falla el join con brands (por migraciones a medio aplicar, etc.)
                if (message.includes('brands') || message.includes('brand_id')) {
                    try {
                        let fallbackQuery = supabase
                            .from('products')
                            .select('*, images:product_images(*), variants:product_variants(*), categories!inner(slug)')
                            .eq('is_active', true)
                            .order('created_at', { ascending: false })

                        if (selectedCategory) {
                            fallbackQuery = fallbackQuery.eq('categories.slug', selectedCategory)
                        }

                        const { data: fallbackData, error: fallbackError } = await fallbackQuery
                        if (!fallbackError) {
                            applyClientFilters(fallbackData)
                            return
                        }
                    } catch (fallbackErr) {
                        console.error(fallbackErr)
                    }
                }

                console.error(err)
                setError('Tuvimos un problema cargando los productos. Revisa tu conexión de red o contacta soporte si el problema persiste.')
                setProducts([])
                setLoading(false)
            }
        }

        loadProducts()
    }, [selectedCategory, selectedSize, selectedBrandsParam, categories])

    return (
        <div className="min-h-screen">
            {/* Header de sección */}
            <div className="bg-background py-12 px-4 border-b border-border relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <p className="font-mono text-[11px] tracking-[0.4em] text-foreground-muted uppercase mb-4">DESCUBRE</p>
                    <h1 className="text-5xl md:text-6xl font-heading font-bold uppercase tracking-tight text-foreground m-0">EL CATÁLOGO</h1>
                    <p className="text-foreground-subtle mt-4 font-body max-w-lg mx-auto">
                        Cada prenda que traemos la elegimos basándonos en diseño y autenticidad real.
                    </p>
                </div>
            </div>

            <div className="w-full flex flex-col md:flex-row relative">
                {/* Mobile Fast Horizontal Filters (App-Like) */}
                <div className="w-full md:hidden border-b border-border bg-background/95 backdrop-blur-[10px] sticky top-[60px] z-30">
                    <div className="flex overflow-x-auto snap-x scrollbar-hide px-4 py-3 gap-2">
                        <button
                            onClick={() => updateFilter('categoria', '')}
                            className={`shrink-0 snap-start px-5 py-2 text-[11px] font-mono tracking-widest uppercase rounded-full transition-all duration-300 ${!selectedCategory
                                ? 'bg-foreground text-background font-bold'
                                : 'bg-transparent border border-border text-foreground-muted hover:text-foreground'
                                }`}
                        >
                            Todo
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => updateFilter('categoria', cat.slug)}
                                className={`shrink-0 snap-start px-5 py-2 text-[11px] font-mono tracking-widest uppercase rounded-full transition-all duration-300 ${selectedCategory === cat.slug
                                    ? 'bg-foreground text-background font-bold'
                                    : 'bg-transparent border border-border text-foreground-muted hover:text-foreground'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    {/* Tallas Mini Pills Mobile */}
                    <div className="flex overflow-x-auto snap-x scrollbar-hide px-4 pb-3 pt-1 gap-2">
                        <span className="shrink-0 flex items-center pr-2 text-[10px] font-mono uppercase text-foreground-subtle">Tallas:</span>
                        {(sizesExpanded ? SIZES : SIZES.slice(0, SIZES_INITIAL_COUNT)).map((size) => (
                            <button
                                key={size}
                                onClick={() => updateFilter('talla', selectedSize === size ? '' : size)}
                                className={`shrink-0 snap-start px-4 h-[28px] flex items-center justify-center text-[11px] font-mono font-bold rounded-sm border transition-all duration-300 ${selectedSize === size
                                    ? 'bg-foreground border-foreground text-background shadow-none'
                                    : 'bg-surface border-border text-foreground-subtle hover:text-foreground'
                                    }`}
                            >
                                {size}
                            </button>
                        ))}
                        {SIZES.length > SIZES_INITIAL_COUNT && (
                            <button
                                type="button"
                                onClick={() => setSizesExpanded((v) => !v)}
                                className="shrink-0 snap-start px-3 h-[28px] flex items-center justify-center text-[10px] font-mono text-foreground-muted border border-border rounded-sm"
                            >
                                {sizesExpanded ? 'Menos' : 'Ver más'}
                            </button>
                        )}
                    </div>
                    {/* Marcas Mini Pills Mobile */}
                    {brands.length > 0 && (
                        <div className="flex overflow-x-auto snap-x scrollbar-hide px-4 pb-3 pt-1 gap-2">
                            <span className="shrink-0 flex items-center pr-2 text-[10px] font-mono uppercase text-foreground-subtle">Marcas:</span>
                            {brands.map((brand) => (
                                <button
                                    key={brand.id}
                                    onClick={() => {
                                        const set = new Set(selectedBrands)
                                        if (set.has(brand.slug)) {
                                            set.delete(brand.slug)
                                        } else {
                                            set.add(brand.slug)
                                        }
                                        const value = Array.from(set).join(',')
                                        updateFilter('marca', value)
                                    }}
                                    className={`shrink-0 snap-start px-4 h-[28px] flex items-center justify-center text-[11px] font-mono font-bold rounded-sm border transition-all duration-300 ${
                                        selectedBrands.includes(brand.slug)
                                            ? 'bg-foreground border-foreground text-background shadow-none'
                                            : 'bg-surface border-border text-foreground-subtle hover:text-foreground'
                                    }`}
                                >
                                    {brand.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="w-full flex flex-col md:flex-row">
                    {/* Filtros sidebar */}
                    <aside
                        id="filter-panel"
                        className={`md:w-[260px] shrink-0 p-6 md:p-8 space-y-8 bg-surface border-r border-border min-h-[500px] ${filtersOpen ? 'block' : 'hidden md:block'}`}
                        aria-label="Filtros de productos"
                    >
                        {/* Categorías */}
                        <fieldset>
                            <legend className="text-[11px] font-mono font-bold text-foreground-muted mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                <span className="w-[4px] h-[4px] bg-foreground rounded-full" />
                                Categoría
                            </legend>
                            <div className="flex flex-wrap gap-2" role="group">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() =>
                                            updateFilter(
                                                'categoria',
                                                selectedCategory === cat.slug ? '' : cat.slug
                                            )
                                        }
                                        className={`px-4 py-2 text-[12px] font-mono tracking-widest uppercase rounded-sm border transition-all duration-300 ${selectedCategory === cat.slug
                                            ? 'bg-foreground border-foreground text-background'
                                            : 'bg-transparent border-border text-foreground-muted hover:border-foreground-muted hover:text-foreground'
                                            }`}
                                        aria-pressed={selectedCategory === cat.slug}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        {/* Marcas (solo desktop en sidebar izquierda) */}
                        {brands.length > 0 && (
                            <fieldset>
                                <legend className="text-[11px] font-mono font-bold text-foreground-muted mb-4 uppercase tracking-[0.2em] flex items-center gap-2 mt-8">
                                    <span className="w-[4px] h-[4px] bg-foreground rounded-full" />
                                    Marcas
                                </legend>
                                <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar por marca">
                                    {brands.map((brand) => (
                                        <button
                                            key={brand.id}
                                            onClick={() => {
                                                const set = new Set(selectedBrands)
                                                if (set.has(brand.slug)) {
                                                    set.delete(brand.slug)
                                                } else {
                                                    set.add(brand.slug)
                                                }
                                                const value = Array.from(set).join(',')
                                                updateFilter('marca', value)
                                            }}
                                            className={`px-4 py-2 text-[11px] font-mono tracking-widest uppercase rounded-full border transition-all duration-300 ${
                                                selectedBrands.includes(brand.slug)
                                                    ? 'bg-foreground border-foreground text-background'
                                                    : 'bg-transparent border-border text-foreground-muted hover:border-foreground-muted hover:text-foreground'
                                            }`}
                                            aria-pressed={selectedBrands.includes(brand.slug)}
                                        >
                                            {brand.name}
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                        )}

                        {/* Tallas (sidebar desktop, estilo píldoras; Ver más si hay muchas) */}
                        <fieldset>
                            <legend className="text-[11px] font-mono font-bold text-foreground-muted mb-4 uppercase tracking-[0.2em] flex items-center gap-2 mt-8">
                                <span className="w-[4px] h-[4px] bg-foreground rounded-full" />
                                Talla
                            </legend>
                            <div
                                className="flex flex-wrap gap-2"
                                role="group"
                                aria-label="Filtrar por talla"
                                data-testid="size-selector"
                            >
                                {(sizesExpanded ? SIZES : SIZES.slice(0, SIZES_INITIAL_COUNT)).map((size) => (
                                    <button
                                        key={size}
                                        onClick={() =>
                                            updateFilter('talla', selectedSize === size ? '' : size)
                                        }
                                        className={`px-4 h-[36px] flex items-center justify-center text-[12px] font-mono font-bold rounded-full border transition-all duration-300 ${
                                            selectedSize === size
                                                ? 'bg-foreground text-background border-foreground shadow-none'
                                                : 'bg-background border-border text-foreground-muted hover:border-foreground hover:text-foreground hover:bg-surface-hover'
                                        }`}
                                        aria-pressed={selectedSize === size}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {SIZES.length > SIZES_INITIAL_COUNT && (
                                <button
                                    type="button"
                                    onClick={() => setSizesExpanded((v) => !v)}
                                    className="mt-2 text-[11px] font-mono text-foreground-muted hover:text-foreground uppercase tracking-wider flex items-center gap-1"
                                >
                                    {sizesExpanded ? 'Ver menos' : 'Ver más'}
                                </button>
                            )}
                        </fieldset>

                        {/* Limpiar filtros */}
                        {hasFilters && (
                            <button
                                onClick={clearFilters}
                                className="w-full mt-8 py-3 flex items-center justify-center gap-2 text-[11px] font-mono tracking-widest text-error border border-error/20 hover:bg-error/10 transition-colors uppercase"
                            >
                                <X className="w-3.5 h-3.5" aria-hidden="true" />
                                Limpiar Filtros
                            </button>
                        )}
                    </aside>

                    {/* Grid de productos */}
                    <div className="flex-1 bg-background">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-border/20">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="aspect-[3/4] w-full relative overflow-hidden bg-background">
                                        <style jsx>{`
                                            @keyframes shimmer {
                                                0% { background-position: 200% 0; }
                                                100% { background-position: -200% 0; }
                                            }
                                        `}</style>
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: 'linear-gradient(90deg, var(--color-background) 0%, var(--color-surface) 50%, var(--color-background) 100%)',
                                                backgroundSize: '200% 100%',
                                                animation: 'shimmer 1.8s infinite'
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div className="text-center py-16 bg-error/5 border border-error/20 rounded-xl p-8 m-8">
                                <p className="text-error font-bold text-lg mb-2">Error de conexión</p>
                                <p className="text-foreground-muted mb-6">{error}</p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-foreground text-background font-bold px-6 py-3 rounded-none hover:bg-black transition-colors"
                                >
                                    Volver al catálogo principal
                                </button>
                            </div>
                        ) : products.length === 0 ? (
                            <div className="text-center py-16 m-8">
                                <h3 className="text-xl font-bold font-heading mb-2 text-foreground">Próximamente nuevos productos</h3>
                                <p className="text-foreground-muted mb-6">
                                    No hemos encontrado resultados para estos filtros, pero estamos preparando nuevos lanzamientos.
                                </p>
                                <button
                                    onClick={clearFilters}
                                    className="bg-foreground text-background font-bold px-6 py-3 rounded-none hover:bg-black transition-colors border border-foreground"
                                >
                                    Ver todo disponible
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="p-4 bg-background flex items-center justify-between border-b border-border">
                                    <p className="text-[11px] font-mono tracking-widest text-foreground-muted uppercase">
                                        {products.length} producto{products.length !== 1 ? 's' : ''} en vista
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-border/20">
                                    {products.map((product, index) => (
                                        <ProductCard key={product.id} product={product} index={index} />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function CatalogoPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen">
                    <div className="bg-background py-12 px-4 border-b border-border relative overflow-hidden">
                        <div className="max-w-7xl mx-auto">
                            <div className="skeleton h-10 w-48 bg-surface" />
                            <div className="skeleton h-5 w-64 mt-2 bg-surface" />
                        </div>
                    </div>
                    <div className="w-full flex-1 bg-background">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[1px] bg-border/20">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="aspect-[3/4] w-full relative overflow-hidden bg-background" />
                            ))}
                        </div>
                    </div>
                </div>
            }
        >
            <CatalogoContent />
        </Suspense>
    )
}
