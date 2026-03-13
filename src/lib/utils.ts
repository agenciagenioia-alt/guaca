/**
 * Formatea un número como precio en COP (pesos colombianos)
 * Ejemplo: 85000 → "$85.000"
 */
export function formatCOP(amount: number | undefined | null): string {
    const n = Number(amount)
    if (!Number.isFinite(n)) return '$0'
    return '$' + n.toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
}

/**
 * Calcula el porcentaje de descuento entre precio original y actual
 * Ejemplo: calcDiscount(100000, 85000) → 15
 */
export function calcDiscount(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= 0) return 0
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
}

/**
 * Genera un slug a partir de un texto
 * Ejemplo: "Camiseta Oversize Negra" → "camiseta-oversize-negra"
 */
export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
}

/**
 * Formatea un número de teléfono colombiano para display
 * Ejemplo: "3012345678" → "301 234 5678"
 */
export function formatPhoneCO(phone: string): string {
    const digits = phone.replace(/\D/g, '')
    // Quitar el 57 si lo tiene
    const local = digits.startsWith('57') ? digits.slice(2) : digits
    if (local.length === 10) {
        return `${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`
    }
    return local
}

/**
 * Construye la URL de WhatsApp con mensaje pre-armado
 */
export function buildWhatsAppURL(phone: string, message: string): string {
    const cleanPhone = phone.replace(/\D/g, '')
    const fullPhone = cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`
    return `https://wa.me/${fullPhone}?text=${encodeURIComponent(message)}`
}

/**
 * Formatea fecha en formato colombiano
 * Ejemplo: "2024-01-15T10:30:00Z" → "15 de enero de 2024, 5:30 a.m."
 */
export function formatDateCO(dateStr: string): string {
    const date = new Date(dateStr)
    return date.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Bogota',
    })
}

/**
 * Calcula el stock total de un producto sumando todas las variantes
 */
export function getTotalStock(variants: { stock: number }[]): number {
    return variants.reduce((sum, v) => sum + v.stock, 0)
}

/**
 * Trunca texto con ellipsis
 */
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trimEnd() + '...'
}
