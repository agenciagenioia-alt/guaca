'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function AdminLoginPage() {
  const [user, setUser] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user.trim() || !password) {
      setError('Ingresa usuario y contraseña')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: user.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'Usuario o contraseña incorrectos')
        setLoading(false)
        return
      }
      router.push('/admin')
      router.refresh()
    } catch {
      setError('Error de conexión')
      setLoading(false)
    }
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface p-8 rounded-xl border border-border">
          {error && (
            <div className="bg-error/10 border border-error/50 text-error text-sm p-3 rounded-md" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="user">
              Usuario
            </label>
            <input
              id="user"
              name="user"
              type="text"
              required
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
              placeholder="Usuario o correo"
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)] transition-colors"
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#E8E6E1] text-background font-bold py-3 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-70"
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
