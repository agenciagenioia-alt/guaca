'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

interface Props {
  orderId: string
  currentStatus: string
  currentTrackingCode?: string | null
}

export function OrderStatusForm({ orderId, currentStatus, currentTrackingCode }: Props) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const status = (form.querySelector('[name="status"]') as HTMLSelectElement)?.value
    const tracking_code = (form.querySelector('[name="tracking_code"]') as HTMLInputElement)?.value?.trim() || undefined
    if (!status) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, tracking_code }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data?.error || 'Error al actualizar')
      } else {
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5">Estado actual</label>
        <select
          name="status"
          defaultValue={currentStatus}
          className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
        >
          <option value="pendiente">Pendiente (Sin pagar)</option>
          <option value="confirmado">Confirmado (Pagado)</option>
          <option value="preparando">Preparando (Empacando)</option>
          <option value="enviado">Enviado (En trayecto)</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Guía de envío (Opcional)</label>
        <input
          type="text"
          name="tracking_code"
          defaultValue={currentTrackingCode || ''}
          placeholder="Ej: Interrapidisimo - 123456789"
          className="w-full px-4 py-2 bg-background border border-border rounded-md text-foreground focus:border-[rgba(232,230,225,0.25)]"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-[#E8E6E1] hover:bg-[#E8E6E1]/90 text-background font-bold py-2.5 rounded-md transition-colors disabled:opacity-60"
      >
        {saving ? 'Guardando…' : 'Actualizar Pedido'}
      </button>
    </form>
  )
}
