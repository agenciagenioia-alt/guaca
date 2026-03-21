'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface MoneriaGalleryProps {
  images: string[]
  productName: string
}

const ACCENT = '#A69256'
const BG_DARK = '#0D0D0D'
const CARD_BG = '#1A1A18'
const MONO = '"JetBrains Mono","Fira Code","Courier New",monospace'

export function MoneriaGallery({ images, productName }: MoneriaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const total = images.length

  const prev = () => {
    const next = activeIndex === 0 ? total - 1 : activeIndex - 1
    setActiveIndex(next)
    scrollRef.current?.scrollTo({ left: next * (scrollRef.current.clientWidth ?? 0), behavior: 'smooth' })
  }

  const next = () => {
    const nxt = activeIndex === total - 1 ? 0 : activeIndex + 1
    setActiveIndex(nxt)
    scrollRef.current?.scrollTo({ left: nxt * (scrollRef.current.clientWidth ?? 0), behavior: 'smooth' })
  }

  const handleScroll = () => {
    if (!scrollRef.current) return
    const newIndex = Math.round(scrollRef.current.scrollLeft / scrollRef.current.clientWidth)
    if (newIndex !== activeIndex) setActiveIndex(newIndex)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      if (e.key === 'Escape') setIsLightboxOpen(false)
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isLightboxOpen, activeIndex])

  if (total === 0) return null

  return (
    <div className="flex flex-col gap-4 w-full select-none">

      {/* ── MOBILE: swipe horizontal + flechas + dots ── */}
      <div className="md:hidden relative w-full">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory w-full"
          style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
        >
          {images.map((url, i) => (
            <div
              key={i}
              className="w-full shrink-0 snap-center relative"
              style={{ aspectRatio: '3/4', background: CARD_BG }}
            >
              <Image
                src={url}
                alt={`${productName} — vista ${i + 1}`}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
                unoptimized={url.includes('supabase.co')}
              />
            </div>
          ))}
        </div>

        {/* Flechas móvil */}
        {total > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center"
              style={{ background: 'rgba(13,13,13,0.75)', border: '1px solid rgba(232,230,225,0.15)', borderRadius: 0 }}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#E8E6E1' }} />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center"
              style={{ background: 'rgba(13,13,13,0.75)', border: '1px solid rgba(232,230,225,0.15)', borderRadius: 0 }}
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="w-5 h-5" style={{ color: '#E8E6E1' }} />
            </button>
          </>
        )}

        {/* Dots */}
        {total > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setActiveIndex(i)
                  scrollRef.current?.scrollTo({ left: i * (scrollRef.current.clientWidth ?? 0), behavior: 'smooth' })
                }}
                className="transition-all duration-300"
                style={{
                  height: 6,
                  width: i === activeIndex ? 20 : 6,
                  background: i === activeIndex ? ACCENT : 'rgba(232,230,225,0.3)',
                  borderRadius: 0,
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              />
            ))}
          </div>
        )}

        {/* Badge */}
        <div
          className="absolute top-0 left-0 z-10"
          style={{
            background: ACCENT,
            color: BG_DARK,
            fontFamily: MONO,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            padding: '4px 10px',
          }}
        >
          MONERÍA STUDIO
        </div>
      </div>

      {/* ── DESKTOP: crossfade + flechas + thumbnails ── */}
      <div className="hidden md:flex flex-col gap-3">
        {/* Imagen principal */}
        <div
          className="relative w-full overflow-hidden group cursor-zoom-in"
          style={{ aspectRatio: '3/4', background: CARD_BG }}
          onClick={() => setIsLightboxOpen(true)}
        >
          {images.map((url, i) => (
            <Image
              key={i}
              src={url}
              alt={`${productName} — vista ${i + 1}`}
              fill
              className={`object-cover transition-opacity duration-300 ${i === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'} absolute inset-0`}
              sizes="50vw"
              priority={i === 0}
              unoptimized={url.includes('supabase.co')}
            />
          ))}

          {/* Badge */}
          <div
            className="absolute top-0 left-0 z-20"
            style={{
              background: ACCENT,
              color: BG_DARK,
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '5px 12px',
            }}
          >
            MONERÍA STUDIO
          </div>

          {/* Flechas desktop */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(13,13,13,0.85)', border: '1px solid rgba(232,230,225,0.2)', borderRadius: 0 }}
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5" style={{ color: '#E8E6E1' }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(13,13,13,0.85)', border: '1px solid rgba(232,230,225,0.2)', borderRadius: 0 }}
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5" style={{ color: '#E8E6E1' }} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {total > 1 && (
          <div className="flex gap-2">
            {images.map((url, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className="relative flex-shrink-0 overflow-hidden transition-all duration-200"
                style={{
                  width: 72,
                  height: 88,
                  background: CARD_BG,
                  borderRadius: 0,
                  border: i === activeIndex
                    ? `2px solid ${ACCENT}`
                    : '2px solid transparent',
                  opacity: i === activeIndex ? 1 : 0.55,
                  padding: 0,
                  cursor: 'pointer',
                }}
                aria-label={`Ver imagen ${i + 1}`}
              >
                <Image
                  src={url}
                  alt={`thumb ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="72px"
                  unoptimized={url.includes('supabase.co')}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── LIGHTBOX (desktop) ── */}
      {isLightboxOpen && (
        <div
          className="hidden md:flex fixed inset-0 z-[200] items-center justify-center p-8"
          style={{ background: 'rgba(13,13,13,0.97)', backdropFilter: 'blur(12px)' }}
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false) }}
            className="absolute top-6 right-6 z-50 w-10 h-10 flex items-center justify-center"
            style={{ background: 'rgba(232,230,225,0.1)', border: '1px solid rgba(232,230,225,0.2)', borderRadius: 0 }}
          >
            <X className="w-5 h-5" style={{ color: '#E8E6E1' }} />
          </button>

          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev() }}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center"
                style={{ background: 'rgba(232,230,225,0.08)', border: '1px solid rgba(232,230,225,0.15)', borderRadius: 0 }}
              >
                <ChevronLeft className="w-6 h-6" style={{ color: '#E8E6E1' }} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next() }}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-50 w-12 h-12 flex items-center justify-center"
                style={{ background: 'rgba(232,230,225,0.08)', border: '1px solid rgba(232,230,225,0.15)', borderRadius: 0 }}
              >
                <ChevronRight className="w-6 h-6" style={{ color: '#E8E6E1' }} />
              </button>
            </>
          )}

          <div
            className="relative w-full h-full max-w-2xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeIndex]}
              alt={productName}
              fill
              className="object-contain"
              sizes="100vw"
              quality={95}
              priority
              unoptimized={images[activeIndex].includes('supabase.co')}
            />
          </div>

          <p
            className="absolute bottom-6 left-0 right-0 text-center"
            style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.15em', color: 'rgba(232,230,225,0.4)' }}
          >
            {activeIndex + 1} / {total}
          </p>
        </div>
      )}

      <style jsx global>{`
        .md\\:hidden div[style*="overflow-x: auto"]::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  )
}
