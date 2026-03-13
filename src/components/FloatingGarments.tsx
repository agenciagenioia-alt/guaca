'use client'
import { useEffect, useRef } from 'react'

const GARMENTS = [
    // Camiseta oversized
    { path: "M20,0 L30,8 Q40,10 50,8 L60,0 L80,5 L70,20 L65,20 L65,60 L35,60 L35,20 L30,20 L20,5 Z", w: 80, h: 60 },
    // Zapatilla perfil
    { path: "M0,25 Q5,8 20,6 L55,3 Q72,1 80,10 L85,22 Q68,26 38,28 L8,32 Z", w: 85, h: 35 },
    // Gorra snapback
    { path: "M8,22 Q28,2 58,4 Q78,6 84,18 L82,24 L8,24 Z M0,24 L92,24 L90,30 L2,30 Z M42,4 L44,0 L48,0 L50,4 Z", w: 92, h: 30 },
    // Pantalón cargo
    { path: "M15,0 L42,0 L47,38 L52,65 L62,65 L62,38 L68,0 L82,0 L76,65 L52,70 L47,42 L42,70 L18,65 Z", w: 82, h: 70 },
    // Hoodie
    { path: "M28,0 L36,14 Q42,17 50,17 Q58,17 64,14 L72,0 L88,7 L78,24 L68,21 L68,68 L32,68 L32,21 L22,24 L12,7 Z", w: 88, h: 68 },
    // Shorts
    { path: "M10,0 L45,0 L50,35 L55,0 L80,0 L72,55 L52,58 L50,38 L48,58 L28,55 Z", w: 80, h: 58 },
    // Bolso/bag
    { path: "M15,20 Q15,5 30,5 L60,5 Q75,5 75,20 L75,65 Q75,75 65,75 L25,75 Q15,75 15,65 Z M35,5 L35,0 L55,0 L55,5", w: 75, h: 75 },
]

interface Particle {
    x: number; y: number
    vx: number; vy: number
    rotation: number; vr: number
    scale: number; opacity: number
    gIndex: number
}

export default function FloatingGarments() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Respetar prefers-reduced-motion
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

        const resize = () => {
            canvas.width = window.innerWidth
            canvas.height = document.documentElement.scrollHeight
        }
        resize()

        // Crear 14 siluetas distribuidas por toda la página
        const particles: Particle[] = Array.from({ length: 14 }, (_, i) => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: (Math.random() - 0.5) * 0.25,
            rotation: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.0015,
            scale: 1.2 + Math.random() * 1.4,
            opacity: 0.07 + Math.random() * 0.06,
            gIndex: i % GARMENTS.length,
        }))

        let animId: number
        let paused = false

        const draw = () => {
            if (paused) { animId = requestAnimationFrame(draw); return }
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            particles.forEach(p => {
                p.x += p.vx
                p.y += p.vy
                p.rotation += p.vr

                if (p.x < -150) p.x = canvas.width + 150
                if (p.x > canvas.width + 150) p.x = -150
                if (p.y < -150) p.y = canvas.height + 150
                if (p.y > canvas.height + 150) p.y = -150

                const g = GARMENTS[p.gIndex]

                ctx.save()
                ctx.translate(p.x, p.y)
                ctx.rotate(p.rotation)
                ctx.scale(p.scale, p.scale)
                ctx.translate(-g.w / 2, -g.h / 2)

                const path = new Path2D(g.path)

                const colors = [
                    `rgba(255, 215, 0, ${p.opacity})`,      // dorado
                    `rgba(255, 255, 255, ${p.opacity * 0.6})`, // blanco más sutil
                ]
                ctx.strokeStyle = colors[p.gIndex % 2]
                ctx.lineWidth = 1.8 / p.scale
                ctx.lineJoin = 'round'
                ctx.stroke(path)

                ctx.restore()
            })

            animId = requestAnimationFrame(draw)
        }

        document.addEventListener('visibilitychange', () => {
            paused = document.hidden
        })
        window.addEventListener('resize', resize)

        draw()

        return () => {
            cancelAnimationFrame(animId)
            window.removeEventListener('resize', resize)
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                inset: 0,
                width: '100vw',
                height: '100vh',
                pointerEvents: 'none',
                // zIndex 5 forzado para asegurar que pasa por encima de `<main bg-background>` estáticos de Tailwind
                zIndex: 5,
            }}
        />
    )
}
