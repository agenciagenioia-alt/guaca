'use client'

import React, { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Brand {
    name: string
    desc: string
    href: string
}

const FALLBACK_MARCAS: Brand[] = [
    { name: "ON RUNNING", desc: "Performance running & lifestyle. La zapatilla favorita de quienes se mueven diferente.", href: "/catalogo?marca=on-running" },
    { name: "NIKE · AIR FORCE 1", desc: "El clásico que nunca pasa de moda. Icónico desde 1982.", href: "/catalogo?marca=nike" },
    { name: "SAINT THEORY", desc: "Streetwear con actitud. Gráficos que cuentan historias.", href: "/catalogo?marca=saint-theory" },
    { name: "NDRG", desc: "Diseño urbano con identidad propia. Hecho para los que no siguen tendencias.", href: "/catalogo?marca=ndrg" },
    { name: "CLEMONT", desc: "Premium streetwear. Cada pieza diseñada al detalle.", href: "/catalogo?marca=clemont" },
    { name: "CARHARTT WIP", desc: "Del workwear a la calle. Durabilidad con estilo desde 1889.", href: "/catalogo?marca=carhartt" },
    { name: "CALVIN KLEIN", desc: "Minimalismo premium. El lujo en su forma más pura.", href: "/catalogo?marca=calvin-klein" },
    { name: "ADIDAS", desc: "Tres rayas. Una cultura. Icónico desde 1949.", href: "/catalogo?marca=adidas" },
]

export default function MarcasPage() {
    const gridRef = useRef<HTMLDivElement>(null)
    const [marcas, setMarcas] = useState<Brand[]>(FALLBACK_MARCAS)

    useEffect(() => {
        const supabase = createClient() as any
        supabase
            .from('brands')
            .select('name, description, slug')
            .eq('is_active', true)
            .order('display_order')
            .then(({ data }: { data: Array<{ name: string; description: string; slug: string }> | null }) => {
                if (data && data.length > 0) {
                    setMarcas(data.map(b => ({
                        name: b.name,
                        desc: b.description,
                        href: `/catalogo?marca=${b.slug}`,
                    })))
                }
            })
    }, [])

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0')
                    entry.target.classList.remove('opacity-0', 'translate-y-8')
                    observer.unobserve(entry.target)
                }
            })
        }, { threshold: 0.1 })

        const cards = gridRef.current?.querySelectorAll('.marca-card')
        cards?.forEach((card, i) => {
            // Apply stagger delay
            ; (card as HTMLElement).style.transitionDelay = `${i * 80}ms`
            observer.observe(card)
        })

        return () => observer.disconnect()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">

            {/* HERO SECTION */}
            <section className="relative pt-32 pb-24 md:pt-48 md:pb-32 px-6 overflow-hidden bg-background flex flex-col items-center justify-center text-center">
                {/* Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

                {/* Typography Asymetric Offset */}
                <div className="relative z-10 flex flex-col items-center w-full max-w-[1400px]">
                    <h1
                        className="font-heading text-[12vw] leading-none text-transparent m-0 uppercase md:ml-[-10vw]"
                        style={{ WebkitTextStroke: '2px var(--foreground-muted)' }}
                    >
                        LAS
                    </h1>
                    <h1 className="font-heading text-[12vw] leading-[0.85] text-foreground m-0 uppercase md:ml-[10vw] -mt-2 md:-mt-6">
                        MARCAS
                    </h1>
                </div>

                <p className="relative z-10 mt-12 mb-0 font-mono text-[11px] tracking-[0.5em] text-foreground-muted uppercase">
                    VENDEDORES AUTORIZADOS · PRODUCTOS 100% ORIGINALES
                </p>
            </section>

            {/* GRID DE MARCAS */}
            <section className="max-w-[1400px] mx-auto px-6 pb-32">
                <div
                    ref={gridRef}
                    className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border border border-border"
                >
                    {marcas.map((marca: Brand, i: number) => (
                        <Link
                            key={i}
                            href={marca.href}
                            className="marca-card block bg-surface p-8 lg:p-12 transition-all duration-300 border border-transparent hover:bg-surface-hover group opacity-0 translate-y-8 ease-out will-change-[opacity,transform]"
                        >
                            <h2 className="font-heading text-4xl lg:text-5xl text-foreground uppercase tracking-wider mb-4 group-hover:text-foreground-muted transition-colors duration-200">
                                {marca.name}
                            </h2>
                            <div className="w-[40px] h-[1px] bg-foreground mb-6" />
                            <p className="text-[13px] text-foreground-muted leading-[1.6] mb-10 max-w-[80%] font-body">
                                {marca.desc}
                            </p>

                            <div className="flex items-center text-[11px] text-foreground uppercase tracking-[0.2em] font-medium transition-transform duration-200 group-hover:translate-x-1">
                                VER COLECCIÓN <span className="ml-2">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section className="bg-surface py-20 md:py-32 px-6 flex flex-col items-center justify-center text-center">
                <div className="flex flex-col items-center max-w-4xl mx-auto">
                    <h2
                        className="font-heading text-5xl md:text-7xl leading-none text-transparent m-0 uppercase tracking-tight"
                        style={{ WebkitTextStroke: '2px var(--foreground-muted)' }}
                    >
                        ¿BUSCAS UNA MARCA
                    </h2>
                    <h2 className="font-heading text-5xl md:text-7xl leading-[0.8] text-foreground m-0 uppercase tracking-tight mb-8">
                        ESPECÍFICA?
                    </h2>

                    <p className="text-foreground-muted font-body text-[16px] md:text-[18px] mb-12">
                        Escríbenos y la conseguimos para ti
                    </p>

                    <a
                        href="https://wa.me/573001234567"
                        target="_blank"
                        rel="noreferrer"
                        className="bg-foreground text-background font-heading font-bold uppercase tracking-widest px-10 py-5 text-[15px] hover:bg-black transition-colors rounded-none flex items-center gap-3"
                    >
                        ESCRÍBENOS POR WHATSAPP
                    </a>
                </div>
            </section>

        </div>
    )
}
