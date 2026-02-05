import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const supabaseAdmin = createSupabaseAdmin()
    const userId = request.nextUrl.searchParams.get('user_id') || null

    let query = supabaseAdmin.from('linkedin_tokens').select('*').order('created_at', { ascending: false }).limit(1)
    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query

    if (error) {
      console.error('Error fetching linkedin_tokens:', error)
      return NextResponse.json({ connected: false })
    }

    const tokenRow = data && data[0]
    if (!tokenRow) return NextResponse.json({ connected: false })

    const expiresAt = tokenRow.expires_at ? new Date(tokenRow.expires_at) : null
    const now = new Date()
    const connected = !!tokenRow.access_token && (!expiresAt || expiresAt > now)

    return NextResponse.json({ connected, expires_at: tokenRow.expires_at || null })
  } catch (err) {
    console.error('Error checking LinkedIn status:', err)
    return NextResponse.json({ connected: false })
  }
}
