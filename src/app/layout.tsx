import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, Bebas_Neue } from 'next/font/google'
import './globals.css'
import { LoadingProvider } from '@/components/providers/LoadingProvider'
import { GlobalLoader } from '@/components/layout/GlobalLoader'
import CursorWrapper from '@/components/effects/CursorWrapper'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
  weight: ['400', '500', '600', '700'],
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas-neue',
  weight: '400',
})

export const metadata: Metadata = {
  title: {
    default: 'La Guaca | Streetwear — Montería, Colombia',
    template: '%s | La Guaca',
  },
  description:
    'Tienda de ropa streetwear en Montería, Colombia. Estilo único, calidad premium. Envíos a toda Colombia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://laguaca.co'),
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    siteName: 'La Guaca',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Nunca deshabilitar pinch-to-zoom (accesibilidad)
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-CO"
      className={`${inter.variable} ${spaceGrotesk.variable} ${bebasNeue.variable}`}
    >
      <body className="bg-background text-foreground antialiased relative">
        <CursorWrapper />
        <LoadingProvider>
          <GlobalLoader />
          <div style={{ position: 'relative', zIndex: 1 }}>
            {children}
          </div>
        </LoadingProvider>
      </body>
    </html>
  )
}
