import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

const supabaseUrl = typeof process.env.NEXT_PUBLIC_SUPABASE_URL === 'string' ? process.env.NEXT_PUBLIC_SUPABASE_URL : ''
const supabaseAnonKey = typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'string' ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY : ''

export function createClient() {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están definidas.')
    }
    return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
