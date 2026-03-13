'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  image_url: string | null
}

interface CategoryShowcaseProps {
  categories: Category[]
}

/** Usa la imagen de la categoría si existe; solo fallback cuando no hay URL en admin. */
const getCategoryImage = (slug: string, imageUrl: string | null | undefined): string => {
  if (imageUrl && imageUrl.trim()) return imageUrl.trim()
  const s = slug.toLowerCase()
  if (s === 'camisetas' || s === 'ropa') return 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80'
  if (s === 'pantalones' || s === 'jeans') return 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=1200&q=80'
  if (s === 'hoodies' || s === 'buzos') return 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=1200&q=80'
  if (s === 'accesorios' || s === 'gorras') return 'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=1200&q=80'
  if (s === 'calzado' || s === 'sneakers') return 'https://images.unsplash.com/photo-1552346154-21d32810baa3?w=1200&q=80'
  return 'https://images.unsplash.com/photo-1608228079968-c7681eaef814?w=1200&q=80'
}

export function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  if (!categories || categories.length === 0) return null

  return (
    <section className="py-24 md:py-32 bg-[#111110] relative overflow-hidden border-t border-[#E8E6E1]/5">
      <div className="max-w-[1400px] mx-auto px-6">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-sm font-mono tracking-[0.4em] text-[#6B6B68] uppercase mb-4">
              Nuestra Colección
            </h2>
            <h3 className="text-4xl md:text-6xl font-heading font-bold text-[#E8E6E1] uppercase tracking-tight">
              Categorías
            </h3>
          </div>
          <p className="font-mono text-xs text-[#6B6B68] tracking-[0.2em] max-w-sm uppercase leading-relaxed text-left md:text-right">
            Curaduría de piezas esenciales. Selecciona tu estilo y descubre el inventario premium.
          </p>
        </div>

        {/* Desktop: Hover Accordion | Mobile: Vertical Stack */}
        <div className="flex flex-col md:flex-row w-full h-[75vh] md:h-[65vh] gap-4 md:gap-2 group/container">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/catalogo?categoria=${cat.slug}`}
              className={`
                relative flex-1 rounded-none overflow-hidden cursor-pointer
                transition-[flex-grow,filter] duration-[800ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]
                hover:flex-[2.5] md:hover:flex-[3] group/card
                border border-[#E8E6E1]/10 bg-[#1A1A18]
              `}
            >
              {/* Background Image */}
              <div className="absolute inset-0 w-full h-full">
                <Image
                  src={getCategoryImage(cat.slug, cat.image_url)}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-90 group-hover/card:opacity-100 group-hover/card:scale-105 transition-all duration-[1s] ease-out"
                  sizes="(max-width: 768px) 100vw, 30vw"
                  loading="lazy"
                />
                
                {/* Gradient Overlays para contraste pero dejando ver el color */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#111110]/20 to-transparent group-hover/card:opacity-0 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111110]/70 via-[#111110]/30 to-transparent opacity-80 group-hover/card:opacity-60 transition-opacity duration-700" />
              </div>

              {/* Numbering (01, 02, etc) */}
              <div className="absolute top-6 left-6 font-mono text-xs text-[#E8E6E1]/30 tracking-[0.2em] group-hover/card:text-[#E8E6E1]/80 transition-colors duration-500">
                0{i + 1}
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                <h4 
                  className="font-heading text-3xl md:text-4xl font-bold text-[#E8E6E1] uppercase tracking-widest leading-none transform origin-bottom-left transition-transform duration-700"
                >
                  {cat.name}
                </h4>

                {/* Arrow Icon that appears on hover */}
                <div className="w-10 h-10 rounded-full border border-[#E8E6E1]/20 flex items-center justify-center bg-[#111110]/50 backdrop-blur-sm opacity-0 -translate-x-4 group-hover/card:opacity-100 group-hover/card:translate-x-0 transition-all duration-500 delay-100 hidden md:flex">
                  <ArrowRight className="w-4 h-4 text-[#E8E6E1]" strokeWidth={1.5} />
                </div>
              </div>
              
              {/* Mobile Arrow (Always visible on mobile) */}
              <div className="absolute bottom-6 right-6 md:hidden">
                 <ArrowRight className="w-5 h-5 text-[#E8E6E1]/50" />
              </div>
              
            </Link>
          ))}
        </div>

      </div>
    </section>
  )
}
