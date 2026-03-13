'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Package, ArrowRight, Loader2 } from 'lucide-react'
import { formatCOP } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { OrderStatusTimeline } from '@/components/order/OrderStatusTimeline'

// Definimos los tipos de retorno
type OrderItem = {
    id: string
    product_name: string
    size: string
    quantity: number
    unit_price: number
    products: {
        name: string
        product_images: { image_url: string; is_primary: boolean }[]
    } | null
}

type Order = {
    id: string
    order_number: string
    created_at: string
    total: number
    status: string
    customer_phone: string
    customer_city: string
    order_items: OrderItem[]
}

const statusConfig: Record<string, { label: string, color: string, badge: string }> = {
    pendiente: { label: "Tu pedido fue recibido y está siendo revisado", color: "text-warning", badge: "bg-warning/10 border-warning/20 text-warning" },
    confirmado: { label: "¡Pedido confirmado! Lo estamos preparando", color: "text-info", badge: "bg-info/10 border-info/20 text-info" },
    preparando: { label: "Estamos alistando tu pedido con cuidado", color: "text-amber-500", badge: "bg-amber-500/10 border-amber-500/20 text-amber-500" },
    enviado: { label: "¡Ya va en camino! Pronto llegará a ti", color: "text-success", badge: "bg-success/10 border-success/20 text-success" },
    entregado: { label: "¡Pedido entregado! Gracias por comprar en La Guaca", color: "text-success", badge: "bg-success/10 border-success/20 text-success" },
    cancelado: { label: "Este pedido fue cancelado. Escríbenos si tienes dudas", color: "text-error", badge: "bg-error/10 border-error/20 text-error" }
}

