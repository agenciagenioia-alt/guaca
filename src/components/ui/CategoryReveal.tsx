'use client'
import { useEffect, useState } from 'react'

interface Props {
    categoryName: string
}

export default function CategoryReveal({ categoryName }: Props) {
    const [phase, setPhase] = useState<'visible' | 'splitting' | 'gone'>('visible')

    useEffect(() => {
        // Fase 1: cortina visible con nombre de categoría (0-400ms)
        const t1 = setTimeout(() => setPhase('splitting'), 400)
        // Fase 2: cortina se abre (400-900ms)  
        const t2 = setTimeout(() => setPhase('gone'), 900)
        return () => { clearTimeout(t1); clearTimeout(t2) }
    }, [])

    if (phase === 'gone') return null

    return (
        <>
            {/* Mitad superior */}
            <div style={{
                position: 'fixed',
                top: 0, left: 0, right: 0,
                height: '50vh',
                background: '#111110',
                zIndex: 9000,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                paddingBottom: 8,
                transform: phase === 'splitting' ? 'translateY(-100%)' : 'translateY(0)',
                transition: phase === 'splitting'
                    ? 'transform 500ms cubic-bezier(0.76, 0, 0.24, 1)'
                    : 'none',
            }}>
                {/* El nombre de la categoría solo visible en la mitad superior */}
                {phase === 'visible' && (
                    <h2 style={{
                        fontFamily: 'Bebas Neue, sans-serif',
                        fontSize: 'clamp(64px, 15vw, 140px)',
                        color: '#FFFFFF',
                        margin: 0,
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                        WebkitTextStroke: '1px rgba(255,255,255,0.3)',
                        opacity: 0,
                        animation: 'fadeInUp 200ms ease forwards',
                    }}>
                        {categoryName}
                    </h2>
                )}
            </div>

            {/* Mitad inferior */}
            <div style={{
                position: 'fixed',
                bottom: 0, left: 0, right: 0,
                height: '50vh',
                background: '#111110',
                zIndex: 9000,
                transform: phase === 'splitting' ? 'translateY(100%)' : 'translateY(0)',
                transition: phase === 'splitting'
                    ? 'transform 500ms cubic-bezier(0.76, 0, 0.24, 1)'
                    : 'none',
            }}>
                {/* Línea dorada en el centro de la pantalla (borde inferior de mitad superior) */}
                <div style={{
                    position: 'absolute',
                    top: 0, left: '10%', right: '10%',
                    height: 1,
                    background: 'linear-gradient(90deg, transparent, var(--foreground), transparent)',
                }} />
            </div>

            <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </>
    )
}
