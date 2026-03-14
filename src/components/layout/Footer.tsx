'use client'

import Link from 'next/link'
import { Instagram, MapPin, MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useToastStore } from '@/store/toast'

interface FooterProps {
    instagramUrl?: string | null
    tiktokUrl?: string | null
    whatsappUrl?: string | null
}

export function Footer({ instagramUrl, tiktokUrl, whatsappUrl }: FooterProps) {
    const { addToast } = useToastStore()
    const [clicks, setClicks] = useState(0)

    const handleLogoClick = () => {
        const newClicks = clicks + 1
        setClicks(newClicks)

        if (newClicks === 5) {
            addToast('EASTER EGG UNLOCKED 🥚 — Has encontrado el secreto de La Guaca. Mantente real.', 'success')
            setClicks(0) // reset
        }
    }

    return (
        <footer className="bg-background border-t border-border" role="contentinfo">
            <div className="max-w-[1400px] mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3">

                    {/* Brand / Col 1 */}
                    <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-border flex flex-col justify-between min-h-[300px]">
                        <div>
                            <button
                                onClick={handleLogoClick}
                                className="font-heading text-5xl md:text-6xl tracking-widest text-foreground hover:text-foreground-muted transition-colors text-left"
                            >
                                LA GUACA
                            </button>
                            <p className="font-mono text-xs text-foreground-muted tracking-widest mt-4 uppercase max-w-[250px] leading-relaxed">
                                No competimos.
                                <br />Dictamos las reglas.
                            </p>
                        </div>
                        <div className="mt-12 flex flex-col gap-2">
                            <a
                                href="https://www.google.com/maps/place/Boutique+La+Guaca/@8.765563,-75.8913527,17z/data=!3m1!4b1!4m6!3m5!1s0x8e5a2fa31ed2fe69:0x73d8ddf89702bd2f!8m2!3d8.7655577!4d-75.8864818!16s%2Fg%2F11h_6pp3x1?entry=ttu"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 font-mono text-[10px] text-foreground-subtle tracking-[0.2em] uppercase hover:text-foreground transition-colors w-fit"
                                aria-label="Ver Boutique La Guaca en Google Maps"
                            >
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>Ver en Google Maps</span>
                            </a>
                            <p className="flex items-center gap-2 font-mono text-[10px] text-foreground-subtle/80 tracking-[0.2em] uppercase">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>8°45'36"N 75°53'08"W</span>
                            </p>
                        </div>
                    </div>

                    {/* Navigation / Col 2 */}
                    <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-border flex flex-col min-h-[300px]">
                        <h2 className="font-mono text-[10px] font-semibold text-foreground-subtle mb-8 uppercase tracking-[0.3em]">
                            Navegación
                        </h2>
                        <ul className="flex flex-col gap-6">
                            <li>
                                <Link href="/catalogo" className="font-display text-2xl md:text-3xl text-foreground hover:text-foreground-muted transition-colors uppercase tracking-wider">
                                    Catálogo
                                </Link>
                            </li>
                            <li>
                                <Link href="/nosotros" className="font-display text-2xl md:text-3xl text-foreground-muted hover:text-foreground transition-colors uppercase tracking-wider">
                                    Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link href="/carrito" className="font-display text-2xl md:text-3xl text-foreground-muted hover:text-foreground transition-colors uppercase tracking-wider">
                                    Carrito
                                </Link>
                            </li>
                            <li>
                                <Link href="/mis-pedidos" className="font-display text-2xl md:text-3xl text-foreground hover:text-foreground-muted transition-colors uppercase tracking-wider">
                                    Rastrear mi pedido
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social & Legal / Col 3 */}
                    <div className="p-8 md:p-12 flex flex-col justify-between min-h-[300px]">
                        <div>
                            <h2 className="font-mono text-[10px] font-semibold text-foreground-subtle mb-8 uppercase tracking-[0.3em]">
                                Conexión
                            </h2>
                            <div className="flex items-center gap-4">
                                {instagramUrl && (
                                    <a
                                        href={instagramUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex flex-col gap-2 border border-border bg-surface hover:bg-foreground hover:border-foreground hover:text-background text-foreground p-4 transition-all duration-300 w-full"
                                        aria-label="Seguir a La Guaca en Instagram"
                                    >
                                        <Instagram className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
                                        <span className="font-mono text-[10px] tracking-widest uppercase">Instagram</span>
                                    </a>
                                )}
                                <a
                                    href={whatsappUrl || 'https://wa.me/573001234567'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex flex-col gap-2 border border-border bg-surface hover:bg-foreground hover:border-foreground hover:text-background text-foreground p-4 transition-all duration-300 w-full"
                                    aria-label="Escribir a La Guaca por WhatsApp"
                                >
                                    <MessageCircle className="w-5 h-5 mb-2 group-hover:scale-110 transition-transform" />
                                    <span className="font-mono text-[10px] tracking-widest uppercase">WhatsApp</span>
                                </a>
                            </div>
                        </div>

                        <div className="mt-12 flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                <Link href="/politica-de-privacidad" className="font-mono text-[10px] text-foreground-subtle tracking-widest uppercase hover:text-foreground transition-colors">
                                    Política de privacidad
                                </Link>
                            </div>
                            <p className="font-mono text-[10px] text-foreground-subtle tracking-widest uppercase">
                                © {new Date().getFullYear()} La Guaca.
                            </p>
                            <p className="font-mono text-[10px] text-foreground-subtle tracking-widest uppercase">
                                Montería, Colombia. Todos los derechos reservados.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </footer>
    )
}
