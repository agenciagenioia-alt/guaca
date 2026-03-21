'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { MoneriaProduct } from '@/lib/moneria'
import { formatCOP } from '@/lib/utils'

interface MoneriaProductCardProps {
  product: MoneriaProduct
  index?: number
}

const MONO = '"JetBrains Mono", "Fira Code", "Courier New", monospace'
const TEXT_MAIN = '#E8E6E1'
const TEXT_SEC = '#6B6B68'
const ACCENT = '#A69256'
const CARD_BG = '#1A1A18'

export function MoneriaProductCard({ product, index = 0 }: MoneriaProductCardProps) {
  const [hovered, setHovered] = useState(false)

  const hasSecond = Boolean(product.second_image_url)

  // Usar variants si existen, sino sizes legacy
  const variants = Array.isArray(product.variants) && product.variants.length > 0
    ? product.variants
    : (Array.isArray(product.sizes) ? product.sizes.map((s) => ({ size: s, stock: 1 })) : [])

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.08 }}
      style={{ background: CARD_BG, borderRadius: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Imagen */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: '3/4', borderRadius: 0 }}
      >
        {/* Imagen principal */}
        <Image
          src={product.image_url}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 ease-out"
          style={{
            transform: hovered && !hasSecond ? 'scale(1.03)' : 'scale(1)',
            opacity: hovered && hasSecond ? 0 : 1,
            transition: 'opacity 400ms ease, transform 400ms ease',
          }}
          unoptimized={product.image_url.includes('supabase.co')}
        />

        {/* Imagen hover */}
        {hasSecond && product.second_image_url && (
          <Image
            src={product.second_image_url}
            alt={`${product.name} – vista 2`}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover absolute inset-0"
            style={{
              opacity: hovered ? 1 : 0,
              transition: 'opacity 400ms ease',
            }}
            unoptimized={product.second_image_url.includes('supabase.co')}
          />
        )}

        {/* Badge MONERÍA */}
        <div
          className="absolute top-0 left-0 z-10"
          style={{
            background: ACCENT,
            color: '#0D0D0D',
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 8px',
            borderRadius: 0,
          }}
        >
          MONERÍA
        </div>

        {/* Botón VER DETALLES en hover — Link real */}
        <motion.div
          initial={false}
          animate={{ y: hovered ? 0 : '100%', opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.28, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 z-10"
          style={{ borderRadius: 0 }}
        >
          <Link
            href={`/moneria/${product.id}`}
            className="w-full flex items-center justify-center"
            style={{
              height: 44,
              background: TEXT_MAIN,
              color: '#111110',
              fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              borderRadius: 0,
              textDecoration: 'none',
            }}
          >
            VER DETALLES
          </Link>
        </motion.div>
      </div>

      {/* Info */}
      <div style={{ padding: 16 }}>
        <p
          style={{
            fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
            fontSize: 14,
            fontWeight: 500,
            color: TEXT_MAIN,
            marginBottom: 4,
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
            fontSize: 13,
            color: ACCENT,
            marginBottom: variants.length > 0 ? 10 : 0,
          }}
        >
          {formatCOP(product.price)}
        </p>

        {/* Tallas */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {variants.map(({ size, stock }) => (
              <span
                key={size}
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  border: `1px solid ${stock > 0 ? TEXT_MAIN : 'rgba(232,230,225,0.25)'}`,
                  color: stock > 0 ? TEXT_MAIN : 'rgba(232,230,225,0.3)',
                  padding: '2px 6px',
                  borderRadius: 0,
                  letterSpacing: '0.05em',
                  textDecoration: stock <= 0 ? 'line-through' : 'none',
                }}
              >
                {size}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.article>
  )
}
