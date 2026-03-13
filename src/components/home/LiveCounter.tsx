'use client'
import { useEffect, useRef, useState } from 'react'

export function LiveCounter() {
    const [counts, setCounts] = useState([0, 0, 0])
    const sectionRef = useRef<HTMLElement>(null)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            const [entry] = entries
            if (entry.isIntersecting && !hasAnimated) {
                setHasAnimated(true)

                const duration = 2000 // 2s duration
                const fps = 60
                const steps = duration / (1000 / fps)
                let step = 0

                const timer = setInterval(() => {
                    step++
                    const progress = step / steps
                    // ease out quad
                    const easeOut = 1 - (1 - progress) * (1 - progress)

                    setCounts([
                        Math.floor(270 * easeOut),
                        Math.floor(25200 * easeOut), // 25.2K
                        Math.floor(100 * easeOut),
                    ])

                    if (step >= steps) {
                        clearInterval(timer)
                        setCounts([270, 25200, 100])
                    }
                }, 1000 / fps)
            }
        }, { threshold: 0.3 })

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [hasAnimated])

    const formatNumber = (val: number, isK: boolean) => {
        if (isK && val >= 1000) {
            return (val / 1000).toFixed(1).replace('.0', '') + 'K'
        }
        return val.toString()
    }

    return (
        <section ref={sectionRef} className="bg-surface py-10 w-full border-y border-border">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col md:flex-row items-center justify-around gap-8 md:gap-0">

                    <div className="flex flex-col items-center text-center">
                        <span className="font-heading text-6xl text-foreground m-0 leading-none">
                            {counts[0]}+
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.4em] text-foreground-subtle mt-2 uppercase">
                            Publicaciones
                        </span>
                    </div>

                    <div className="hidden md:block w-[1px] h-16 bg-border" />

                    <div className="flex flex-col items-center text-center">
                        <span className="font-heading text-6xl text-foreground m-0 leading-none">
                            {formatNumber(counts[1], true)}
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.4em] text-foreground-subtle mt-2 uppercase">
                            Seguidores
                        </span>
                    </div>

                    <div className="hidden md:block w-[1px] h-16 bg-border" />

                    <div className="flex flex-col items-center text-center">
                        <span className="font-heading text-6xl text-foreground m-0 leading-none">
                            {counts[2]}%
                        </span>
                        <span className="font-mono text-[11px] tracking-[0.4em] text-foreground-subtle mt-2 uppercase">
                            Originales
                        </span>
                    </div>

                </div>
            </div>
        </section>
    )
}
