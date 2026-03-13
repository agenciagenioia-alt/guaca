'use client'

import { X } from 'lucide-react'
import { useEffect } from 'react'

interface Props {
    isOpen: boolean
    onClose: () => void
}

export function SizeGuideModal({ isOpen, onClose }: Props) {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            // Evitar scroll de fondo
            document.body.style.overflow = 'hidden'
            window.addEventListener('keydown', handleEsc)
        }
        return () => {
            document.body.style.overflow = ''
            window.removeEventListener('keydown', handleEsc)
        }
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-background border border-border w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 drop-shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-border bg-surface">
                    <h3 className="font-heading text-xl text-foreground uppercase tracking-widest leading-none m-0 pt-1">
                        Guía de Tallas
                    </h3>
                    <button onClick={onClose} className="text-foreground-muted hover:text-foreground transition-colors p-1 bg-background hover:bg-surface transition-all/10 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-10">
                    {/* Guía de tallas — Ropa (superior) */}
                    <section>
                        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground-subtle mb-3">
                            Ropa (Camisetas / Hoodies) — Medidas en centímetros
                        </p>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border text-[11px] font-mono text-foreground-subtle uppercase tracking-[0.1em]">
                                    <th className="py-3 px-2 font-normal">Talla</th>
                                    <th className="py-3 px-2 font-normal">Pecho (cm)</th>
                                    <th className="py-3 px-2 font-normal">Largo (cm)</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] text-foreground-muted font-body">
                                {[
                                    { size: 'S', chest: '54', length: '70' },
                                    { size: 'M', chest: '56', length: '72' },
                                    { size: 'L', chest: '58', length: '74' },
                                    { size: 'XL', chest: '61', length: '76' }
                                ].map((row, i, arr) => (
                                    <tr key={row.size} className={i !== arr.length - 1 ? 'border-b border-border' : ''}>
                                        <td className="py-4 px-2 font-bold font-mono text-foreground text-base">{row.size}</td>
                                        <td className="py-4 px-2">{row.chest}</td>
                                        <td className="py-4 px-2">{row.length}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Guía de tallas — Calzado */}
                    <section>
                        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-foreground-subtle mb-3">
                            Calzado (Sandalias / Tenis) — Medida aproximada de pie
                        </p>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border text-[11px] font-mono text-foreground-subtle uppercase tracking-[0.1em]">
                                    <th className="py-3 px-2 font-normal">Talla</th>
                                    <th className="py-3 px-2 font-normal">Largo pie (cm)</th>
                                </tr>
                            </thead>
                            <tbody className="text-[14px] text-foreground-muted font-body">
                                {[
                                    { size: '37', foot: '23.5' },
                                    { size: '38', foot: '24.0' },
                                    { size: '39', foot: '24.5' },
                                    { size: '40', foot: '25.0' },
                                    { size: '41', foot: '25.5' },
                                    { size: '42', foot: '26.0' },
                                    { size: '43', foot: '26.5' },
                                    { size: '44', foot: '27.0' }
                                ].map((row, i, arr) => (
                                    <tr key={row.size} className={i !== arr.length - 1 ? 'border-b border-border' : ''}>
                                        <td className="py-3 px-2 font-bold font-mono text-foreground text-base">{row.size}</td>
                                        <td className="py-3 px-2">{row.foot}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <div className="p-4 bg-surface-hover border border-border text-[11px] font-mono text-foreground-subtle leading-relaxed uppercase tracking-wide">
                        * Las medidas son referenciales y pueden presentar ligeras variaciones entre modelos y marcas.
                        Para un mejor ajuste, mide una prenda o par de calzado que ya uses y compárala con esta guía.
                    </div>
                </div>
            </div>
        </div>
    )
}
