'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  baseX: number;
}

interface HeroProps {
  heroImageUrl?: string | null;
  heroVideoUrl?: string | null;
}

export function Hero({ heroImageUrl, heroVideoUrl }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const reqRef = useRef<number>(0)
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const [showSubtitle, setShowSubtitle] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)

  // Subtitle fade-in delay (accounting for global loader which takes ~3.2s)
  useEffect(() => {
    // In a real flow, we could sync this perfectly with the LoadingProvider,
    // but a 3.5s timeout generally covers the intro + 300ms delay.
    const t = setTimeout(() => setShowSubtitle(true), 3500)
    return () => clearTimeout(t)
  }, [])

  // Scroll indicator hide on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !hasScrolled) {
        setHasScrolled(true)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasScrolled])

  // Repellent Particles Canvas
  useEffect(() => {
    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    let width = 0
    let height = 0
    let particles: Particle[] = []

    const initParticles = () => {
      particles = []
      for (let i = 0; i < 35; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseX: 0,
          size: Math.random() * 1.5 + 1, // 1 - 2.5px
          speedY: Math.random() * 0.3 + 0.2, // 0.2 - 0.5px per frame
          opacity: Math.random() * 0.15 + 0.1, // 0.1 - 0.25 opacity
        })
        particles[i].baseX = particles[i].x
      }
    }

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
      initParticles()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 }
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height)

      const mouseX = mouseRef.current.x
      const mouseY = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Move up
        p.y -= p.speedY

        // Reset if goes off top
        if (p.y < -10) {
          p.y = height + 10
          p.x = Math.random() * width
          p.baseX = p.x
        }

        // Mouse repulsion
        const dx = mouseX - p.x
        const dy = mouseY - p.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        const maxDist = 80 // 80px repulsion radius

        if (distance < maxDist) {
          const force = (maxDist - distance) / maxDist
          const pushX = (dx / distance) * force * 2 // strength
          const pushY = (dy / distance) * force * 2

          p.x -= pushX
          p.y -= pushY
        } else {
          // Slowly return to base horizontal position
          p.x += (p.baseX - p.x) * 0.05
        }

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(107, 107, 104, ${p.opacity})` // #6B6B68
        ctx.fill()
      }

      reqRef.current = requestAnimationFrame(render)
    }

    resize()
    window.addEventListener('resize', resize)
    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)

    reqRef.current = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      if (reqRef.current) cancelAnimationFrame(reqRef.current)
    }
  }, [])

  return (
    <section className="relative w-full min-h-[100dvh] min-h-[600px] flex items-center justify-start bg-transparent overflow-hidden">

      {/* Asymmetrical Image/Video Background / Right Side — mobile: object-center para que no se vea cortado */}
      <div className="absolute right-0 top-0 w-full md:w-[45%] h-full z-0 pointer-events-none overflow-hidden opacity-30 md:opacity-100">
        {/* Gradients to blend cleanly with background */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10 hidden md:block" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent z-10 md:hidden" />
        {heroVideoUrl ? (
          <video
            src={heroVideoUrl}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover object-center select-none"
          />
        ) : (
          <Image
            src={heroImageUrl || '/images/hero-model-1.png'}
            alt="La Guaca Luxury Streetwear"
            fill
            priority
            className="object-cover object-[center_top] select-none opacity-80 mix-blend-lighten md:mix-blend-normal"
          />
        )}
      </div>

      {/* Repellent Particles Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-[5] w-full h-full"
        aria-hidden="true"
      />

      {/* Main Content — mobile: alineado a la izquierda para que las 3 secciones se vean mejor */}
      <div className="relative z-10 flex flex-col items-start justify-center w-full max-w-[1400px] mx-auto pl-5 pr-2 sm:pl-6 sm:pr-4 lg:px-12 pointer-events-none md:w-[60%]">

        {/* Typographic Lockup — mobile: tamaño reducido para que LA + GUACA no se corten */}
        <div className="flex flex-col relative w-full max-w-[100%] overflow-hidden md:overflow-visible pointer-events-auto z-20">
          {/* LÍNEA 1: "LA" */}
          <h1 className="font-heading font-bold text-[16vw] sm:text-[19vw] md:text-[17vw] leading-[0.85] tracking-[-0.02em] text-foreground select-none drop-shadow-2xl md:drop-shadow-none">
            LA
          </h1>

          {/* LÍNEA 2: "GUACA" (Outline, hover fill) */}
          <h1
            className="font-heading font-bold text-[16vw] sm:text-[19vw] md:text-[17vw] leading-[0.85] tracking-[-0.02em] select-none text-transparent transition-colors duration-500 hover:text-foreground md:indent-[5vw] drop-shadow-2xl md:drop-shadow-none cursor-default"
            style={{ WebkitTextStroke: '1.5px var(--color-foreground-muted)' }}
            aria-label="GUACA"
          >
            GUACA
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className={`font-mono text-[10px] md:text-[11px] tracking-[0.4em] md:tracking-[0.55em] text-foreground-muted uppercase mt-6 md:mt-8 md:ml-[3vw] transition-opacity duration-1000 ${showSubtitle ? 'opacity-100' : 'opacity-0'} relative z-20`}
        >
          Calzado · Ropa · Gorras · Montería
        </p>

        <div className={`mt-10 md:mt-12 md:ml-[3vw] pointer-events-auto transition-opacity duration-1000 delay-300 relative z-20 ${showSubtitle ? 'opacity-100' : 'opacity-0'}`}>
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center bg-foreground text-background px-10 py-5 font-heading text-sm md:text-base tracking-[0.25em] uppercase hover:opacity-90 transition-all duration-300 shadow-[0_0_40px_rgba(232,230,225,0.1)]"
          >
            VER CATÁLOGO
          </Link>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-10 transition-opacity duration-500 ${hasScrolled ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <span className="font-mono text-[9px] tracking-[0.5em] text-foreground-subtle animate-pulse-fast">SCROLL</span>
        <div className="w-[1px] h-10 bg-gradient-to-b from-foreground-subtle to-transparent animate-pulse-fast" />
      </div>

    </section>
  )
}
