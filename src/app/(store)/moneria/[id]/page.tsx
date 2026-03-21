import { createClient } from '@/lib/supabase/server'
import { unstable_noStore } from 'next/cache'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import type { MoneriaProduct } from '@/lib/moneria'
import { MoneriaProductActions } from './MoneriaProductActions'
import { MoneriaGallery } from './MoneriaGallery'
import { formatCOP } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'

const BG = '#0D0D0D'
const TEXT_MAIN = '#E8E6E1'
const TEXT_SEC = '#6B6B68'
const ACCENT = '#A69256'
const MONO = '"JetBrains Mono", "Fira Code", "Courier New", monospace'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await (supabase as any).from('moneria_products').select('*').eq('id', id).eq('is_active', true).single()
  if (!data) return { title: 'Producto no encontrado' }
  const p = data as MoneriaProduct
  return {
    title: `${p.name} — Monería Studio | La Guaca`,
    description: p.description || `${p.name}. Diseño colombiano de autor. Monería Studio.`,
    openGraph: {
      title: `${p.name} | Monería Studio`,
      images: [{ url: p.image_url }],
    },
  }
}

export default async function MoneriaProductoPage({ params }: Props) {
  unstable_noStore()
  const { id } = await params
  const supabase = await createClient()

  const { data } = await (supabase as any)
    .from('moneria_products')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()

  if (!data) notFound()

  const product = data as MoneriaProduct

  // Construir galería: imagen principal + hover + adicionales
  const gallery: string[] = [product.image_url]
  if (product.second_image_url) gallery.push(product.second_image_url)
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      if (img && !gallery.includes(img)) gallery.push(img)
    }
  }

  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : (Array.isArray(product.sizes) ? product.sizes.map((s) => ({ size: s, stock: 1 })) : [])

  const totalStock = variants.reduce((s, v) => s + v.stock, 0)

  return (
    <div style={{ background: BG, minHeight: '100vh' }}>
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-2">
        <Link
          href="/"
          className="inline-flex items-center gap-2"
          style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: TEXT_SEC, textDecoration: 'none' }}
        >
          <ArrowLeft className="w-3 h-3" />
          Monería Studio
        </Link>
      </div>

      {/* Layout principal */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">

          {/* Galería con flechas, swipe y thumbnails */}
          <MoneriaGallery images={gallery} productName={product.name} />

          {/* Info del producto */}
          <div className="flex flex-col gap-4 py-4">
            {/* Drop badge */}
            <div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: ACCENT,
                  border: `1px solid ${ACCENT}`,
                  padding: '3px 8px',
                  display: 'inline-block',
                  borderRadius: 0,
                }}
              >
                DROP 001
              </span>
            </div>

            {/* Nombre */}
            <h1
              style={{
                fontFamily: 'var(--font-bebas-neue, "Bebas Neue", system-ui, sans-serif)',
                fontSize: 'clamp(36px, 6vw, 64px)',
                lineHeight: 0.95,
                color: TEXT_MAIN,
                margin: 0,
                letterSpacing: '0.02em',
              }}
            >
              {product.name}
            </h1>

            {/* Precio */}
            <p
              style={{
                fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
                fontSize: 24,
                fontWeight: 600,
                color: ACCENT,
                margin: 0,
              }}
            >
              {formatCOP(product.price)}
            </p>

            {/* Descripción */}
            {product.description && (
              <p
                style={{
                  fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: TEXT_SEC,
                  margin: 0,
                }}
              >
                {product.description}
              </p>
            )}

            {/* Separador */}
            <div style={{ height: 1, background: 'rgba(232,230,225,0.08)' }} />

            {/* Stock info */}
            {totalStock > 0 && totalStock <= 5 && (
              <p style={{ fontFamily: MONO, fontSize: 11, color: ACCENT, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                🔥 Quedan solo {totalStock} unidades
              </p>
            )}

            {/* Selector tallas + carrito */}
            <MoneriaProductActions
              product={{ id: product.id, name: product.name, price: product.price }}
              variants={variants}
              imageUrl={product.image_url}
            />

            {/* Footer */}
            <div style={{ borderTop: '1px solid rgba(232,230,225,0.08)', paddingTop: 16, marginTop: 8 }}>
              <p
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#3A3A38',
                  textAlign: 'center',
                }}
              >
                MONERÍA STUDIO · DESIGN COUTURE · HECHO EN COLOMBIA
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
