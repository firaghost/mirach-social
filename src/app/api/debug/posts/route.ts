import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const { data, error } = await supabaseAdmin
      .from('posts')
      .select('*, media(*)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Debug posts fetch error:', error)
      return NextResponse.json({ ok: false, error: error.message || error }, { status: 500 })
    }

    return NextResponse.json({ ok: true, count: data?.length ?? 0, data })
  } catch (err: any) {
    console.error('Debug posts exception:', err)
    return NextResponse.json({ ok: false, error: err.message || String(err) }, { status: 500 })
  }
}
