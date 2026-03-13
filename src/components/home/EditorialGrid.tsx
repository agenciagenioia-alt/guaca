'use client'

import { ProductCard } from '@/components/product/ProductCard'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface EditorialGridProps {
  products: any[]
}

export function EditorialGrid({ products }: EditorialGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { current } = scrollRef
      const scrollAmount = direction === 'left' ? -current.offsetWidth / 1.5 : current.offsetWidth / 1.5
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

  if (!products || products.length === 0) return null

  return (
    <div className="w-full max-w-[1400px] mx-auto px-6 lg:px-12 py-16 md:py-24 overflow-hidden">
      <div className="flex flex-col md:flex-row items-end justify-between mb-8 md:mb-12 gap-6">
        <div>
          <p className="font-mono text-[10px] md:text-xs tracking-widest text-foreground-subtle uppercase mb-4">
            Selección Exclusiva
          </p>
          <h2 className="text-4xl md:text-6xl font-heading font-bold text-foreground uppercase leading-none tracking-tight">
            Nuevos Drops
          </h2>
        </div>
        <div className="flex flex-col md:items-end gap-6">
          <a href="/catalogo" className="font-mono text-xs text-foreground-muted hover:text-foreground transition-colors tracking-widest uppercase border-b border-border pb-1">
            Ver Colección Completa ↗
          </a>
          {/* Arrow Controls Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => scroll('left')} className="p-3 border border-border rounded-none hover:bg-surface hover:text-foreground transition-colors text-foreground-muted">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={() => scroll('right')} className="p-3 border border-border rounded-none hover:bg-surface hover:text-foreground transition-colors text-foreground-muted">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-8 -mx-6 px-6 lg:-mx-12 lg:px-12 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="snap-start shrink-0 w-[280px] md:w-[350px] lg:w-[400px] transition-all duration-500 ease-out"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      
      {/* Mobile Arrow Controls */}
      <div className="flex md:hidden items-center justify-center gap-4 mt-2">
        <button onClick={() => scroll('left')} className="p-3 border border-border rounded-none hover:bg-surface hover:text-foreground transition-colors text-foreground-muted">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button onClick={() => scroll('right')} className="p-3 border border-border rounded-none hover:bg-surface hover:text-foreground transition-colors text-foreground-muted">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
