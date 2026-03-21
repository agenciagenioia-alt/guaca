'use client'

import { motion } from 'framer-motion'
import type { MoneriaProduct, MoneriaSectionConfig } from '@/lib/moneria'
import { MoneriaMarquee } from '@/components/moneria/MoneriaMarquee'
import { MoneriaProductCard } from '@/components/moneria/MoneriaProductCard'

interface MoneriaDropSectionProps {
  products: MoneriaProduct[]
  config: MoneriaSectionConfig
}

const MONO = '"JetBrains Mono", "Fira Code", "Courier New", monospace'
const BG = '#0D0D0D'
const TEXT_MAIN = '#E8E6E1'
const TEXT_SEC = '#6B6B68'
const ACCENT = '#A69256'

export function MoneriaDropSection({ products, config }: MoneriaDropSectionProps) {
  if (!config.is_visible) return null
  if (products.length === 0) return null

  return (
    <section style={{ background: BG, borderRadius: 0 }} aria-label="Monería Studio Drop">
      {/* Marquee strip */}
      <MoneriaMarquee dropLabel={config.drop_label} />

      {/* Inner container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12 md:py-16"
        >
          {/* Columna izquierda */}
          <div className="flex flex-col justify-center gap-4">
            {/* Badge DROP */}
            <div>
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: ACCENT,
                  border: `1px solid ${ACCENT}`,
                  padding: '4px 10px',
                  borderRadius: 0,
                  display: 'inline-block',
                }}
              >
                {config.drop_label}
              </span>
            </div>

            {/* Título grande */}
            <motion.h2
              initial={{ clipPath: 'inset(0 100% 0 0)' }}
              whileInView={{ clipPath: 'inset(0 0% 0 0)' }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              style={{
                fontFamily: 'var(--font-bebas-neue, "Bebas Neue", system-ui, sans-serif)',
                fontSize: 'clamp(80px, 12vw, 160px)',
                lineHeight: 0.9,
                color: TEXT_MAIN,
                letterSpacing: '0.02em',
                margin: 0,
              }}
            >
              {config.section_title}
            </motion.h2>

            {/* Subtítulo */}
            <p
              style={{
                fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
                fontSize: 12,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: TEXT_SEC,
                margin: 0,
              }}
            >
              {config.section_subtitle}
            </p>
          </div>

          {/* Columna derecha — descripción */}
          {config.section_description && (
            <div
              className="hidden md:flex items-center"
              style={{
                borderLeft: `1px solid rgba(166,146,86,0.3)`,
                paddingLeft: 32,
              }}
            >
              <p
                style={{
                  fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: TEXT_SEC,
                  margin: 0,
                }}
              >
                {config.section_description}
              </p>
            </div>
          )}
        </motion.div>

        {/* Grid de productos — gap 1px (el fondo oscuro de la sección crea las líneas) */}
        <div
          className="grid grid-cols-2 md:grid-cols-4"
          style={{ gap: 1, background: BG }}
        >
          {products.map((product, idx) => (
            <MoneriaProductCard key={product.id} product={product} index={idx} />
          ))}
        </div>

        {/* Footer de sección */}
        <div
          className="flex items-center justify-center py-8"
          style={{ borderTop: '1px solid rgba(232,230,225,0.08)' }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: '#3A3A38',
            }}
          >
            MONERÍA STUDIO · DESIGN COUTURE · MONTERÍA, COLOMBIA
          </span>
        </div>
      </div>
    </section>
  )
}
