'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { useToastStore } from '@/store/toast'

interface Props {
  orderId: string
  orderNumber: string
}

export function DeleteOrderAction({ orderId, orderNumber }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)
  const router = useRouter()
  const addToast = useToastStore((s) => s.addToast)

    // Comienza el contador al abrir el modal
    useEffect(() => {
        if (isOpen) {
            setCountdown(2)
            let count = 2
            const interval = setInterval(() => {
                count -= 1
                if (count > 0) {
                    setCountdown(count)
                } else {
                    setCountdown(null)
                    clearInterval(interval)
                }
            }, 1000) // Cambiaría al delay de 1.5 a 2s.
            return () => clearInterval(interval)
        } else {
            setCountdown(null)
        }
    }, [isOpen])

    const confirmDelete = async () => {
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/orders/${orderId}`, { method: 'DELETE' })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                throw new Error(data?.error || 'Error al eliminar')
            }
            addToast('Pedido eliminado correctamente', 'success')
            setIsOpen(false)
            const tr = document.getElementById(`order-row-${orderId}`)
            if (tr) {
                tr.style.transition = 'opacity 300ms ease'
                tr.style.opacity = '0'
                setTimeout(() => {
                    tr.style.display = 'none'
                    router.refresh()
                }, 300)
            } else {
                router.refresh()
            }
        } catch (error) {
            console.error('Error eliminando pedido:', error)
            addToast(error instanceof Error ? error.message : 'No se pudo eliminar. Intenta de nuevo.', 'error')
        } finally {
            setIsDeleting(false)
            setIsOpen(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-foreground-muted hover:text-error hover:bg-error/10 rounded-md ml-2 flex-shrink-0"
                title="Eliminar pedido"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-surface border border-border rounded-xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="w-12 h-12 rounded-full bg-error/10 flex items-center justify-center">
                                <Trash2 className="w-6 h-6 text-error" />
                            </div>

                            <h3 className="text-xl font-bold text-[#E8E6E1]">¿Eliminar pedido {orderNumber}?</h3>

                            <p className="text-sm text-foreground-muted">
                                Esta acción no se puede deshacer. El pedido y todos sus productos serán eliminados permanentemente.
                            </p>

                            <div className="flex items-center gap-3 w-full pt-4">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 px-4 rounded-md border border-white/20 hover:bg-[#FFFFFF] hover:shadow-[0_0_24px_rgba(232,230,225,0.15)] transition-all/5 font-medium text-sm transition-colors text-[#E8E6E1]"
                                >
                                    Cancelar
                                </button>

                                {countdown !== null ? (
                                    <button
                                        disabled={true}
                                        className="flex-1 py-2.5 px-4 rounded-md bg-error/50 text-[#E8E6E1] font-medium text-sm cursor-not-allowed"
                                    >
                                        Eliminar ({countdown})...
                                    </button>
                                ) : (
                                    <button
                                        onClick={confirmDelete}
                                        disabled={isDeleting}
                                        className="flex-1 py-2.5 px-4 rounded-md bg-error hover:bg-red-600 text-[#E8E6E1] font-medium text-sm transition-colors disabled:opacity-50"
                                    >
                                        {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
