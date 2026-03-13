import { NextRequest, NextResponse } from 'next/server'
import { getAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 días

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Admin no configurado. Define ADMIN_PASSWORD en Vercel.' },
      { status: 500 }
    )
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 })
  }

  const password = typeof body.password === 'string' ? body.password : ''
  if (password !== adminPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 })
  }

  const token = getAdminToken()
  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
  return res
}
