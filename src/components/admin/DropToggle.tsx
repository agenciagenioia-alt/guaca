'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { revalidateStore } from '@/app/admin/actions'
import { Star } from 'lucide-react'

interface DropToggleProps {
  productId: string
  initialFeatured: boolean
}

export function DropToggle({ productId, initialFeatured }: DropToggleProps) {
  const [featured, setFeatured] = useState(initialFeatured)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    const supabase = createClient() as any
    const newVal = !featured
    const { error } = await supabase
      .from('products')
      .update({ is_featured: newVal })
      .eq('id', productId)

    if (!error) {
      setFeatured(newVal)
      await revalidateStore('product')
    }
    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`p-1.5 rounded-md transition-all duration-200 ${
        featured
          ? 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
          : 'text-foreground-muted/40 hover:text-foreground-muted hover:bg-surface-hover'
      } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
      title={featured ? 'Quitar de Nuevos Drops' : 'Agregar a Nuevos Drops'}
    >
      <Star className={`w-4 h-4 ${featured ? 'fill-amber-400' : ''}`} />
    </button>
  )
}
