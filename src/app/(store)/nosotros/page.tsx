'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

// Hook para CountUp simple
function useCountUp(end: number, duration: number = 2000) {
    const [count, setCount] = useState(0)
    const countRef = useRef<HTMLSpanElement>(null)
    const [hasAnimated, setHasAnimated] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !hasAnimated) {
                setHasAnimated(true)
                let startTimestamp: number | null = null
                const step = (timestamp: number) => {
                    if (!startTimestamp) startTimestamp = timestamp
                    const progress = Math.min((timestamp - startTimestamp) / duration, 1)
                    setCount(Math.floor(progress * end))
                    if (progress < 1) {
                        window.requestAnimationFrame(step)
                    } else {
                        setCount(end)
                    }
                }
                window.requestAnimationFrame(step)
            }
        }, { threshold: 0.5 })

        if (countRef.current) {
            observer.observe(countRef.current)
        }
        return () => observer.disconnect()
    }, [end, duration, hasAnimated])

    return { count, ref: countRef }
}

export default function NosotrosPage() {
    const parallaxRef = useRef<HTMLDivElement>(null)
    const sec2LeftRef = useRef<HTMLDivElement>(null)
    const sec2RightRef = useRef<HTMLDivElement>(null)

    // Valores CountUp
    const followers = useCountUp(25, 2000)
    const posts = useCountUp(270, 2500)
    const percent = useCountUp(100, 1500)

    const DEFAULT_IG_IMAGES = [
        'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=400',
        'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400',
        'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400',
        'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400',
        'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
        'https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=400',
    ]

    const [nosotrosConfig, setNosotrosConfig] = useState({
        image: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800',
        title: 'Nacimos en Montería',
        text1: 'La Guaca nació con una misión clara: traer las mejores marcas de ropa y calzado del mundo a las calles de Colombia.',
        text2: 'Somos una multi-brand store especializada en streetwear, sneakers y moda urbana. Cada prenda que vendemos la seleccionamos pensando en estilo, calidad y autenticidad.',
        text3: 'No somos una tienda más. Somos un punto de encuentro para quienes entienden la ropa como expresión.',
        igImages: DEFAULT_IG_IMAGES as string[],
    })

    useEffect(() => {
        const supabase = createClient() as any
        supabase
            .from('store_config')
            .select('nosotros_image_url, nosotros_title, nosotros_text_1, nosotros_text_2, nosotros_text_3, nosotros_ig_1_url, nosotros_ig_2_url, nosotros_ig_3_url, nosotros_ig_4_url, nosotros_ig_5_url, nosotros_ig_6_url')
            .eq('id', 1)
            .single()
            .then(({ data }: { data: Record<string, string | null> | null }) => {
                if (data) {
                    const igUrls = [
                        data.nosotros_ig_1_url,
                        data.nosotros_ig_2_url,
                        data.nosotros_ig_3_url,
                        data.nosotros_ig_4_url,
                        data.nosotros_ig_5_url,
                        data.nosotros_ig_6_url,
                    ]
                    const igImages = igUrls.map((url, i) => (url && url.trim()) || DEFAULT_IG_IMAGES[i])
                    setNosotrosConfig(prev => ({
                        image: data.nosotros_image_url || prev.image,
                        title: data.nosotros_title || prev.title,
                        text1: data.nosotros_text_1 || prev.text1,
                        text2: data.nosotros_text_2 || prev.text2,
                        text3: data.nosotros_text_3 || prev.text3,
                        igImages,
                    }))
                }
            })
    }, [])

    useEffect(() => {
        // Spotlight cursor effect
        const handleMouseMove = (e: MouseEvent) => {
            const hero = document.getElementById('hero-statement')
            if (hero) {
                const rect = hero.getBoundingClientRect()
                const x = e.clientX - rect.left
                const y = e.clientY - rect.top
                hero.style.setProperty('--mouse-x', `${x}px`)
                hero.style.setProperty('--mouse-y', `${y}px`)
            }
        }
        window.addEventListener('mousemove', handleMouseMove)

        // Parallax scroll simple limitando rangos
        const handleScroll = () => {
            const scrolled = window.scrollY
            if (parallaxRef.current) {
                // limit parallax to visual impact approx
                const offset = scrolled * -0.05
                parallaxRef.current.style.transform = `translateY(${Math.max(-40, offset)}px)`
            }
        }
        window.addEventListener('scroll', handleScroll, { passive: true })

        // Intersection para fade-in left/right section 2
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-x-0')
                    entry.target.classList.remove('opacity-0', '-translate-x-12', 'translate-x-12')
                    io.unobserve(entry.target)
                }
            })
        }, { threshold: 0.2 })

        if (sec2LeftRef.current) io.observe(sec2LeftRef.current)
        if (sec2RightRef.current) io.observe(sec2RightRef.current)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('scroll', handleScroll)
            io.disconnect()
        }
    }, [])

    return (
        <div className="min-h-screen bg-[#111110] text-[#E8E6E1] selection:bg-[#E8E6E1] selection:text-black font-body overflow-x-hidden">

            {/* SECCIÓN 1 - HERO STATEMENT */}
            <section
                id="hero-statement"
                className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden bg-[#E8E6E1]"
            >
                {/* Grain & Spotlight */}
                <div className="absolute inset-0 z-0 pointer-events-none" />
                <div
                    className="absolute inset-0 opacity-[0.1] pointer-events-none z-10 mix-blend-multiply"
                    style={{
                        background: 'radial-gradient(circle 400px at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(0,0,0,0.1), transparent 80%)'
                    }}
                />
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none z-[1] bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/1k_Dissolve_Noise_Texture.png')]" />

                <div className="relative z-20 flex flex-col items-center w-full max-w-5xl px-6">
                    <p className="font-mono text-[11px] tracking-[0.5em] text-[#666] mb-12 uppercase animate-[fadeIn_1s_0.2s_both]">
                        MONTERÍA · COLOMBIA · DESDE EL SINÚ
                    </p>

                    <div className="flex flex-col items-center">
                        <h1
                            className="font-heading text-[11vw] leading-[0.9] text-transparent m-0 uppercase opacity-0 animate-[fadeIn_0.5s_0.3s_both]"
                            style={{ WebkitTextStroke: '1.5px #111110' }}
                        >
                            NO COMPETIMOS.
                        </h1>
                        <h1 className="font-heading text-[11vw] leading-[0.9] text-[#111110] m-0 uppercase opacity-0 animate-[fadeIn_0.5s_0.5s_both]">
                            DICTAMOS
                        </h1>
                        <h1 className="font-heading text-[11vw] leading-[0.9] text-[#111110] m-0 uppercase opacity-0 animate-[fadeIn_0.5s_0.6s_both]">
                            LAS REGLAS.
                        </h1>
                    </div>

                    <p className="mt-10 text-[16px] text-[#444] leading-[1.8] max-w-[500px] mx-auto opacity-0 animate-[fadeIn_1s_0.6s_both] font-medium">
                        Entregamos las herramientas para que construyas tu propia identidad.
                    </p>
                </div>
            </section>

            {/* SECCIÓN 2 - HISTORIA */}
            <section className="bg-black py-24 md:py-40 px-6 max-w-[1200px] mx-auto overflow-hidden">
                <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 items-center">
                    {/* Texto Left */}
                    <div
                        ref={sec2LeftRef}
                        className="w-full lg:w-[40%] relative opacity-0 -translate-x-12 transition-all duration-1000 ease-out z-10"
                    >
                        <div className="absolute -top-16 -left-10 md:-left-16 font-heading text-[180px] leading-none text-[#E8E6E1]/[0.04] select-none pointer-events-none">
                            01
                        </div>
                        <div className="relative z-10 space-y-6">
                            <span className="font-mono text-[10px] tracking-[0.3em] text-[#E8E6E1] uppercase block">NUESTRA HISTORIA</span>
                            <h2 className="font-heading text-4xl md:text-5xl lg:text-[44px] font-bold text-[#E8E6E1] tracking-tight leading-tight">
                                {nosotrosConfig.title.split(' ').slice(0, 1).join(' ')} <br className="hidden lg:block" />{nosotrosConfig.title.split(' ').slice(1).join(' ')}
                            </h2>
                            <div className="space-y-6 text-[#999] text-[15px] leading-[1.9]">
                                <p>{nosotrosConfig.text1}</p>
                                <p>{nosotrosConfig.text2}</p>
                                <p>{nosotrosConfig.text3}</p>
                            </div>
                        </div>
                    </div>

                    {/* Image Right Parallax */}
                    <div
                        ref={sec2RightRef}
                        className="w-full lg:w-[60%] opacity-0 translate-x-12 transition-all duration-1000 ease-out"
                    >
                        <div className="relative w-full aspect-[4/5] bg-[#111] overflow-hidden">
                            <div ref={parallaxRef} className="absolute inset-[-10%] w-[120%] h-[120%] will-change-transform">
                                <Image
                                    src={nosotrosConfig.image}
                                    alt="La Guaca streetwear"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 1024px) 100vw, 60vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-black/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 3 - EN NÚMEROS */}
            <section className="bg-[#0d0d0d] py-[100px] border-y border-white/5">
                <div className="max-w-[1200px] mx-auto px-6 text-center">
                    <span className="font-mono text-[10px] tracking-[0.4em] text-[#666] uppercase block mb-16">
                        EN NÚMEROS
                    </span>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
                        {/* Stat 1 */}
                        <div className="py-10 md:py-4 px-4 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/[0.06]">
                            <div className="flex font-heading text-[60px] md:text-[80px] text-[#E8E6E1] leading-none mb-4">
                                <span ref={followers.ref}>{followers.count}</span>
                                <span>.2K</span>
                            </div>
                            <span className="font-mono text-[11px] tracking-[0.4em] text-[#444] uppercase">SEGUIDORES</span>
                        </div>

                        {/* Stat 2 */}
                        <div className="py-10 md:py-4 px-4 flex flex-col items-center border-b md:border-b-0 md:border-r border-white/[0.06]">
                            <div className="flex font-heading text-[60px] md:text-[80px] text-[#E8E6E1] leading-none mb-4">
                                <span ref={posts.ref}>{posts.count}</span>
                                <span>+</span>
                            </div>
                            <span className="font-mono text-[11px] tracking-[0.4em] text-[#444] uppercase">PUBLICACIONES</span>
                        </div>

                        {/* Stat 3 */}
                        <div className="py-10 md:py-4 px-4 flex flex-col items-center">
                            <div className="flex font-heading text-[60px] md:text-[80px] text-[#E8E6E1] leading-none mb-4">
                                <span ref={percent.ref}>{percent.count}</span>
                                <span>%</span>
                            </div>
                            <span className="font-mono text-[11px] tracking-[0.4em] text-[#444] uppercase">ORIGINALES</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 4 - VALORES */}
            <section className="bg-black py-[100px] px-6 max-w-[1200px] mx-auto relative overflow-hidden">
                <div className="absolute -top-6 -left-4 font-heading text-[180px] leading-none text-[#E8E6E1]/[0.03] select-none pointer-events-none">
                    02
                </div>

                <div className="flex flex-col items-center mb-24 z-10 relative text-center">
                    <h2
                        className="font-heading text-5xl md:text-6xl text-transparent uppercase m-0 leading-[0.9]"
                        style={{ WebkitTextStroke: '1px rgba(255,255,255,0.4)' }}
                    >
                        LO QUE NOS
                    </h2>
                    <h2 className="font-heading text-5xl md:text-6xl text-[#E8E6E1] uppercase m-0 leading-[0.9]">
                        DEFINE
                    </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative z-10">
                    {/* Val 1 */}
                    <div className="p-8 md:px-10 lg:px-14 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col items-start text-left">
                        <div className="w-[40px] h-[1px] bg-[#E8E6E1] mb-8" />
                        <svg className="w-8 h-8 text-[#E8E6E1] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 19V6.3a.7.7 0 011.08-.58L21 11m-10 8h10m-17 0V6a2 2 0 012-2h4a2 2 0 012 2v13" />
                        </svg>
                        <h3 className="text-[14px] font-bold text-[#E8E6E1] tracking-[0.1em] uppercase mb-4">AUTENTICIDAD</h3>
                        <p className="text-[13px] text-[#666] leading-[1.7]">
                            Cada producto que vendemos es 100% original. Sin réplicas. Sin compromisos.
                        </p>
                    </div>

                    {/* Val 2 */}
                    <div className="p-8 md:px-10 lg:px-14 border-b md:border-b-0 md:border-r border-white/[0.06] flex flex-col items-start text-left">
                        <div className="w-[40px] h-[1px] bg-[#E8E6E1] mb-8" />
                        <svg className="w-8 h-8 text-[#E8E6E1] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.27 6.96L12 12.01l8.73-5.05" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 22.08V12" />
                        </svg>
                        <h3 className="text-[14px] font-bold text-[#E8E6E1] tracking-[0.1em] uppercase mb-4">SELECCIÓN</h3>
                        <p className="text-[13px] text-[#666] leading-[1.7]">
                            No vendemos de todo. Vendemos lo mejor. Cada marca pasa por nuestro filtro.
                        </p>
                    </div>

                    {/* Val 3 */}
                    <div className="p-8 md:px-10 lg:px-14 flex flex-col items-start text-left">
                        <div className="w-[40px] h-[1px] bg-[#E8E6E1] mb-8" />
                        <svg className="w-8 h-8 text-[#E8E6E1] mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                        </svg>
                        <h3 className="text-[14px] font-bold text-[#E8E6E1] tracking-[0.1em] uppercase mb-4">COMUNIDAD</h3>
                        <p className="text-[13px] text-[#666] leading-[1.7]">
                            Somos de Montería y para Colombia. Tu estilo, nuestro compromiso.
                        </p>
                    </div>
                </div>
            </section>

            {/* SECCIÓN 5 - UBICACIÓN */}
            <section className="bg-[#111110] py-24 md:py-32 relative overflow-hidden border-t border-white/5">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">

                    <div className="relative z-10 lg:pl-10">
                        <div className="absolute -top-20 -left-6 font-heading text-[180px] leading-none text-[#E8E6E1]/[0.03] select-none pointer-events-none">
                            03
                        </div>
                        <h2 className="font-heading text-[12vw] lg:text-[5vw] text-[#E8E6E1] uppercase tracking-tight leading-none xl:m-0 mb-4">
                            ¿DÓNDE
                        </h2>
                        <h2 className="font-heading text-[12vw] lg:text-[5vw] text-[#E8E6E1] uppercase tracking-tight leading-none xl:m-0 mb-10">
                            ENCONTRARNOS?
                        </h2>

                        <div className="space-y-10">
                            {/* Dirección */}
                            <div>
                                <p className="font-bold text-[#E8E6E1] text-[18px] mb-1">Calle 37 #1w-139</p>
                                <p className="text-[#666] text-[15px] mb-1">Barrio Juan XXIII</p>
                                <p className="text-[#666] text-[15px]">Montería, Córdoba 230001</p>
                            </div>

                            {/* Horario */}
                            <div>
                                <span className="font-mono text-[10px] text-[#E8E6E1] tracking-[0.3em] uppercase block mb-3">HORARIO</span>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center max-w-[280px] border-b border-white/5 pb-2">
                                        <span className="text-[#E8E6E1] text-[15px]">Lunes — Sábado</span>
                                        <span className="text-[#666] text-[15px]">9:00 AM — 7:00 PM</span>
                                    </div>
                                    <div className="flex justify-between items-center max-w-[280px] pb-2">
                                        <span className="text-[#E8E6E1] text-[15px]">Domingo</span>
                                        <span className="text-[#666] text-[15px]">Cerrado</span>
                                    </div>
                                </div>
                            </div>

                            <p className="font-mono text-[11px] text-[#333] tracking-widest mt-8">
                                6.8447° N · 75.8817° O
                            </p>

                            <a
                                href="https://wa.me/573001234567"
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex bg-[#E8E6E1] text-[#111110] font-heading font-bold uppercase tracking-widest px-8 py-4 text-[15px] hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors"
                            >
                                ESCRÍBENOS AHORA
                            </a>
                        </div>
                    </div>

                    {/* Google Maps Iframe */}
                    <div className="w-full h-[400px] lg:h-[600px] bg-[#111] relative border border-white/5 grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-500">
                        {/* 
                          Si falla conectarse embedearemos una capa visual de contingencia -
                          Asumiendo Monteria Centro.
                        */}
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31557.07000720412!2d-75.90838186106886!3d8.751634560775586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e5a2fac00fba6df%3A0xc392c68c2d5d83!2sMonter%C3%ADa%2C%20C%C3%B3rdoba!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen={false}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Mapa Tienda La Guaca"
                        />
                    </div>
                </div>
            </section>

            {/* SECCIÓN 6 - INSTAGRAM FEED */}
            <section className="bg-[#080808] py-24 md:py-32 px-6 flex flex-col items-center justify-center text-center overflow-hidden">
                <div className="relative z-10 flex flex-col items-center w-full max-w-[1200px] mb-16">
                    <h2
                        className="font-heading text-[12vw] md:text-[7vw] leading-none text-transparent m-0 uppercase md:ml-[-10vw]"
                        style={{ WebkitTextStroke: '2px rgba(255,255,255,0.4)' }}
                    >
                        SÍGUENOS
                    </h2>
                    <h2 className="font-heading text-[12vw] md:text-[7vw] leading-[0.85] text-[#E8E6E1] m-0 uppercase md:ml-[10vw] -mt-2">
                        EN INSTAGRAM
                    </h2>
                    <p className="text-[13px] text-[#666] font-mono tracking-widest uppercase mt-8 border border-white/10 px-6 py-2 rounded-full">
                        @boutiquelaguaca1 · 25.2K seguidores
                    </p>
                </div>

                {/* Grid IG 3x2 — imágenes editables desde Admin → Nosotros */}
                <div className="w-full max-w-[1200px] grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4">
                    {nosotrosConfig.igImages.map((src, i) => (
                        <div key={i} className="relative aspect-square bg-[#111] overflow-hidden group">
                            <Image
                                src={src}
                                alt={`Instagram post ${i + 1}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 33vw"
                            />
                            {/* IG Hover Layer */}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <svg className="w-8 h-8 text-[#E8E6E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>

                <a
                    href="https://instagram.com/boutiquelaguaca1"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-12 text-[12px] font-mono tracking-[0.2em] text-[#888] pb-1 border-b border-[#333] hover:text-[#E8E6E1] hover:border-[rgba(232,230,225,0.25)] transition-colors uppercase"
                >
                    IR AL PERFIL OFICIAL →
                </a>
            </section>

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
            `}</style>

        </div>
    )
}
