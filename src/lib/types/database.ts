// Tipos TypeScript alineados al schema de Supabase para La Guaca

export interface Category {
    id: string
    name: string
    slug: string
    image_url: string | null
    display_order: number
    is_active: boolean
    created_at: string
}

export interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    original_price: number | null
    category_id: string | null
    brand_id: string | null
    is_featured: boolean
    is_active: boolean
    low_stock_alert: number
    viewers_count: number
    materials_care: string | null
    created_at: string
    // Joins
    category?: Category
    variants?: ProductVariant[]
    images?: ProductImage[]
}

export interface Brand {
    id: string
    name: string
    description: string
    slug: string
    is_active: boolean
    display_order: number
    created_at: string
}

export interface ProductVariant {
    id: string
    product_id: string
    size: string
    stock: number
    display_order: number
}

export interface ProductImage {
    id: string
    product_id: string
    image_url: string
    is_primary: boolean
    display_order: number
}

export type OrderStatus =
    | 'pendiente'
    | 'confirmado'
    | 'preparando'
    | 'enviado'
    | 'entregado'
    | 'cancelado'

export interface Order {
    id: string
    order_number: string
    user_id: string | null
    customer_name: string
    customer_phone: string
    customer_email: string | null
    customer_address: string
    customer_city: string
    status: OrderStatus
    total: number
    wompi_reference: string | null
    notes: string | null
    created_at: string
    // Joins
    items?: OrderItem[]
}

export interface UserProfile {
    id: string
    full_name: string | null
    phone: string | null
    default_address: string | null
    default_city: string | null
    created_at: string
    updated_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    product_name: string
    size: string
    quantity: number
    unit_price: number
}

export interface StoreConfig {
    id: number
    store_name: string
    owner_whatsapp: string | null
    store_email: string | null
    store_description: string | null
    instagram_url: string | null
    tiktok_url: string | null
    wompi_payment_link: string | null
    wompi_public_key: string | null
    wompi_integrity_key: string | null
    wompi_events_key: string | null
    hero_video_url: string | null
    hero_image_url: string | null
    announcement_bar_text: string | null
    announcement_bar_active: boolean
    sold_out_message: string | null
    sold_out_whatsapp_message: string | null
    shipping_returns_text: string | null
    custom_cursor_enabled: boolean
}

export interface UserRole {
    uid: string
    role: 'admin' | 'customer'
}

// Tipo genérico para la base de datos de Supabase
export interface Database {
    public: {
        Tables: {
            categories: {
                Row: Category
                Insert: Omit<Category, 'id' | 'created_at'> & { id?: string; created_at?: string }
                Update: Partial<Omit<Category, 'id'>>
            }
            products: {
                Row: Product
                Insert: Omit<Product, 'id' | 'created_at' | 'category' | 'variants' | 'images'> & {
                    id?: string
                    created_at?: string
                }
                Update: Partial<Omit<Product, 'id' | 'category' | 'variants' | 'images'>>
            }
            product_variants: {
                Row: ProductVariant
                Insert: Omit<ProductVariant, 'id'> & { id?: string }
                Update: Partial<Omit<ProductVariant, 'id'>>
            }
            product_images: {
                Row: ProductImage
                Insert: Omit<ProductImage, 'id'> & { id?: string }
                Update: Partial<Omit<ProductImage, 'id'>>
            }
            orders: {
                Row: Order
                Insert: Omit<Order, 'id' | 'created_at' | 'order_number' | 'items'> & {
                    id?: string
                    created_at?: string
                    order_number?: string
                }
                Update: Partial<Omit<Order, 'id' | 'items'>>
            }
            order_items: {
                Row: OrderItem
                Insert: Omit<OrderItem, 'id'> & { id?: string }
                Update: Partial<Omit<OrderItem, 'id'>>
            }
            store_config: {
                Row: StoreConfig
                Insert: Partial<StoreConfig>
                Update: Partial<StoreConfig>
            }
            user_roles: {
                Row: UserRole
                Insert: UserRole
                Update: Partial<UserRole>
            }
            user_profiles: {
                Row: UserProfile
                Insert: Omit<UserProfile, 'created_at' | 'updated_at'> & {
                    created_at?: string
                    updated_at?: string
                }
                Update: Partial<Omit<UserProfile, 'id'>>
            }
        }
    }
}
