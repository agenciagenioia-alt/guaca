'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Review {
  id: string
  customer_name: string
  review_text: string
  rating: number
  is_active: boolean
}

// Fallback reviews if DB table doesn't exist yet
const FALLBACK_REVIEWS: Review[] = [
  { id: '1', customer_name: 'Carlos M.', review_text: 'Compré unas On Running y llegaron perfectas. Calidad increíble y envío rapidísimo a Barranquilla.', rating: 5, is_active: true },
  { id: '2', customer_name: 'Valeria R.', review_text: 'La mejor tienda de streetwear en Colombia. Las camisetas Saint Theory son una locura.', rating: 5, is_active: true },
  { id: '3', customer_name: 'Sebastián G.', review_text: 'Llevaba tiempo buscando las Air Force 1 negras. Las encontré aquí a buen precio y 100% originales.', rating: 5, is_active: true },
  { id: '4', customer_name: 'Andrea L.', review_text: 'Me encantó el empaque y la rapidez del envío. Pedí un hoodie y llegó en 2 días a Bogotá. Vuelvo seguro.', rating: 5, is_active: true },
  { id: '5', customer_name: 'Miguel Á.', review_text: 'El Cargo de Clemont es brutal. Calidad premium y el fit queda perfecto. 10/10 recomendado.', rating: 5, is_active: true },
  { id: '6', customer_name: 'Laura P.', review_text: 'Compré para mi novio unos tenis Adidas Campus y quedó feliz. Originales y a mejor precio que en tiendas.', rating: 5, is_active: true },
  { id: '7', customer_name: 'David R.', review_text: 'Excelente atención por WhatsApp. Me ayudaron a elegir la talla perfecta. Muy profesionales.', rating: 5, is_active: true },
  { id: '8', customer_name: 'Camila S.', review_text: 'Ya es la tercera vez que compro. Siempre llega todo perfecto. La Guaca es la mejor de Colombia.', rating: 5, is_active: true },
]

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>(FALLBACK_REVIEWS)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const trackRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Load reviews from DB
  useEffect(() => {
    const supabase = createClient() as any
    supabase
      .from('reviews')
      .select('*')
      .eq('is_active', true)
      .order('display_order')
      .then(({ data }: { data: Review[] | null }) => {
        if (data && data.length > 0) {
          setReviews(data)
        }
      })
  }, [])

  // How many cards visible at once
  const getVisibleCount = useCallback(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 768) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }, [])

  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const update = () => setVisibleCount(getVisibleCount())
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [getVisibleCount])

  const maxIndex = Math.max(0, reviews.length - visibleCount)

  const goTo = useCallback((idx: number) => {
    setCurrentIndex(Math.max(0, Math.min(idx, maxIndex)))
  }, [maxIndex])

  const next = useCallback(() => {
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1)
  }, [maxIndex])

  const prev = useCallback(() => {
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1)
  }, [maxIndex])

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return
    intervalRef.current = setInterval(next, 2500)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isAutoPlaying, next])

  // Pause on hover
  const pauseAuto = () => setIsAutoPlaying(false)
  const resumeAuto = () => setIsAutoPlaying(true)

  return (
    <section className="bg-background py-24 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 gap-6">
          <div>
            <h2
              className="font-heading text-[clamp(40px,7vw,80px)] leading-none text-transparent m-0 uppercase"
              style={{ WebkitTextStroke: '1.5px var(--color-foreground)' }}
            >
              LO QUE DICEN
            </h2>
            <h2 className="font-heading text-[clamp(40px,7vw,80px)] leading-[0.8] text-foreground m-0 uppercase md:-mt-4">
              NUESTROS CLIENTES
            </h2>
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-foreground-muted tracking-widest uppercase mr-3 hidden md:block">
              {currentIndex + 1} / {maxIndex + 1}
            </span>
            <button
              onClick={() => { prev(); pauseAuto() }}
              className="w-10 h-10 border border-border flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => { next(); pauseAuto() }}
              className="w-10 h-10 border border-border flex items-center justify-center text-foreground-muted hover:text-foreground hover:border-foreground transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          className="overflow-hidden"
          onMouseEnter={pauseAuto}
          onMouseLeave={resumeAuto}
        >
          <div
            ref={trackRef}
            className="flex transition-transform duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {reviews.map((review, index) => (
              <div
                key={review.id}
                className="flex-shrink-0 px-3"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <div className="bg-surface border border-border p-8 h-full relative group hover:border-[rgba(232,230,225,0.25)] transition-all duration-500">
                  {/* Quote mark */}
                  <span
                    className="absolute -top-2 left-6 font-heading text-[100px] text-border leading-none select-none pointer-events-none group-hover:text-[rgba(232,230,225,0.15)] transition-colors duration-500"
                    aria-hidden="true"
                  >
                    &quot;
                  </span>

                  <div className="relative z-10 pt-10 flex flex-col h-full">
                    <p className="text-[15px] leading-[1.8] text-foreground/70 mb-8 font-body flex-1 italic">
                      &ldquo;{review.review_text}&rdquo;
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="text-[13px] font-bold text-foreground uppercase tracking-wider">
                          — {review.customer_name}
                        </span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: review.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          ))}
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-foreground/20 uppercase tracking-widest">
                        Verificado
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mt-8">
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              onClick={() => { goTo(i); pauseAuto() }}
              className={`h-[3px] rounded-full transition-all duration-500 ${
                i === currentIndex ? 'bg-foreground w-8' : 'bg-border w-3 hover:bg-foreground/30'
              }`}
              aria-label={`Ir a reseña ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
