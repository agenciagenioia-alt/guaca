import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const VIEWER_WINDOW_MINUTES = 2

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params
    const body = await req.json().catch(() => ({}))
    const viewerId = typeof body?.viewer_id === 'string' ? body.viewer_id.trim() : null

    if (!productId || !viewerId) {
      return NextResponse.json(
        { error: 'product_id and viewer_id required', count: 0 },
        { status: 400 }
      )
    }

    const supabase = await createClient() as any

    await supabase.from('product_viewers').upsert(
      {
        product_id: productId,
        viewer_id: viewerId,
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: 'product_id,viewer_id' }
    )

    const windowStart = new Date(Date.now() - VIEWER_WINDOW_MINUTES * 60 * 1000).toISOString()
    await supabase
      .from('product_viewers')
      .delete()
      .eq('product_id', productId)
      .lt('last_seen_at', windowStart)

    const { count, error } = await supabase
      .from('product_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .gte('last_seen_at', windowStart)

    if (error) {
      return NextResponse.json({ count: 0, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch (e) {
    return NextResponse.json({ count: 0, error: String(e) }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await context.params
    if (!productId) {
      return NextResponse.json({ count: 0 }, { status: 400 })
    }

    const supabase = await createClient() as any
    const windowStart = new Date(Date.now() - VIEWER_WINDOW_MINUTES * 60 * 1000).toISOString()

    const { count, error } = await supabase
      .from('product_viewers')
      .select('*', { count: 'exact', head: true })
      .eq('product_id', productId)
      .gte('last_seen_at', windowStart)

    if (error) {
      return NextResponse.json({ count: 0 }, { status: 500 })
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 }, { status: 500 })
  }
}
