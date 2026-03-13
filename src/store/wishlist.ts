import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface WishlistItem {
    id: string
    name: string
    slug: string
    price: number
    originalPrice?: number
    imageUrl: string
    addedAt: number
}

interface WishlistState {
    items: WishlistItem[]
    toggleItem: (item: Omit<WishlistItem, 'addedAt'>) => void
    removeItem: (id: string) => void
    isLiked: (id: string) => boolean
    clearWishlist: () => void
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],

            toggleItem: (item) => {
                const { items } = get()
                const exists = items.some((i) => i.id === item.id)

                if (exists) {
                    set({ items: items.filter((i) => i.id !== item.id) })
                } else {
                    set({ items: [...items, { ...item, addedAt: Date.now() }] })
                }
            },

            removeItem: (id) => {
                set((state) => ({
                    items: state.items.filter((i) => i.id !== id)
                }))
            },

            isLiked: (id) => {
                return get().items.some((i) => i.id === id)
            },

            clearWishlist: () => set({ items: [] })
        }),
        {
            name: 'guaca-wishlist-v1', // Key inside localStorage
            storage: createJSONStorage(() => localStorage),
        }
    )
)
