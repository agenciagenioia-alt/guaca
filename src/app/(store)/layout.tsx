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
    unstable_noStore() // Config (redes, WhatsApp, etc.) siempre fresco al cambiar en admin
    const supabase = await createClient()
    const { data: config } = await supabase
        .from('store_config')
        .select('*')
        .eq('id', 1)
        .single()
        
    const configData = config as any

    return (
        <>
            <AnnouncementMarquee />
            <Header />
            <main id="main-content">{children}</main>
            <Footer
                instagramUrl={configData?.instagram_url}
                tiktokUrl={configData?.tiktok_url}
                whatsappUrl={configData?.whatsapp_url}
            />
            <CartDrawer />
            <CartReminderBar />
            {configData?.owner_whatsapp && (
                <WhatsAppFloat phone={configData.owner_whatsapp} />
            )}
            <ToastContainer />
        </>
    )
}