export default function MisPedidosPage() {
    const [searchTerm, setSearchTerm] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [hasSearched, setHasSearched] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setErrorMsg('')
        setHasSearched(false)
        setOrders([])

        const term = searchTerm.trim()
        const isPhone = /^\d{10}$/.test(term)
        const isOrderNumber = term.toUpperCase().startsWith('LG-')

        if (!isPhone && !isOrderNumber) {
            setErrorMsg('Ingresa un celular (10 dígitos) o número de pedido (LG-) válido')
            setIsLoading(false)
            return
        }

        const supabase = createClient()
        let query = supabase
            .from('orders')
            .select(`*, order_items(*, products(name, product_images(*)))`)

        if (isPhone) {
            query = query.eq('customer_phone', term).order('created_at', { ascending: false })
        } else {
            query = query.eq('order_number', term.toUpperCase())
        }

        const { data, error } = await query

        if (error || !data) {
            setErrorMsg('Hubo un error al buscar, intenta de nuevo.')
        } else {
            setOrders(data as unknown as Order[]) // Force type since supabase nested relationships are weakly typed without full gen
            setHasSearched(true)
        }

        setIsLoading(false)
    }

    // Actualización en tiempo real: cuando el admin cambia el estado, se actualiza aquí sin refrescar
    useEffect(() => {
        if (orders.length === 0) return
        const supabase = createClient()
        const channel = supabase
            .channel('mis-pedidos-updates')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload) => {
                    const updated = payload.new as Record<string, unknown>
                    const id = updated?.id as string | undefined
                    if (!id) return
                    setOrders((prev) =>
                        prev.map((o) =>
                            o.id === id
                                ? { ...o, status: (updated.status as string) ?? o.status }
                                : o
                        )
                    )
                }
            )
            .subscribe()
        return () => {
            supabase.removeChannel(channel)
        }
    }, [orders.length])

    const maskPhone = (phone: string) => {
        if (phone.length < 10) return phone
        return `${phone.substring(0, 3)}●●●●${phone.substring(phone.length - 3)}`
    }

    return (
        <main className="min-h-[85vh] bg-background">
            {/* Header Mis Pedidos */}
            <section className="pt-24 pb-12 px-6 border-b border-white/5 text-center bg-surface">
                <h1 className="font-heading font-bold text-[clamp(48px,10vw,96px)] text-[#E8E6E1] m-0 tracking-tight leading-none">
                    MIS PEDIDOS
                </h1>
                <p className="text-foreground-muted text-sm md:text-base mt-4 max-w-lg mx-auto">
                    Ingresa tu celular o número de pedido para ver el estado de tu compra
                </p>
            </section>

            {/* Contenido */}
            <section className="max-w-3xl mx-auto px-6 py-12">
                {/* Formulario */}
                <form onSubmit={handleSearch} className="mb-12 relative">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-foreground-muted" />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Ej: 3001234567 o LG-2026-0001"
                                className="w-full pl-11 pr-4 py-4 bg-surface border border-border text-[#E8E6E1] text-base focus:border-[rgba(232,230,225,0.25)] focus:ring-1 focus:ring-gold outline-none transition-all placeholder:text-foreground-muted"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || !searchTerm.trim()}
                            className="bg-[#E8E6E1] text-[#111110] font-bold font-heading tracking-widest px-8 py-4 hover:bg-[#E8E6E1]-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'BUSCAR'}
                        </button>
                    </div>
                    {errorMsg && (
                        <p className="text-error text-sm mt-3 animate-in fade-in">{errorMsg}</p>
                    )}
                </form>

                {/* Resultados */}
                {hasSearched && !isLoading && (
                    <div className="space-y-6">
                        {orders.length === 0 ? (
                            <div className="text-center py-16 bg-surface border border-dashed border-white/10 rounded-xl">
                                <Package className="w-12 h-12 text-[#E8E6E1]/20 mx-auto mb-4" />
                                <h3 className="text-lg font-bold text-[#E8E6E1] mb-2">No encontramos pedidos</h3>
                                <p className="text-foreground-muted text-sm max-w-sm mx-auto mb-6">
                                    Verifica que el celular o número de pedido coincida exactamente con los datos de tu compra.
                                </p>
                                <Link
                                    href="https://wa.me/573001234567"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#E8E6E1] text-sm font-bold hover:text-[#E8E6E1] transition-colors"
                                >
                                    ¿Necesitas ayuda? Escríbenos por WhatsApp <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>
                        ) : (
                            orders.map((order) => {
                                const config = statusConfig[order.status?.toLowerCase()] || statusConfig['pendiente']
                                const orderDate = new Date(order.created_at).toLocaleDateString('es-CO', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })

                                return (
                                    <div key={order.id} className="bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                                        {/* Header Card */}
                                        <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div>
                                                <h2 className="font-heading text-2xl tracking-wider text-[#E8E6E1]">PEDIDO #{order.order_number}</h2>
                                                <p className="text-sm text-foreground-muted mt-1">{orderDate} · {formatCOP(order.total)}</p>
                                            </div>
                                            <span className={`px-3 py-1 text-[11px] font-bold tracking-wider uppercase border rounded-full self-start sm:self-auto ${config.badge}`}>
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Timeline de estado */}
                                        <div className="px-6 py-4 bg-white/[0.02] border-b border-white/5">
                                            <OrderStatusTimeline status={order.status} />
                                        </div>
                                        <div className="px-6 py-2 border-b border-white/5">
                                            <p className={`text-sm font-medium ${config.color}`}>
                                                {config.label}
                                            </p>
                                        </div>

                                        {/* Items */}
                                        <div className="p-6 border-b border-white/5 space-y-4">
                                            {order.order_items?.map((item, idx) => {
                                                const productImage = item.products?.product_images?.find(img => img.is_primary)?.image_url
                                                    || item.products?.product_images?.[0]?.image_url
                                                    || 'https://picsum.photos/seed/placeholder/100/100'

                                                return (
                                                    <div key={idx} className="flex items-center gap-4">
                                                        <div className="w-16 h-16 bg-white/5 shrink-0 overflow-hidden rounded relative">
                                                            <Image
                                                                src={productImage}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-[#E8E6E1]">{item.product_name}</p>
                                                            <p className="text-xs text-foreground-muted mt-0.5">
                                                                Talla {item.size} <span className="mx-1">•</span> Cantidad: {item.quantity}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>

                                        {/* Footer Privacidad Info */}
                                        <div className="p-6 bg-black/20 text-sm text-foreground-muted flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">📍</span>
                                                <span>Entrega: {order.customer_city}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">📱</span>
                                                <span>Contacto: {maskPhone(order.customer_phone)}</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}
            </section>
        </main>
    )
}
