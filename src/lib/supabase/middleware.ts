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

    const {
        data: { user },
        error: userError
    } = await supabase.auth.getUser()

    // Proteger rutas /admin (excepto /admin/login)
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    const isLoginRoute = request.nextUrl.pathname === '/admin/login'

    if (isAdminRoute && !isLoginRoute) {
        if (!user) {
            console.log('[Middleware] No user found, redirecting to login. Error:', userError?.message);
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }

        // Verificar rol admin
        const { data: userRole, error: roleError } = await supabase
            .from('user_roles')
            .select('role')
            .eq('uid', user.id)
            .single()

        console.log(`[Middleware] User ID: ${user.id}`);
        console.log(`[Middleware] Role Query Result:`, userRole, 'Error:', roleError?.message);

        if (!userRole || userRole.role !== 'admin') {
            console.log(`[Middleware] User is not admin (Role: ${userRole?.role}). Redirecting to login.`);
            const url = request.nextUrl.clone()
            url.pathname = '/admin/login'
            return NextResponse.redirect(url)
        }
        
        console.log('[Middleware] Access granted to admin route.');
    }

    // Si está en /admin/login y ya tiene sesión admin, redirigir al dashboard
    if (isLoginRoute && user) {
        const { data: userRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('uid', user.id)
            .single()

        if (userRole?.role === 'admin') {
            const url = request.nextUrl.clone()
            url.pathname = '/admin'
            return NextResponse.redirect(url)
        }
    }

    return supabaseResponse
}
