'use client'

import { useState, useEffect, useRef } from 'react'

interface LoadingScreenProps {
  onComplete: () => void
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [phase, setPhase] = useState<number>(0)
  const [decodeText, setDecodeText] = useState('')
  const [showLocation, setShowLocation] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showListo, setShowListo] = useState(false)
  
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Animation frames refs
  const glitchRef = useRef<number>(0)
  const progressRef = useRef<number>(0)
  
  // Skip if user prefers reduced motion
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setTimeout(() => {
        onComplete()
      }, 1000)
      return
    }

    // FASE 0: Black screen (0 - 200ms)
    const t0 = setTimeout(() => setPhase(1), 200)

    // FASE 1: Glitch Estática (200 - 600ms)
    const t1 = setTimeout(() => setPhase(2), 600)

    // FASE 2: Decode "LA GUACA" (600 - 1600ms) + Localidad (800ms)
    // Localidad text starts a bit after decode starts
    const tLoc = setTimeout(() => setShowLocation(true), 800)
    
    // FASE 3: Barra de carga (1600 - 2400ms)
    const t3 = setTimeout(() => {
      setPhase(3)
      startProgressAnimation()
    }, 1600)

    // FASE 4: Impacto (2400 - 2700ms)
    const t4 = setTimeout(() => {
      setPhase(4)
      setShowListo(true)
    }, 2400)

    // FASE 5: Split Vertical (2700 - 3200ms)
    const t5 = setTimeout(() => {
      setPhase(5)
    }, 2700)

    // END: Remove component (3200ms)
    const tEnd = setTimeout(() => {
      onComplete()
    }, 3200)

    return () => {
      clearTimeout(t0)
      clearTimeout(t1)
      clearTimeout(tLoc)
      clearTimeout(t3)
      clearTimeout(t4)
      clearTimeout(t5)
      clearTimeout(tEnd)
      if (glitchRef.current) cancelAnimationFrame(glitchRef.current)
      if (progressRef.current) cancelAnimationFrame(progressRef.current)
    }
  }, [onComplete])

  // --- GLITCH CANVAS LOGIC (Fase 1-3) ---
  useEffect(() => {
    if (phase < 1 || phase >= 4) return
    const canvas = canvasRef.current
    if (!canvas) return
    
    // willReadFrequently optimization
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    let lastTime = 0
    const fps = 30
    const interval = 1000 / fps

    const renderGlitch = (time: number) => {
      if (time - lastTime < interval) {
        glitchRef.current = requestAnimationFrame(renderGlitch)
        return
      }
      lastTime = time

      // Clear with black
      ctx.fillStyle = '#111110'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw random noise blocks
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const w = Math.random() * 100 + 10
        const h = Math.random() * 20 + 2
        
        ctx.fillStyle = Math.random() > 0.8 ? '#E8E6E1' : '#242422'
        if (Math.random() > 0.5) {
            ctx.fillRect(x, y, w, h)
        }
      }

      glitchRef.current = requestAnimationFrame(renderGlitch)
    }
    
    glitchRef.current = requestAnimationFrame(renderGlitch)
    
    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (glitchRef.current) cancelAnimationFrame(glitchRef.current)
    }
  }, [phase])

  // --- DECODE LOGIC (Fase 2) ---
  useEffect(() => {
    if (phase !== 2) return
    
    const targetText = "LA GUACA"
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    
    // Timings defined in ms from the start of phase 2 (which is absolute 600ms)
    // Target timings absolute: L:700, A:750, ' ':750, G:820, U:880, A:940, C:1000, A:1050
    // Relative to phase 2 start (absolute 600): L:100, A:150, ' ':150, G:220, U:280, A:340, C:400, A:450
    const resolveTimesRelative = [100, 150, 150, 220, 280, 340, 400, 450]
    const startTime = Date.now()
    
    const decodeInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      
      let currentText = ""
      for (let i = 0; i < targetText.length; i++) {
        if (targetText[i] === ' ') {
          currentText += ' '
          continue
        }
        
        if (elapsed > resolveTimesRelative[i]) {
          currentText += targetText[i]
        } else {
          currentText += chars[Math.floor(Math.random() * chars.length)]
        }
      }
      
      setDecodeText(currentText)
      
      if (elapsed > 500) {
        setDecodeText(targetText)
        clearInterval(decodeInterval)
      }
    }, 1000 / 60) // 60fps
    
    return () => clearInterval(decodeInterval)
  }, [phase])

  // --- PROGRESS BAR LOGIC (Fase 3) ---
  const startProgressAnimation = () => {
    const startTime = Date.now()
    const duration = 800 // 1600ms to 2400ms
    
    const animate = () => {
      const elapsed = Date.now() - startTime
      let p = elapsed / duration
      
      if (p > 1) p = 1
      
      // Non-linear easing (fast start, slow end)
      const easeOutQuart = 1 - Math.pow(1 - p, 4)
      setProgress(Math.round(easeOutQuart * 100))
      
      if (p < 1) {
        progressRef.current = requestAnimationFrame(animate)
      }
    }
    progressRef.current = requestAnimationFrame(animate)
  }

  // Calculate dynamic classes
  const noiseOpacity = phase === 1 ? 'opacity-100' : phase === 2 ? 'opacity-30' : 'opacity-0'
  const textScale = phase === 4 ? 'scale-[1.08]' : 'scale-100'
  const isTargetText = decodeText === "LA GUACA"
  const isSplit = phase === 5

  return (
    <div 
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-background overflow-hidden pointer-events-none transition-opacity duration-300 ${phase >= 5 ? 'bg-transparent' : ''}`}
      ref={containerRef}
    >
      {/* GLITCH CANVAS */}
      <canvas 
        ref={canvasRef} 
        className={`absolute inset-0 w-full h-full mix-blend-screen transition-opacity duration-300 ${noiseOpacity}`} 
      />

      {/* SPLIT HALVES */}
      <div 
        className={`absolute top-0 left-0 right-0 h-[50vh] bg-background overflow-hidden transition-transform duration-500 will-change-transform ${isSplit ? '-translate-y-full' : 'translate-y-0'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
      />
      <div 
        className={`absolute bottom-0 left-0 right-0 h-[50vh] bg-background overflow-hidden transition-transform duration-500 will-change-transform ${isSplit ? 'translate-y-full' : 'translate-y-0'}`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.76, 0, 0.24, 1)' }}
      />

      {/* FLASH TEXT ON SPLIT (Illusion of transfer) */}
      {isSplit && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
          <h1 className="font-heading font-bold text-[22vw] md:text-[18vw] leading-none text-foreground opacity-15 animate-pulse-fast">
            LA GUACA
          </h1>
        </div>
      )}

      {/* MAIN CONTENT CONTAINER */}
      <div className={`relative z-10 flex flex-col items-center justify-center transition-opacity duration-150 ${isSplit ? 'opacity-0' : 'opacity-100'}`}>
        
        {/* TEXT DECODE */}
        <div className={`transition-transform duration-200 ${textScale}`}>
          {phase >= 2 && (
             <h1 className="font-heading font-bold text-[22vw] md:text-[18vw] leading-none tracking-tight flex items-center justify-center h-[24vw] md:h-[20vw]">
               {decodeText.split('').map((char, i) => {
                 const isFinal = isTargetText || (char === "LA GUACA"[i] && phase >= 2)
                 // Flash gold briefly when finalizing, then white. Scrambling is gold.
                 return (
                   <span 
                     key={i} 
                     className={`${isFinal ? 'text-[#E8E6E1]' : 'text-[#E8E6E1]'} ${char === ' ' ? 'w-[4vw]' : ''}`}
                     style={{ textShadow: isFinal && phase === 2 ? '0 0 10px #E8E6E1' : 'none', transition: 'text-shadow 0.1s ease-out' }}
                   >
                     {char}
                   </span>
                 )
               })}
             </h1>
          )}
        </div>

        {/* LOCALIDAD TEXT */}
        <div className={`h-4 mt-2 transition-opacity duration-300 ${showLocation && phase < 4 ? 'opacity-100' : 'opacity-0'}`}>
          <p className="font-mono text-[11px] tracking-[0.6em] text-foreground-muted uppercase animate-fade-in">
            Montería · Colombia
          </p>
        </div>

        {/* LINEA QUIRURGICA & PROGRESO */}
        <div className={`mt-8 flex flex-col items-center justify-center w-[200px] md:w-[280px] transition-opacity duration-300 ${phase >= 3 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="relative w-full h-[1px] bg-border overflow-hidden mb-3">
             <div 
               className={`absolute top-0 h-full left-1/2 -translate-x-1/2 bg-gradient-to-r from-transparent to-foreground via-foreground-muted ${phase >= 4 ? 'w-full shadow-[0_0_20px_rgba(232,230,225,0.1),0_0_40px_rgba(232,230,225,0.05)] bg-foreground' : ''}`}
               style={{ 
                 width: phase >= 4 ? '100%' : `${progress}%`,
                 transition: phase >= 4 ? 'all 0.3s cubic-bezier(0.25, 0, 0, 1)' : 'none'
               }}
             />
          </div>
          
          <div className="h-4 perspective-1000 relative w-12 text-center overflow-hidden">
             <div className={`absolute inset-0 font-mono text-[10px] xl:text-xs text-foreground-subtle transition-transform duration-300 ${showListo ? '-translate-y-full rotate-x-90 opacity-0' : 'translate-y-0 rotate-x-0 opacity-100'}`}>
               {progress.toString().padStart(2, '0')}%
             </div>
             <div className={`absolute inset-0 font-mono font-bold text-[10px] xl:text-xs text-foreground transition-transform duration-300 ${showListo ? 'translate-y-0 rotate-x-0 opacity-100' : 'translate-y-full -rotate-x-90 opacity-0'}`}>
               LISTO
             </div>
          </div>
        </div>

      </div>
    </div>
  )
}
