'use client'

import { useEffect, useRef, useState } from 'react'

interface WompiButtonProps {
  publicKey: string
  amountInCents: number
  reference: string
  signature: string
  customerEmail?: string
  redirectUrl: string
}

export default function WompiButton({
  publicKey,
  amountInCents,
  reference,
  signature,
  customerEmail,
  redirectUrl,
}: WompiButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Small delay to ensure DOM is fully painted before injecting widget
    const timer = setTimeout(() => {
      try {
        container.innerHTML = ''

        const form = document.createElement('form')

        const script = document.createElement('script')
        script.src = 'https://checkout.wompi.co/widget.js'
        script.setAttribute('data-render', 'button')
        script.setAttribute('data-public-key', publicKey)
        script.setAttribute('data-currency', 'COP')
        script.setAttribute('data-amount-in-cents', String(amountInCents))
        script.setAttribute('data-reference', reference)
        script.setAttribute('data-signature:integrity', signature)
        script.setAttribute('data-redirect-url', redirectUrl)
        if (customerEmail) {
          script.setAttribute('data-customer-data:email', customerEmail)
        }

        script.onload = () => setReady(true)
        script.onerror = () => setError(true)

        form.appendChild(script)
        container.appendChild(form)
      } catch (err) {
        console.error('WompiButton init error:', err)
        setError(true)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      if (container) container.innerHTML = ''
    }
  }, [publicKey, amountInCents, reference, signature, customerEmail, redirectUrl])

  if (error) {
    return (
      <div className="w-full text-center py-4 space-y-3">
        <p className="text-red-400 text-sm font-medium">No se pudo cargar el widget de pago.</p>
        <p className="text-foreground-muted text-xs max-w-sm mx-auto">
          Revisa que en Vercel (Variables de entorno) estén bien configuradas <strong>NEXT_PUBLIC_WOMPI_PUBLIC_KEY</strong> y <strong>WOMPI_INTEGRITY_KEY</strong> con las llaves que te da Wompi en Developers → Secrets for technical integration.
        </p>
        <button
          type="button"
          onClick={() => { setError(false); setReady(false) }}
          className="text-foreground underline text-sm hover:no-underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="w-full">
      {!ready && (
        <div className="flex items-center justify-center py-4 gap-2">
          <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          <span className="text-sm text-foreground-muted">Cargando pasarela de pago...</span>
        </div>
      )}
      <div ref={containerRef} className="w-full" />
      <p className="text-center text-xs text-foreground-muted mt-3">
        🔒 Pago 100% seguro · Powered by Wompi
      </p>
    </div>
  )
}
