'use client'
import { useEffect, useRef } from 'react'

interface Orb {
  x: number
  y: number
  radius: number
  color: string
  vx: number
  vy: number
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const orbsRef = useRef<Orb[]>([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initOrbs()
    }

    const initOrbs = () => {
      const orbs: Orb[] = []
      const w = canvas.width
      const h = canvas.height
      const isMobile = w < 768

      // 1. Orbe principal central grande (iluminación principal del producto)
      orbs.push({
        x: w * 0.5,
        y: h * 0.3,
        radius: isMobile ? w * 0.8 : w * 0.4,
        color: 'rgba(232, 230, 225, 0.035)', // Marfil muy sutil
        vx: 0.1,
        vy: 0.15,
      })

      // 2. Orbe secundario cálido (lateral abajo)
      orbs.push({
        x: w * 0.8,
        y: h * 0.8,
        radius: isMobile ? w * 0.6 : w * 0.35,
        color: 'rgba(232, 230, 225, 0.025)',
        vx: -0.15,
        vy: -0.1,
      })

      // 3. Orbe terciario profundo (lateral arriba)
      orbs.push({
        x: w * 0.2,
        y: h * 0.2,
        radius: isMobile ? w * 0.7 : w * 0.45,
        color: 'rgba(255, 255, 255, 0.015)',
        vx: 0.12,
        vy: -0.08,
      })

      orbsRef.current = orbs
    }

    window.addEventListener('resize', resize)
    resize()

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Fondo Base Negro Carbón
      const baseGradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
      )
      baseGradient.addColorStop(0, '#161615') // Ligeramente iluminado al centro
      baseGradient.addColorStop(1, '#0C0C0B') // Viñeta oscura pura a los bordes
      
      ctx.fillStyle = baseGradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Dibujar Orbes con Blur extremo simulando luces
      ctx.globalCompositeOperation = 'screen' // Mezcla de luz aditiva

      for (const orb of orbsRef.current) {
        // Movimiento flotante
        orb.x += orb.vx
        orb.y += orb.vy

        // Rebote suave en los bordes con mucho margen (para que salgan de pantalla)
        if (orb.x < -orb.radius || orb.x > canvas.width + orb.radius) orb.vx *= -1
        if (orb.y < -orb.radius || orb.y > canvas.height + orb.radius) orb.vy *= -1

        // Gradiente radial por orbe
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        )
        gradient.addColorStop(0, orb.color)
        gradient.addColorStop(0.5, orb.color.replace(/[\d\.]+\)$/g, '0.01)')) // Desvanece a la mitad
        gradient.addColorStop(1, 'rgba(0,0,0,0)')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.globalCompositeOperation = 'source-over' // Reset

      animRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        pointerEvents: 'none',
        // El blur vía CSS mejora radicalmente el performance en canvas grande
        filter: 'blur(80px)', 
        transform: 'translate3d(0, 0, 0)' // Aceleración GPU
      }}
    />
  )
}
