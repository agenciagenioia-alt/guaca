import { createClient } from '@/lib/supabase/server'
import { unstable_noStore } from 'next/cache'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { AnnouncementMarquee } from '@/components/home/AnnouncementMarquee'
import { CartDrawer } from '@/components/cart/CartDrawer'
import { CartReminderBar } from '@/components/cart/CartReminderBar'
import { WhatsAppFloat } from '@/components/ui/WhatsAppFloat'
import { ToastContainer } from '@/components/ui/ToastContainer'

export default async function StoreLayout({
    children,
}: {
    children: React.ReactNode
}) {
    unstable_noStore()
    let configData: Record<string, unknown> | null = null
    let outfitProducts: { id: string; name: string; slug: string; price: number; imageUrl: string; defaultSize: string }[] = []
    try {
        const supabase = await createClient()
        const { data: config } = await supabase
            .from('store_config')
            .select('*')
            .eq('id', 1)
            .single()
        configData = config as Record<string, unknown> | null

        const outfitEnabled = (configData?.outfit_section_enabled as boolean) === true
        const outfitIdsRaw = configData?.outfit_product_ids as string | null | undefined
        let outfitIds: string[] = []
        if (outfitEnabled && outfitIdsRaw) {
            try {
                const parsed = JSON.parse(outfitIdsRaw)
                outfitIds = Array.isArray(parsed) ? parsed.filter((id: unknown) => typeof id === 'string') : []
            } catch {
                outfitIds = []
            }
        }
        if (outfitIds.length > 0) {
            const { data: products } = await supabase
                .from('products')
                .select('id, name, slug, price, images:product_images(image_url, is_primary), variants:product_variants(size, display_order)')
                .in('id', outfitIds)
                .eq('is_active', true)
            const list = (products || []) as Array<{
                id: string
                name: string
                slug: string
                price: number
                images?: Array<{ image_url: string; is_primary?: boolean }>
                variants?: Array<{ size: string; display_order?: number }>
            }>
            outfitProducts = list.map((p) => {
                const imgs = p.images || []
                const primary = imgs.find((i) => i.is_primary) || imgs[0]
                const imageUrl = primary?.image_url || ''
                const vars = (p.variants || []).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                const defaultSize = vars[0]?.size || 'ÚNICO'
                return {
                    id: p.id,
                    name: p.name,
                    slug: p.slug,
                    price: p.price,
                    imageUrl,
                    defaultSize,
                }
            })
        }
    } catch (e) {
        console.error('[StoreLayout] Error loading config:', e)
    }

    return (
        <>
            <AnnouncementMarquee />
            <Header />
            <main id="main-content">{children}</main>
            <Footer
                instagramUrl={configData?.instagram_url as string | null | undefined}
                tiktokUrl={configData?.tiktok_url as string | null | undefined}
                whatsappUrl={configData?.whatsapp_url as string | null | undefined}
            />
            <CartDrawer outfitEnabled={outfitProducts.length > 0 && (configData?.outfit_section_enabled as boolean) === true} outfitProducts={outfitProducts} />
            <CartReminderBar />
            {configData?.owner_whatsapp && (
                <WhatsAppFloat phone={String(configData.owner_whatsapp)} />
            )}
            <ToastContainer />
        </>
    )
}
