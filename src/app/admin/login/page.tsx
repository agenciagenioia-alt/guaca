'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const router = useRouter()

  // Leer error de la URL si el servidor redirigió con parámetros
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const error = localError || searchParams.get('error')

  // Cuando el form se envíe, simplemente mostramos el loading
  // La acción real sucederá en action="/auth/login" natively
  const handleSubmit = () => {
    setLoading(true)
  }

  const handleResetPassword = async () => {
    if (!email) {
      setLocalError('Por favor, ingresa tu correo primero.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })

    if (resetError) {
      setLocalError('Error al enviar el correo de recuperación.')
    } else {
      setLocalError('Correo de recuperación enviado. Revisa tu bandeja de entrada.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="font-display text-4xl tracking-wider text-foreground">
            LA GUACA
          </h1>
          <p className="mt-2 text-sm text-foreground-muted">
            Panel de Administración
          </p>
        </div>

        <form action="/auth/login" method="POST" onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-xl border border-border">
          {error && (
            <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-md" role="alert">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" htmlFor="email">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="admin@laguaca.co"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium" htmlFor="password">
                  Contraseña
                </label>
                <button
                  type="button"
                  className="text-xs text-foreground-muted hover:text-[#E8E6E1] transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8E6E1] text-background font-bold py-3 rounded-md hover:bg-[#E8E6E1]-hover transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ingresando...
              </>
            ) : (
              'Ingresar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
