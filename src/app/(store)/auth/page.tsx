'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

type Tab = 'login' | 'register'

export default function AuthPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') ?? '/mi-cuenta'

  const [tab, setTab] = useState<Tab>('login')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  const [regName, setRegName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('')

  const [forgotEmail, setForgotEmail] = useState('')

  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      })
      if (error) throw error
      router.push(returnTo)
      router.refresh()
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Credenciales incorrectas',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    if (regPassword !== regPasswordConfirm) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      return
    }
    if (regPassword.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: { full_name: regName.trim() },
        },
      })
      if (error) throw error
      setMessage({
        type: 'success',
        text: 'Cuenta creada. Revisa tu correo para confirmar (si está habilitado).',
      })
      router.push(returnTo)
      router.refresh()
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al crear la cuenta',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: `${window.location.origin}/auth?reset=1`,
      })
      if (error) throw error
      setResetSent(true)
    } catch (err: unknown) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error al enviar el correo',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#111110] text-[#E8E6E1] flex flex-col items-center justify-center p-6">
      <Link
        href="/"
        className="font-heading text-3xl tracking-wider text-[#E8E6E1] hover:text-[#E8E6E1] transition-colors mb-10"
      >
        LA GUACA
      </Link>

      <div className="w-full max-w-[400px] bg-[#111] border border-white/10 rounded-lg p-8">
        <div className="flex gap-4 border-b border-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`pb-3 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors ${
              tab === 'login' ? 'border-[rgba(232,230,225,0.25)] text-[#E8E6E1]' : 'border-transparent text-[#E8E6E1]/60 hover:text-[#E8E6E1]'
            }`}
          >
            Ingresar
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setMessage(null); }}
            className={`pb-3 text-sm font-medium uppercase tracking-wider border-b-2 transition-colors ${
              tab === 'register' ? 'border-[rgba(232,230,225,0.25)] text-[#E8E6E1]' : 'border-transparent text-[#E8E6E1]/60 hover:text-[#E8E6E1]'
            }`}
          >
            Registrarse
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded text-sm ${
              message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-green-500/10 text-green-400 border border-green-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        {tab === 'login' && !resetSent && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="login-password" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                id="login-password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E8E6E1] text-[#111110] font-bold uppercase tracking-wider rounded hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Entrar
            </button>
            <button
              type="button"
              onClick={() => setResetSent(true)}
              className="w-full text-center text-xs text-[#E8E6E1]/60 hover:text-[#E8E6E1] transition-colors"
            >
              Olvidé mi contraseña
            </button>
          </form>
        )}

        {tab === 'login' && resetSent && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-sm text-[#E8E6E1]/80">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div>
              <label htmlFor="forgot-email" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E8E6E1] text-[#111110] font-bold uppercase tracking-wider rounded hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Enviar enlace
            </button>
            <button
              type="button"
              onClick={() => { setResetSent(false); setMessage(null); }}
              className="w-full text-center text-xs text-[#E8E6E1]/60 hover:text-[#E8E6E1] transition-colors"
            >
              Volver a ingresar
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label htmlFor="reg-name" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Nombre completo
              </label>
              <input
                id="reg-name"
                type="text"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label htmlFor="reg-email" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Email
              </label>
              <input
                id="reg-email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label htmlFor="reg-password" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                id="reg-password"
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            <div>
              <label htmlFor="reg-password-confirm" className="block text-xs text-[#E8E6E1]/60 uppercase tracking-wider mb-2">
                Confirmar contraseña
              </label>
              <input
                id="reg-password-confirm"
                type="password"
                value={regPasswordConfirm}
                onChange={(e) => setRegPasswordConfirm(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded text-[#E8E6E1] placeholder:text-[#E8E6E1]/40 focus:border-[rgba(232,230,225,0.25)] outline-none"
                placeholder="Repite tu contraseña"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E8E6E1] text-[#111110] font-bold uppercase tracking-wider rounded hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Crear cuenta
            </button>
          </form>
        )}
      </div>

      <Link href="/" className="mt-8 text-sm text-[#E8E6E1]/50 hover:text-[#E8E6E1] transition-colors">
        ← Volver al inicio
      </Link>
    </div>
  )
}
