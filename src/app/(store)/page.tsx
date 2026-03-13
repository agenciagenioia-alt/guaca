import { Hero } from '@/components/home/Hero'
import { BrandsMarquee } from '@/components/home/BrandsMarquee'
import { EditorialGrid } from '@/components/home/EditorialGrid'
import { CategoryShowcase } from '@/components/home/CategoryShowcase'
import { StickyScroll } from '@/components/home/StickyScroll'
import { UGCMasonry } from '@/components/home/UGCMasonry'
import { LiveCounter } from '@/components/home/LiveCounter'

import { StoreBanner } from '@/components/home/StoreBanner'
import { TapeStrip } from '@/components/home/TapeStrip'
import { Testimonials } from '@/components/home/Testimonials'
import { FinalCTA } from '@/components/home/FinalCTA'
import { createClient } from '@/lib/supabase/server'
import { unstable_noStore } from 'next/cache'
import { ProductCard } from '@/components/product/ProductCard'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Sparkles, Truck, Shield } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'La Guaca | Streetwear — Montería, Colombia',
    description:
        'Tienda de ropa streetwear en Montería, Colombia. Estilo único, calidad premium. Envíos a toda Colombia.',
}

export const dynamic = 'force-dynamic'

export default async function HomePage() {
    unstable_noStore() // Evita caché: cada visita obtiene datos frescos (categorías, config, productos)
    const supabase = await createClient()

    // Productos destacados
    const { data: featuredData } = await supabase
        .from('products')
        .select('*, images:product_images(*), variants:product_variants(*)')
        .eq('is_featured', true)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(8)
    const featured: any[] = featuredData || []

    // Categorías activas
    const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
    const categories: any[] = categoriesData || []

    // Config
    const { data: config } = await supabase
        .from('store_config')
        .select('*')
        .eq('id', 1)
        .single()

    return (
        <>
            <Hero
                heroImageUrl={(config as any)?.hero_image_url}
                heroVideoUrl={(config as any)?.hero_video_url}
            />
            <LiveCounter />
            <BrandsMarquee />

            {/* ═══ NUEVOS DROPS ═══ */}
            {featured && featured.length > 0 && (
                <EditorialGrid products={featured} />
            )}

            {/* ═══ CATEGORÍAS ═══ */}
            {categories && categories.length > 0 && (
                <CategoryShowcase categories={categories} />
            )}

            {/* ═══ POR QUÉ LA GUACA (STICKY EFFECT) ═══ */}
            <StickyScroll videoUrl={(config as any)?.sticky_video_url} />

            {/* ═══ BANNER TIENDA FÍSICA (FULLWIDTH EDITORIAL) — wrapper full-bleed para que no se recorte a la derecha ═══ */}
            <div
              className="w-[100vw] max-w-none overflow-x-hidden"
              style={{
                marginLeft: 'calc(50% - 50vw)',
                marginRight: 'calc(50% - 50vw)',
              }}
            >
                <StoreBanner videoUrl={(config as any)?.store_banner_video_url} />
            </div>

            <TapeStrip />

            {/* ═══ LA COMUNIDAD (UGC MASONRY) ═══ */}
            <UGCMasonry />

            <Testimonials />
            <FinalCTA />
        </>
    )
}
