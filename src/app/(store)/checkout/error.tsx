'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Checkout error:', error?.message, error?.digest)
  }, [error])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <p className="text-foreground-muted text-sm mb-4">
        No se pudo cargar el checkout.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={reset}
          className="px-6 py-3 bg-foreground text-background font-heading font-bold uppercase tracking-widest text-sm"
        >
          Reintentar
        </button>
        <Link
          href="/catalogo"
          className="px-6 py-3 border border-border text-foreground font-heading font-bold uppercase tracking-widest text-sm"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
