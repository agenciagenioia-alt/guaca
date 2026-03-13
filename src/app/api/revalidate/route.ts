import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

const MAX_BODY = 512

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-revalidate-secret')
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const raw = await req.text()
    if (raw.length > MAX_BODY) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 })
    }
    const body = raw ? JSON.parse(raw) : {}
    revalidatePath('/', 'layout')
    return NextResponse.json({ revalidated: true, timestamp: Date.now() })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
