'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatCOP } from '@/lib/utils'
import { useCartStore } from '@/store/cart'
import { Lock, CreditCard, ChevronLeft } from 'lucide-react'
import WompiButton from '@/components/checkout/WompiButton'
import { trackAddShippingInfo, trackBeginCheckout } from '@/lib/analytics/ga'

// Hook para format celular 300 000 0000
const formatPhoneCol = (val: string) => {
    const cleaned = val.replace(/\D/g, '')
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (match) {
        return !match[2] ? match[1] : `${match[1]} ${match[2]}${match[3] ? ` ${match[3]}` : ''}`
    }
    return val
}

export default function CheckoutPage() {
    const router = useRouter()
    const { items = [], totalPrice } = useCartStore()
    const safeItems = Array.isArray(items) ? items : []

    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})
    const [wompiData, setWompiData] = useState<{
        orderNumber: string
        amountInCents: number
        signature: string
        publicKey: string
    } | null>(null)
    const [redirectUrl, setRedirectUrl] = useState('')
    const [checkoutTracked, setCheckoutTracked] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: ''
    })

    useEffect(() => {
        setMounted(true)
        if (typeof window !== 'undefined') {
            setRedirectUrl(`${window.location.origin}/confirmacion`)
            // Prefill desde localStorage (solo datos de envío, no items)
            const saved = window.localStorage.getItem('laguaca-checkout-info')
            if (saved) {
                try {
                    const parsed = JSON.parse(saved) as Partial<typeof formData>
                    setFormData(prev => ({
                        ...prev,
                        ...parsed,
                    }))
                } catch {
                    // ignore parse errors
                }
            }
        }
        if (safeItems.length === 0) {
            router.push('/catalogo')
        }
    }, [safeItems.length, router])

    useEffect(() => {
        if (!mounted || checkoutTracked || safeItems.length === 0) return
        const total = typeof totalPrice === 'function' ? totalPrice() : 0
        trackBeginCheckout({
            value: total,
            items: safeItems.map((item) => ({
                item_id: item.productId,
                item_name: item.productName,
                item_variant: item.size,
                price: item.unitPrice,
                quantity: item.quantity,
            })),
        })
        setCheckoutTracked(true)
    }, [mounted, checkoutTracked, safeItems, totalPrice])

    // Persistir datos básicos de envío en localStorage en cada cambio (siempre mismo número de hooks)
    useEffect(() => {
        if (!mounted) return
        if (typeof window === 'undefined') return
        const payload = {
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            address: formData.address,
            city: formData.city,
        }
        window.localStorage.setItem('laguaca-checkout-info', JSON.stringify(payload))
    }, [mounted, formData.name, formData.phone, formData.email, formData.address, formData.city])

    if (!mounted || safeItems.length === 0) return null

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value
        setFormData(prev => ({ ...prev, phone: formatPhoneCol(raw) }))
        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }))
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target
        setFormData(prev => ({ ...prev, [id]: value }))
        if (errors[id]) setErrors(prev => ({ ...prev, [id]: '' }))
    }

    const validateForm = () => {
        const newErrors: Record<string, string> = {}
        if (!formData.name.trim()) newErrors.name = 'Ingresa tu nombre completo'

        const phoneClean = formData.phone.replace(/\D/g, '')
        if (!phoneClean) newErrors.phone = 'Ingresa tu número de celular'
        else if (phoneClean.length !== 10) newErrors.phone = 'El celular debe tener 10 dígitos'
        else if (!phoneClean.startsWith('3')) newErrors.phone = 'El celular debe empezar por 3'

        if (!formData.address.trim()) newErrors.address = 'La dirección es obligatoria'
        if (!formData.city.trim()) newErrors.city = 'Ingresa tu ciudad'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            window.scrollTo({ top: 0, behavior: 'smooth' })
            return
        }

        setIsLoading(true)

        try {
            const total = typeof totalPrice === 'function' ? totalPrice() : 0
            trackAddShippingInfo({
                value: total,
                shipping_tier: 'envio nacional por coordinar',
                items: safeItems.map((item) => ({
                    item_id: item.productId,
                    item_name: item.productName,
                    item_variant: item.size,
                    price: item.unitPrice,
                    quantity: item.quantity,
                })),
            })
            const res = await fetch('/api/checkout/crear-orden', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: safeItems.map((item) => ({
                        productId: item.productId,
                        productName: item.productName,
                        productSlug: item.productSlug,
                        imageUrl: item.imageUrl,
                        size: item.size,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                    })),
                    customer: {
                        name: formData.name.trim(),
                        phone: formData.phone.replace(/\D/g, ''),
                        email: formData.email.trim() || undefined,
                        address: formData.address.trim(),
                        city: formData.city.trim(),
                        notes: formData.notes.trim() || undefined,
                    },
                    total,
                }),
            })

            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                setErrors({ form: data.error || 'Error creando la orden. Intenta de nuevo.' })
                setIsLoading(false)
                return
            }

            const data = await res.json()
            const pk = typeof data.publicKey === 'string' ? data.publicKey.trim() : ''
            if (!pk || pk === 'undefined') {
                setErrors({ form: 'No se recibió la llave de pago. En Vercel → Settings → Environment Variables añade NEXT_PUBLIC_WOMPI_PUBLIC_KEY con la llave de Wompi (pub_prod_ o pub_test_).' })
                setIsLoading(false)
                return
            }
            if (!pk.startsWith('pub_prod_') && !pk.startsWith('pub_test_')) {
                setErrors({ form: 'La llave de Wompi no es válida. Debe empezar por pub_prod_ o pub_test_. Revisa NEXT_PUBLIC_WOMPI_PUBLIC_KEY en Vercel.' })
                setIsLoading(false)
                return
            }
            setWompiData({
                orderNumber: data.orderNumber,
                amountInCents: data.amountInCents,
                signature: data.signature,
                publicKey: pk,
            })
            window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
        } catch (error) {
            console.error(error)
            setErrors({ form: 'Error de conexión. Intenta de nuevo.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="max-w-[1200px] mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_400px]">

                {/* LADO IZQUIERDO: FORMULARIO (60%) */}
                <div className="p-6 md:p-12 lg:pr-16 flex flex-col pt-8 md:pt-16">

                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-foreground-muted hover:text-foreground transition-colors mb-10 w-fit font-mono uppercase tracking-widest text-[12px]"
                    >
                        <ChevronLeft className="w-4 h-4" /> Volver al sitio
                    </button>

                    <h1 className="font-heading text-4xl md:text-5xl font-bold uppercase tracking-tight mb-2">Checkout</h1>
                    <p className="text-foreground-muted font-body text-[15px] mb-10">Completa tus datos para enviarte el pedido.</p>

                    {errors.form && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-mono">
                            {errors.form}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-10">

                        {/* SECCIÓN DATOS */}
                        <div className="flex flex-col gap-5 border border-border p-6 md:p-8 bg-surface">
                            <h2 className="font-heading text-xl uppercase tracking-widest text-foreground flex items-center gap-3">
                                01. Tus Datos
                            </h2>

                            <div className="flex flex-col gap-4 mt-2">
                                {/* Input Nombre */}
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="name" className="text-[11px] font-mono tracking-[0.2em] text-foreground-muted uppercase">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        autoComplete="name"
                                        className={`w-full bg-background border ${errors.name ? 'border-error' : 'border-border'} px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-foreground focus:bg-surface-hover transition-colors`}
                                    />
                                    {errors.name && <span className="text-[12px] text-error font-medium mt-1">{errors.name}</span>}
                                </div>

                                {/* Input Celular & Email */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="phone" className="text-[11px] font-mono tracking-[0.2em] text-foreground-muted uppercase">
                                            Celular (WhatsApp) *
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={handlePhoneChange}
                                            autoComplete="tel"
                                            placeholder="3XX XXX XXXX"
                                            maxLength={12}
                                            className={`w-full bg-background border ${errors.phone ? 'border-error' : 'border-border'} px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-foreground focus:bg-surface-hover transition-colors`}
                                        />
                                        {errors.phone && <span className="text-[12px] text-error font-medium mt-1">{errors.phone}</span>}
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="email" className="text-[11px] font-mono tracking-[0.2em] text-foreground-muted uppercase">
                                            Email <span className="text-foreground-subtle lowercase tracking-normal">(Opcional)</span>
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            autoComplete="email"
                                            className="w-full bg-background border border-border px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-foreground focus:bg-surface-hover transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECCIÓN DIRECCIÓN */}
                        <div className="flex flex-col gap-5 border border-border p-6 md:p-8 bg-surface">
                            <h2 className="font-heading text-xl uppercase tracking-widest text-foreground flex items-center gap-3">
                                02. Entrega
                            </h2>

                            <div className="flex flex-col gap-4 mt-2">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="address" className="text-[11px] font-mono tracking-[0.2em] text-foreground-muted uppercase">
                                        Dirección de Envío *
                                    </label>
                                    <textarea
                                        id="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        autoComplete="street-address"
                                        rows={2}
                                        placeholder="Ej: Calle 37 #1W-139, Edificio XYZ Ap 201"
                                        className={`w-full bg-background border ${errors.address ? 'border-error' : 'border-border'} px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-foreground focus:bg-surface-hover transition-colors resize-none`}
                                    />
                                    {errors.address && <span className="text-[12px] text-error font-medium mt-1">{errors.address}</span>}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="city" className="text-[11px] font-mono tracking-[0.2em] text-foreground-muted uppercase">
                                            Ciudad / Municipio *
                                        </label>
                                        <input
                                            type="text"
                                            id="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            autoComplete="address-level2"
                                            className={`w-full bg-background border ${errors.city ? 'border-error' : 'border-border'} px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-foreground focus:bg-surface-hover transition-colors`}
                                        />
                                        {errors.city && <span className="text-[12px] text-error font-medium mt-1">{errors.city}</span>}
                                    </div>
                                    <div className="flex flex-col gap-1.5">
                                        <label htmlFor="notes" className="text-[11px] font-mono tracking-[0.2em] text-foreground-muted uppercase">
                                            Notas adicionales <span className="text-foreground-subtle lowercase tracking-normal">(Opcional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="notes"
                                            value={formData.notes}
                                            onChange={handleChange}
                                            placeholder="Portería, dejar al vecino..."
                                            className="w-full bg-background border border-border px-4 py-3.5 text-[15px] text-foreground outline-none focus:border-foreground focus:bg-surface-hover transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* MOBILE: botón enviar o Wompi */}
                        <div className="block lg:hidden mt-4 pb-12">
                            {wompiData?.publicKey && redirectUrl ? (
                                <div className="pt-4 border-t border-border">
                                    <p className="text-[13px] text-foreground font-mono uppercase tracking-widest mb-4">
                                        Orden {wompiData.orderNumber} — Paga ahora
                                    </p>
                                    <WompiButton
                                        publicKey={wompiData.publicKey}
                                        amountInCents={wompiData.amountInCents}
                                        reference={wompiData.orderNumber}
                                        signature={wompiData.signature}
                                        customerEmail={formData.email.trim() || undefined}
                                        redirectUrl={redirectUrl}
                                    />
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full h-[60px] bg-foreground text-background font-heading tracking-widest uppercase font-bold text-[18px] hover:bg-black transition-all rounded-none flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                                Procesando...
                                            </span>
                                        ) : (
                                            <>
                                                PAGAR CON WOMPI
                                                <CreditCard className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-foreground-muted text-[11px] font-mono uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-2">
                                        <Lock className="w-3 h-3" /> Pago 100% seguro · Wompi
                                    </p>
                                </>
                            )}
                        </div>

                    </form>
                </div>

                {/* LADO DERECHO: RESUMEN (40% - Sticky en Desktop, Flotante top en Mobile) */}
                <div className="order-first lg:order-last bg-surface border-l border-border lg:min-h-screen">
                    <div className="sticky top-0 p-6 md:p-12 lg:pl-10 lg:pt-32">

                        <h3 className="font-heading text-2xl uppercase tracking-widest text-foreground mb-8">
                            Resumen
                        </h3>

                        <ul className="flex flex-col gap-4 mb-8">
                            {safeItems.map((item, idx) => {
                                const qty = Number(item?.quantity) || 1
                                const price = Number(item?.unitPrice) || 0
                                const name = String(item?.productName ?? 'Producto')
                                const size = String(item?.size ?? '')
                                const pid = String(item?.productId ?? idx)
                                const imgUrl = item?.imageUrl
                                return (
                                <li key={`${pid}-${size}`} className="flex gap-4 items-center">
                                    <div className="relative w-16 h-20 bg-background border border-border rounded-none shrink-0 border-l overflow-hidden">
                                        {imgUrl && typeof imgUrl === 'string' && imgUrl.startsWith('http') ? (
                                            <Image src={imgUrl} alt={name} fill className="object-cover" sizes="64px" unoptimized />
                                        ) : (
                                            <div className="absolute inset-0 bg-border flex items-center justify-center text-[10px] text-foreground-muted">IMG</div>
                                        )}
                                        <span className="absolute -top-2 -right-2 bg-foreground text-background w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                                            {qty}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-foreground text-[14px] font-bold line-clamp-1">{name}</p>
                                        <p className="text-[12px] text-foreground-muted mt-1 font-mono uppercase">{size}</p>
                                    </div>
                                    <p className="text-foreground font-mono font-bold text-[14px] shrink-0">
                                        {formatCOP(price * qty)}
                                    </p>
                                </li>
                                )
                            })}
                        </ul>

                        <div className="flex flex-col gap-4 border-t border-border pt-6">
                            <div className="flex justify-between items-center text-[13px] text-foreground-muted font-mono uppercase">
                                <span>Subtotal</span>
                                <span className="text-foreground">{formatCOP(typeof totalPrice === 'function' ? totalPrice() : 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-[13px] text-foreground-muted font-mono uppercase pb-6 border-b border-border">
                                <span>Envío</span>
                                <span className="text-foreground text-right border-border">Por coordinar<br /><span className="text-[10px] text-foreground-subtle">(Envío Nacional)</span></span>
                            </div>

                            <div className="flex justify-between items-center pt-2">
                                <span className="text-foreground font-heading tracking-widest text-xl uppercase">Total a pagar</span>
                                <span className="text-foreground font-bold text-2xl tracking-wide">{formatCOP(typeof totalPrice === 'function' ? totalPrice() : 0)}</span>
                            </div>
                        </div>

                        {/* DESKTOP CTA */}
                        <div className="hidden lg:block mt-10">
                            {wompiData?.publicKey && redirectUrl ? (
                                <div className="pt-4 border-t border-border">
                                    <p className="text-[13px] text-foreground font-mono uppercase tracking-widest mb-4">
                                        Orden {wompiData.orderNumber} — Paga ahora
                                    </p>
                                    <WompiButton
                                        publicKey={wompiData.publicKey}
                                        amountInCents={wompiData.amountInCents}
                                        reference={wompiData.orderNumber}
                                        signature={wompiData.signature}
                                        customerEmail={formData.email.trim() || undefined}
                                        redirectUrl={redirectUrl}
                                    />
                                </div>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handleSubmit(e as unknown as React.FormEvent)
                                        }}
                                        disabled={isLoading}
                                        className="w-full h-[60px] bg-foreground text-background font-heading tracking-widest uppercase font-bold text-[18px] hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed rounded-none"
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
                                                Procesando...
                                            </span>
                                        ) : (
                                            <>
                                                PAGAR CON WOMPI
                                                <CreditCard className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                    <p className="text-foreground-muted text-[11px] font-mono uppercase tracking-widest text-center mt-4 flex items-center justify-center gap-2">
                                        <Lock className="w-3 h-3" /> Pago 100% seguro · Wompi
                                    </p>
                                </>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}
