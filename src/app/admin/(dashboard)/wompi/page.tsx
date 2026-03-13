'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateStore } from '@/app/admin/actions'
import { Loader2, Copy, Check, ExternalLink } from 'lucide-react'
import { useToastStore } from '@/store/toast'

export default function AdminWompiPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [form, setForm] = useState({
    wompi_public_key: '',
    wompi_integrity_key: '',
    wompi_events_key: '',
  })
  const addToast = useToastStore((s) => s.addToast)

  const appUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const redirectUrl = `${appUrl}/confirmacion`
  const webhookUrl = `${appUrl}/api/wompi/webhook`
  const isConfigured = Boolean(form.wompi_public_key?.trim())

  useEffect(() => {
    const supabase = createClient() as any
    supabase
      .from('store_config')
      .select('wompi_public_key, wompi_integrity_key, wompi_events_key')
      .eq('id', 1)
      .single()
      .then(({ data }: any) => {
        if (data) {
          const d = data as any;
          setForm({
            wompi_public_key: d.wompi_public_key ?? '',
            wompi_integrity_key: d.wompi_integrity_key ?? '',
            wompi_events_key: d.wompi_events_key ?? '',
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient() as any
    const { error } = await supabase
      .from('store_config')
      .update({
        wompi_public_key: form.wompi_public_key.trim() || null,
        wompi_integrity_key: form.wompi_integrity_key.trim() || null,
        wompi_events_key: form.wompi_events_key.trim() || null,
      })
      .eq('id', 1)

    if (error) {
      console.error('Wompi save error:', error)
      addToast(`Error: ${error.message || error.code || 'Desconocido'} — ${error.details || ''}`, 'error')
    } else {
      await revalidateStore('config')
      addToast('Configuración de Wompi guardada', 'success')
    }
    setSaving(false)
  }

  const copyToClipboard = (value: string, label: string) => {
    window.navigator.clipboard.writeText(value)
    setCopied(label)
    addToast('Copiado al portapapeles', 'success')
    setTimeout(() => setCopied(null), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E8E6E1]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading">Wompi</h1>
        <p className="text-sm text-foreground-muted">
          Configura las llaves de pago. Puedes obtenerlas en el dashboard de Wompi.
        </p>
      </div>

      {/* Estado de conexión */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Estado</h2>
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex w-3 h-3 rounded-full ${
              isConfigured ? 'bg-success' : 'bg-foreground-muted'
            }`}
          />
          <span className="font-medium">
            {isConfigured ? 'CONECTADO' : 'NO CONFIGURADO'}
          </span>
        </div>
        {!isConfigured && (
          <p className="text-sm text-foreground-muted mt-2">
            Completa la llave pública para habilitar pagos.
          </p>
        )}
      </div>

      {/* Formulario de llaves */}
      <form onSubmit={handleSave} className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">Llaves de integración</h2>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Llave pública <span className="text-foreground-muted">(pub_prod_...)</span>
          </label>
          <input
            type="text"
            value={form.wompi_public_key}
            onChange={(e) => setForm((f) => ({ ...f, wompi_public_key: e.target.value }))}
            placeholder="pub_prod_xxxxxxxx"
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-foreground-muted focus:border-[rgba(232,230,225,0.25)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Llave de integridad
          </label>
          <input
            type="password"
            value={form.wompi_integrity_key}
            onChange={(e) => setForm((f) => ({ ...f, wompi_integrity_key: e.target.value }))}
            placeholder="prod_integrity_..."
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-foreground-muted focus:border-[rgba(232,230,225,0.25)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Llave de eventos <span className="text-foreground-muted">(webhooks)</span>
          </label>
          <input
            type="password"
            value={form.wompi_events_key}
            onChange={(e) => setForm((f) => ({ ...f, wompi_events_key: e.target.value }))}
            placeholder="Llave para verificar webhooks"
            className="w-full px-4 py-3 bg-background border border-border rounded-md text-foreground placeholder:text-foreground-muted focus:border-[rgba(232,230,225,0.25)] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-[#E8E6E1] text-background font-bold px-6 py-3 rounded-md hover:bg-[#E8E6E1]-hover transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Guardar configuración
        </button>
      </form>

      {/* URLs de solo lectura */}
      <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-lg font-semibold text-foreground">URLs (solo lectura)</h2>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            URL de redirección (después del pago)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={redirectUrl}
              className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-md text-foreground-muted text-sm"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(redirectUrl, 'redirect')}
              className="p-3 border border-border rounded-md text-foreground-muted hover:text-foreground hover:border-[rgba(232,230,225,0.25)] transition-colors"
              title="Copiar"
            >
              {copied === 'redirect' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground-muted mb-2">
            URL del webhook (configurar en dashboard de Wompi)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={webhookUrl}
              className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-md text-foreground-muted text-sm"
            />
            <button
              type="button"
              onClick={() => copyToClipboard(webhookUrl, 'webhook')}
              className="p-3 border border-border rounded-md text-foreground-muted hover:text-foreground hover:border-[rgba(232,230,225,0.25)] transition-colors"
              title="Copiar"
            >
              {copied === 'webhook' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Pago de prueba */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Pago de prueba</h2>
        <p className="text-sm text-foreground-muted mb-4">
          Abre la tienda, agrega un producto al carrito y completa el checkout para probar el flujo con Wompi.
        </p>
        <a
          href="/catalogo"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-[#E8E6E1] text-background font-bold px-4 py-2 rounded-md hover:bg-[#E8E6E1]-hover transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir tienda para pago de prueba
        </a>
      </div>
    </div>
  )
}
