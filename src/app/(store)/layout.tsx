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
    try {
        const supabase = await createClient()
        const { data: config } = await supabase
            .from('store_config')
            .select('*')
            .eq('id', 1)
            .single()
        configData = config as Record<string, unknown> | null
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
            <CartDrawer />
            <CartReminderBar />
            {configData?.owner_whatsapp && (
                <WhatsAppFloat phone={String(configData.owner_whatsapp)} />
            )}
            <ToastContainer />
        </>
    )
}
