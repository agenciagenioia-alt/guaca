'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateStore } from '@/app/admin/actions'
import { Trash2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Props {
  productId: string
  productName: string
}

export function ProductDeleteButton({ productId, productName }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`¿Estás seguro de eliminar "${productName}"? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    const supabase = createClient() as any

    // Delete related rows first
    await supabase.from('product_images').delete().eq('product_id', productId)
    await supabase.from('product_variants').delete().eq('product_id', productId)
    const { error } = await supabase.from('products').delete().eq('id', productId)

    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      await revalidateStore('product')
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-2 text-foreground-muted hover:text-red-400 transition-colors disabled:opacity-50"
      title="Eliminar producto"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
    </button>
  )
}
