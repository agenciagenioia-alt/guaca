'use client'

import { useEffect, useRef, useState } from 'react'

interface StickyScrollProps {
  videoUrl?: string | null
}

const ROTATE_INTERVAL_MS = 4000

export function StickyScroll({ videoUrl }: StickyScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState(0) // 0, 1, or 2
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)')
    const onMatch = () => setIsMobile(mql.matches)
    onMatch()
    mql.addEventListener('change', onMatch)
    return () => mql.removeEventListener('change', onMatch)
  }, [])

  // En mobile: rotación automática Cultura → Calidad → Exclusividad (sin scroll)
  useEffect(() => {
    if (!isMobile) return
    const id = setInterval(() => {
      setPhase((p) => (p + 1) % 3)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isMobile])

  // En desktop: fase según scroll
  useEffect(() => {
    if (isMobile) return
    const handleScroll = () => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const scrollableHeight = rect.height - window.innerHeight
      
      if (rect.top <= 0 && rect.bottom >= window.innerHeight) {
        const scrolledDistance = -rect.top
        const progress = Math.max(0, Math.min(1, scrolledDistance / scrollableHeight))
        
        if (progress < 0.33) {
          setPhase(0)
        } else if (progress < 0.66) {
          setPhase(1)
        } else {
          setPhase(2)
        }
      } else if (rect.top > 0) {
        setPhase(0)
      } else if (rect.bottom < window.innerHeight) {
        setPhase(2)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isMobile])

  return (
    <section ref={containerRef} className="relative w-full h-screen md:h-[280vh]">
      {/* The sticky container that locks into the viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden flex flex-col items-center justify-end pb-[8vh]">
        
        {/* Video background or fallback — mobile: object-center para encuadre centrado */}
        {videoUrl ? (
          <div className="absolute inset-0 w-full h-full">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover object-center"
            >
              <source src={videoUrl} type="video/mp4" />
            </video>
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-[#111110]/75" />
          </div>
        ) : (
          /* Fallback: Original white dynamic bg */
          <div className="sticky-dynamic-bg absolute inset-0 overflow-hidden">
            <div
              className="absolute inset-0 opacity-[0.6]"
              style={{
                background: 'linear-gradient(135deg, #FDFDFB 0%, #F5F5F3 25%, rgba(235,235,233,0.9) 50%, #F8F8F6 75%, #FDFDFB 100%)',
                backgroundSize: '200% 200%',
                animation: 'sticky-gradient-drift 25s ease-in-out infinite',
              }}
            />
            <div className="sticky-blob-1 absolute top-[10%] left-[15%] w-[min(80vw,420px)] h-[min(80vw,420px)] rounded-full bg-[rgba(255,255,255,0.7)] blur-[80px]" />
            <div className="sticky-blob-2 absolute top-[50%] right-[10%] w-[min(70vw,380px)] h-[min(70vw,380px)] rounded-full bg-[rgba(245,245,243,0.9)] blur-[90px]" />
            <div className="sticky-blob-3 absolute bottom-[15%] left-[35%] w-[min(60vw,320px)] h-[min(60vw,320px)] rounded-full bg-[rgba(17,17,16,0.03)] blur-[70px]" />
          </div>
        )}

        {/* Phase backgrounds (only show when no video) */}
        {!videoUrl && (
          <>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 0 ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute inset-0 bg-gradient-to-b from-surface/90 to-background/90" />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 1 ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute inset-0 bg-background/90" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-foreground/5 blur-[120px] rounded-full mix-blend-screen" />
            </div>
            <div className={`absolute inset-0 transition-opacity duration-1000 ${phase === 2 ? 'opacity-100' : 'opacity-0'}`}>
               <div className="absolute inset-0 bg-background/90" />
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-foreground/5 blur-[150px] rounded-full mix-blend-screen" />
            </div>
          </>
        )}

        {/* Text Content Container — mobile: más padding para que no se corten Cultura/Calidad/Exclusividad */}
        <div className="relative z-10 text-center px-4 sm:px-6 w-full max-w-4xl mx-auto flex flex-col items-center justify-center">
           
           <div className="relative w-full min-h-[140px] h-[160px] sm:h-[180px] md:h-[220px] flex items-center justify-center">
             
             {/* Text 1: Cultura */}
             <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full max-w-[100%] px-2 ${
               phase === 0 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-8'
             }`}>
                <h3 className={`font-heading text-4xl sm:text-5xl md:text-8xl lg:text-[120px] tracking-widest leading-[0.85] uppercase mb-2 sm:mb-4 break-words ${videoUrl ? 'text-[#E8E6E1]' : 'text-foreground'}`}>
                  Cultura
                </h3>
                <p className={`font-mono text-[10px] sm:text-xs md:text-sm tracking-widest mt-2 sm:mt-4 uppercase max-w-md mx-auto px-1 ${videoUrl ? 'text-[#E8E6E1]/60' : 'text-foreground-muted'}`}>
                  No vendemos ropa. Entregamos las herramientas para que construyas tu propia identidad.
                </p>
             </div>

             {/* Text 2: Calidad */}
             <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full max-w-[100%] px-2 ${
               phase === 1 ? 'opacity-100 scale-100 translate-y-0' : 
               phase < 1 ? 'opacity-0 scale-105 translate-y-8' : 'opacity-0 scale-95 -translate-y-8'
             }`}>
                <h3 className="font-heading text-4xl sm:text-5xl md:text-8xl lg:text-[120px] tracking-widest leading-[0.85] uppercase mb-2 sm:mb-4 text-transparent break-words"
                    style={{ WebkitTextStroke: `2px ${videoUrl ? '#E8E6E1' : 'var(--color-foreground)'}` }}>
                  Calidad
                </h3>
                <p className={`font-mono text-[10px] sm:text-xs md:text-sm tracking-widest mt-2 sm:mt-4 uppercase max-w-md mx-auto px-1 ${videoUrl ? 'text-[#E8E6E1]/60' : 'text-foreground-muted'}`}>
                  Seleccionamos piezas premium de marcas que dictan las reglas en el streetwear global.
                </p>
             </div>

             {/* Text 3: Exclusividad */}
             <div className={`absolute transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)] w-full max-w-[100%] px-2 ${
               phase === 2 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-105 translate-y-8'
             }`}>
                <h3 className={`font-heading text-4xl sm:text-5xl md:text-8xl lg:text-[120px] tracking-widest leading-[0.85] uppercase mb-2 sm:mb-4 break-words ${videoUrl ? 'text-[#E8E6E1]' : 'text-foreground'}`}>
                  Exclusividad
                </h3>
                <p className={`font-mono text-[10px] sm:text-xs md:text-sm tracking-widest mt-2 sm:mt-4 uppercase max-w-md mx-auto px-1 ${videoUrl ? 'text-[#E8E6E1]/60' : 'text-foreground-muted'}`}>
                  Cantidades limitadas. Cuando un drop se va, se fue para siempre. Esto es La Guaca.
                </p>
             </div>
             
           </div>

           {/* Progress Indicator */}
           <div className="absolute bottom-[-10vh] md:bottom-[-20px] flex items-center gap-4">
             {[0, 1, 2].map(i => (
               <div 
                 key={i} 
                 className={`h-[2px] rounded-full transition-all duration-500 ${
                   phase === i ? 'bg-[#E8E6E1] w-12 opacity-100' : 'bg-white/20 w-4 opacity-50'
                 }`} 
               />
             ))}
           </div>
           
        </div>
      </div>
    </section>
  )
}
