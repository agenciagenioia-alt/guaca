'use client'

import { MessageCircle } from 'lucide-react'
import { useState, useEffect } from 'react'

interface WhatsAppFloatProps {
    phone: string
}

export function WhatsAppFloat({ phone }: WhatsAppFloatProps) {
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 300) {
                setIsVisible(true)
            } else {
                setIsVisible(false)
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        // Check on mount
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const message = 'Hola! Vi su tienda La Guaca y tengo una pregunta'
    const cleanPhone = phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`
    const url = `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`
                fixed bottom-6 right-6 z-[90] flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-[0_0_20px_rgba(37,211,102,0.4)]
                transition-all duration-500 hover:scale-110 group
                ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
                md:hidden
                after:absolute after:inset-0 after:rounded-full after:border after:border-[#25D366] after:opacity-0 after:animate-[pulse-fast_2s_cubic-bezier(0.4,0,0.6,1)_infinite]
            `}
            aria-label="Enviar mensaje por WhatsApp a La Guaca"
            data-testid="whatsapp-float-btn"
        >
            <MessageCircle className="w-7 h-7 text-foreground" aria-hidden="true" />
        </a>
    )
}
