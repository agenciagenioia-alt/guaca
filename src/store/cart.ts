'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    productId: string
    productName: string
    productSlug: string
    size: string
    quantity: number
    unitPrice: number
    imageUrl: string
}

interface CartState {
    items: CartItem[]
    isOpen: boolean
    addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
    removeItem: (productId: string, size: string) => void
    updateQuantity: (productId: string, size: string, newQty: number) => void
    clearCart: () => void
    openCart: () => void
    closeCart: () => void
    toggleCart: () => void
    totalItems: () => number
    totalPrice: () => number
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item, quantity = 1) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (i) => i.productId === item.productId && i.size === item.size
                    )

                    if (existingIndex >= 0) {
                        // Incrementar cantidad del item existente
                        const updated = [...state.items]
                        updated[existingIndex] = {
                            ...updated[existingIndex],
                            quantity: updated[existingIndex].quantity + quantity,
                        }
                        return { items: updated, isOpen: true }
                    }

                    // Agregar nuevo item
                    return {
                        items: [...state.items, { ...item, quantity }],
                        isOpen: true,
                    }
                })
            },

            removeItem: (productId, size) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.productId === productId && i.size === size)
                    ),
                }))
            },

            updateQuantity: (productId, size, newQty) => {
                if (newQty <= 0) {
                    get().removeItem(productId, size)
                    return
                }

                set((state) => ({
                    items: state.items.map((i) =>
                        i.productId === productId && i.size === size
                            ? { ...i, quantity: newQty }
                            : i
                    ),
                }))
            },

            clearCart: () => set({ items: [] }),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

            totalItems: () =>
                get().items.reduce((sum, item) => sum + item.quantity, 0),

            totalPrice: () =>
                get().items.reduce(
                    (sum, item) => sum + item.unitPrice * item.quantity,
                    0
                ),
        }),
        {
            name: 'laguaca-cart',
            // Solo persistir items, no el estado isOpen
            partialize: (state) => ({ items: state.items }),
        }
    )
)
