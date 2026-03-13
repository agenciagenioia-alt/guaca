'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'

// Función auxiliar para calcular el próximo Lunes a las 10am
const getNextMonday10AM = () => {
    const now = new Date()
    const currentDay = now.getDay() // 0 = Domingo, 1 = Lunes

    // Si ya pasó las 10AM del lunes, saltar al siguiente lunes (o si estamos entre martes a domingo)
    let daysUntilNextMonday = 1 - currentDay
    if (daysUntilNextMonday <= 0) {
        if (daysUntilNextMonday === 0 && now.getHours() < 10) {
            // Es Lunes antes de las 10am, es hoy
            daysUntilNextMonday = 0
        } else {
            daysUntilNextMonday += 7
        }
    }

    const target = new Date(now)
    target.setDate(now.getDate() + daysUntilNextMonday)
    target.setHours(10, 0, 0, 0)

    return target.getTime()
}

const FlipDigit = ({ val, label }: { val: number; label: string }) => {
    const [currentVal, setCurrentVal] = useState(val)
    const [isFlipping, setIsFlipping] = useState(false)

    useEffect(() => {
        if (val !== currentVal) {
            setIsFlipping(true)
            setTimeout(() => {
                setCurrentVal(val)
                setIsFlipping(false)
            }, 150)
        }
    }, [val, currentVal])

    return (
        <div className="flex flex-col items-center">
            <div className="bg-surface overflow-hidden rounded-md border border-border relative min-w-[70px] md:min-w-[80px] flex items-center justify-center p-3 mb-2" style={{ perspective: '300px' }}>
                <span
                    className="font-heading text-5xl md:text-[56px] text-foreground leading-none transform transition-transform duration-150 ease-in-out"
                    style={{
                        transform: isFlipping ? 'rotateX(90deg)' : 'rotateX(0)',
                    }}
                >
                    {currentVal.toString().padStart(2, '0')}
                </span>
            </div>
            <span className="text-[10px] text-foreground-muted font-mono font-bold tracking-[0.2em] uppercase">
                {label}
            </span>
        </div>
    )
}

export function WeeklyDrop() {
    const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number }>({
        d: 0, h: 0, m: 0, s: 0
    })
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const targetDate = getNextMonday10AM()

        const interval = setInterval(() => {
            const now = new Date().getTime()
            const distance = targetDate - now

            if (distance < 0) {
                // Si el evento ha terminado, recalcular próximo lunes
                const nextTarget = getNextMonday10AM()
                // Evitamos loop infinito aquí, confiaremos en el recalculation natural
                // o simplemente dejamos a 0 si fuera un drop final
            }

            setTimeLeft({
                d: Math.floor(distance / (1000 * 60 * 60 * 24)),
                h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                s: Math.floor((distance % (1000 * 60)) / 1000),
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <section className="bg-background py-16 lg:py-24 border-t border-border overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">

                {/* Headers */}
                <div className="mb-12 md:mb-20 text-center md:text-left flex flex-col md:flex-row md:items-end md:justify-between gap-8">
                    <div>
                        <p className="text-foreground-muted text-[11px] font-mono font-bold tracking-[0.4em] uppercase mb-4">
                            Drop de la semana
                        </p>
                        <h2
                            className="font-heading text-[clamp(48px,7vw,100px)] leading-none text-transparent m-0 uppercase"
                            style={{ WebkitTextStroke: '2px var(--color-foreground)' }}
                        >
                            NO TE LO PIERDAS
                        </h2>
                        <p className="text-foreground-subtle text-sm md:text-base mt-4 font-body">
                            Nuevas piezas exclusivas disponibles cada semana.
                        </p>
                    </div>

                    {/* Countdown */}
                    {mounted && (
                        <div className="flex items-center justify-center gap-3 md:gap-4 flex-shrink-0">
                            <FlipDigit val={timeLeft.d} label="Días" />
                            <FlipDigit val={timeLeft.h} label="Horas" />
                            <FlipDigit val={timeLeft.m} label="Minutos" />
                            <FlipDigit val={timeLeft.s} label="Seg" />
                        </div>
                    )}
                </div>

                {/* Featured Product Block */}
                <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-16 mt-8">
                    {/* Info */}
                    <div className="w-full md:w-[40%] flex flex-col items-start gap-6">
                        <div className="space-y-2">
                            <p className="font-mono text-[10px] text-foreground-muted tracking-widest uppercase">
                                Pieza Central
                            </p>
                            <h3 className="font-heading text-4xl md:text-5xl text-foreground leading-none">
                                CHAQUETA VARSITY <br /> G-2026 X
                            </h3>
                            <p className="font-mono text-xl text-foreground-subtle mt-2">
                                $280.000
                            </p>
                        </div>

                        <div className="w-full h-[1px] bg-border" />

                        <div className="w-full">
                            <p className="font-mono text-[10px] text-foreground-muted tracking-widest uppercase mb-3">
                                Tallas disponibles
                            </p>
                            <div className="flex gap-2">
                                {['S', 'M', 'L', 'XL'].map(t => (
                                    <span key={t} className="w-10 h-10 border border-border text-foreground flex items-center justify-center font-mono text-xs rounded-sm bg-surface">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Link
                            href="/catalogo/ropa"
                            className="group relative inline-flex mt-4 px-8 py-4 border border-foreground text-foreground font-heading tracking-widest uppercase overflow-hidden hover:text-background hover:border-foreground transition-colors duration-300 w-full md:w-auto text-center justify-center"
                        >
                            <span className="relative z-10">VER PRE-VENTA</span>
                            <div className="absolute inset-0 bg-foreground translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0" />
                        </Link>
                    </div>

                    {/* Image Area - 3:4 aspect */}
                    <div className="w-full md:w-[60%] aspect-[3/4] md:aspect-[4/3] relative bg-surface overflow-hidden rounded-md group">
                        <Image
                            src="https://images.unsplash.com/photo-1544441893-675973e31985?w=1000"
                            alt="Chaqueta Varsity Drop de la Semana"
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-[1s]"
                            sizes="(max-width: 768px) 100vw, 60vw"
                        />
                        {/* Eliminar overlay negro invasivo para permitir blancura, pero con un léger fade inferior */}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />

                        <div className="absolute top-6 right-6">
                            <span className="bg-foreground px-3 py-1 font-mono text-[10px] font-bold text-background uppercase tracking-widest rotate-2 inline-block">
                                STOCK LIMITADO
                            </span>
                        </div>
                    </div>
                </div>

            </div>
        </section>
    )
}
