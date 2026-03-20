'use client'

type GAItem = {
  item_id: string
  item_name: string
  item_brand?: string
  item_category?: string
  item_variant?: string
  price: number
  quantity?: number
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

function sendEvent(eventName: string, params: Record<string, unknown>) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', eventName, params)
}

export function trackViewItem(input: {
  currency?: string
  value: number
  item: GAItem
}) {
  sendEvent('view_item', {
    currency: input.currency ?? 'COP',
    value: input.value,
    items: [input.item],
  })
}

export function trackAddToCart(input: {
  currency?: string
  value: number
  item: GAItem
}) {
  sendEvent('add_to_cart', {
    currency: input.currency ?? 'COP',
    value: input.value,
    items: [{ ...input.item, quantity: input.item.quantity ?? 1 }],
  })
}

export function trackBeginCheckout(input: {
  currency?: string
  value: number
  items: GAItem[]
}) {
  sendEvent('begin_checkout', {
    currency: input.currency ?? 'COP',
    value: input.value,
    items: input.items,
  })
}

export function trackViewItemList(input: {
  item_list_name?: string
  item_list_id?: string
  items: GAItem[]
}) {
  sendEvent('view_item_list', {
    item_list_name: input.item_list_name ?? 'catalogo',
    item_list_id: input.item_list_id ?? 'catalogo',
    items: input.items,
  })
}

export function trackSelectItem(input: {
  item_list_name?: string
  item_list_id?: string
  item: GAItem
}) {
  sendEvent('select_item', {
    item_list_name: input.item_list_name ?? 'catalogo',
    item_list_id: input.item_list_id ?? 'catalogo',
    items: [input.item],
  })
}

export function trackRemoveFromCart(input: {
  currency?: string
  value: number
  item: GAItem
}) {
  sendEvent('remove_from_cart', {
    currency: input.currency ?? 'COP',
    value: input.value,
    items: [{ ...input.item, quantity: input.item.quantity ?? 1 }],
  })
}

export function trackAddShippingInfo(input: {
  currency?: string
  value: number
  shipping_tier?: string
  items: GAItem[]
}) {
  sendEvent('add_shipping_info', {
    currency: input.currency ?? 'COP',
    value: input.value,
    shipping_tier: input.shipping_tier ?? 'envio nacional',
    items: input.items,
  })
}

export function trackPurchase(input: {
  currency?: string
  transaction_id: string
  value: number
  items: GAItem[]
}) {
  sendEvent('purchase', {
    transaction_id: input.transaction_id,
    currency: input.currency ?? 'COP',
    value: input.value,
    items: input.items,
  })
}
