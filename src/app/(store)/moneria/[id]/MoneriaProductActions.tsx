'use client'

import { useState } from 'react'
import { useCartStore } from '@/store/cart'
import { useToastStore } from '@/store/toast'
import { Check, Lock, Truck, RefreshCcw } from 'lucide-react'
import type { MoneriaVariant } from '@/lib/moneria'

interface MoneriaProductActionsProps {
  product: {
    id: string
    name: string
    price: number
  }
  variants: MoneriaVariant[]
  imageUrl: string
}

const MONO = '"JetBrains Mono", "Fira Code", "Courier New", monospace'
const ACCENT = '#A69256'
const BG = '#0D0D0D'
const TEXT_MAIN = '#E8E6E1'
const TEXT_SEC = '#6B6B68'

export function MoneriaProductActions({ product, variants, imageUrl }: MoneriaProductActionsProps) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [added, setAdded] = useState(false)

  const { addItem } = useCartStore()
  const { addToast } = useToastStore()

  const allSoldOut = variants.every((v) => v.stock <= 0)

  const handleAdd = () => {
    if (!selectedSize) {
      setShake(true)
      setTimeout(() => setShake(false), 600)
      return
    }
    const variant = variants.find((v) => v.size === selectedSize)
    if (!variant || variant.stock <= 0) {
      addToast('Esa talla no está disponible')
      return
    }
    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: `moneria-${product.id}`,
      size: selectedSize,
      unitPrice: product.price,
      imageUrl,
    })
    setAdded(true)
    addToast('Agregado al carrito')
    if (navigator.vibrate) navigator.vibrate(10)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      {/* Tallas */}
      <div>
        <p style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: TEXT_SEC, marginBottom: 12 }}>
          Talla
        </p>
        {variants.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
              const outOfStock = v.stock <= 0
              const selected = selectedSize === v.size
              return (
                <button
                  key={v.size}
                  onClick={() => { if (!outOfStock) { setSelectedSize(v.size); setShake(false) } }}
                  disabled={outOfStock}
                  title={outOfStock ? 'Agotado' : `${v.size} — ${v.stock} unidades`}
                  style={{
                    minWidth: 52,
                    minHeight: 52,
                    fontFamily: MONO,
                    fontSize: 13,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    borderRadius: 0,
                    border: selected
                      ? `2px solid ${TEXT_MAIN}`
                      : outOfStock
                        ? `1px solid rgba(232,230,225,0.12)`
                        : `1px solid rgba(232,230,225,0.3)`,
                    background: selected ? TEXT_MAIN : 'transparent',
                    color: selected ? BG : outOfStock ? 'rgba(232,230,225,0.25)' : TEXT_MAIN,
                    textDecoration: outOfStock ? 'line-through' : 'none',
                    cursor: outOfStock ? 'not-allowed' : 'pointer',
                    transition: 'all 200ms ease',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '6px 12px',
                  }}
                >
                  <span>{v.size}</span>
                  {outOfStock && (
                    <span style={{ fontSize: 9, fontFamily: 'sans-serif', textTransform: 'none' }}>Agotado</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <p style={{ color: TEXT_SEC, fontSize: 13 }}>Talla única</p>
        )}

        {shake && (
          <p style={{ color: '#D93025', fontSize: 12, fontFamily: MONO, marginTop: 8 }}>
            ⚠ Selecciona una talla primero
          </p>
        )}
      </div>

      {/* Botón agregar al carrito */}
      <button
        onClick={handleAdd}
        disabled={allSoldOut}
        className={shake ? 'animate-shake' : ''}
        style={{
          width: '100%',
          height: 56,
          background: added ? '#1E8E3E' : allSoldOut ? 'rgba(232,230,225,0.2)' : TEXT_MAIN,
          color: added || allSoldOut ? TEXT_MAIN : BG,
          fontFamily: 'var(--font-space-grotesk, system-ui, sans-serif)',
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          borderRadius: 0,
          border: 'none',
          cursor: allSoldOut ? 'not-allowed' : 'pointer',
          transition: 'all 200ms ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        {added ? (
          <><Check className="w-4 h-4" /> AGREGADO</>
        ) : allSoldOut ? (
          'TODAS VENDIDAS'
        ) : (
          'AGREGAR AL CARRITO'
        )}
      </button>

      {/* Trust badges */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center">
        {[
          { icon: Lock, label: 'Pago seguro' },
          { icon: Truck, label: 'Envío a Colombia' },
          { icon: RefreshCcw, label: 'Cambios fáciles' },
        ].map(({ icon: Icon, label }) => (
          <span key={label} className="flex items-center gap-1.5" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: TEXT_SEC }}>
            <Icon className="w-3 h-3" /> {label}
          </span>
        ))}
      </div>

      <style jsx global>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%,60%{transform:translateX(-6px)}
          40%,80%{transform:translateX(6px)}
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
      `}</style>
    </div>
  )
}
