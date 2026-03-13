import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Admin: acceso solo con contraseña (cookie). URL /admin pública; solo entra quien tenga la contraseña.
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isLoginRoute = request.nextUrl.pathname === '/admin/login'
    const ADMIN_COOKIE_NAME = 'admin_session'
    const ADMIN_SALT = 'laguaca_admin_session'
    const adminCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value

    async function sha256Hex(text: string): Promise<string> {
        const data = new TextEncoder().encode(text)
        const hash = await crypto.subtle.digest('SHA-256', data)
        return Array.from(new Uint8Array(hash))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join('')
    }

    async function isAdminCookieValid(cookieValue: string | undefined): Promise<boolean> {
        const password = process.env.ADMIN_PASSWORD
        if (!password || !cookieValue) return false
        const expected = await sha256Hex(password + ADMIN_SALT)
        return cookieValue === expected
    }

    if (isAdminRoute && !isLoginRoute) {
        const valid = await isAdminCookieValid(adminCookie)
        if (!valid) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }
    }

    if (isLoginRoute && adminCookie) {
        const valid = await isAdminCookieValid(adminCookie)
        if (valid) {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }
    }

    await supabase.auth.getUser()

    return supabaseResponse
}
