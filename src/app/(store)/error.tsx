'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      console.error('Store error:', error?.message)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-6">
        <h1 className="text-2xl font-heading font-bold uppercase tracking-tight text-foreground">
          Algo salió mal
        </h1>
        <p className="text-foreground-muted font-body">
          No pudimos cargar esta parte de la tienda. Prueba de nuevo o navega al catálogo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-foreground text-background font-heading font-bold uppercase tracking-widest text-sm hover:opacity-90 transition-opacity"
          >
            Reintentar
          </button>
          <Link
            href="/catalogo"
            className="px-6 py-3 border border-border text-foreground font-heading font-bold uppercase tracking-widest text-sm hover:bg-surface transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </div>
  )
}
