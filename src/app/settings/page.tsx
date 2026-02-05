import React from 'react'
import { createSupabaseAdmin } from '@/lib/supabase'

type Props = {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function SettingsPage({ searchParams }: Props) {
  const params = searchParams ? await searchParams : undefined
  const showSuccessBanner = params?.linkedin_connected === 'true'

  // Check actual LinkedIn connection status from the DB (server-side)
  let connected = false
  let expiresAt: string | null = null
  try {
    const supabaseAdmin = createSupabaseAdmin()

    let query: any = supabaseAdmin
      .from('linkedin_tokens')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)

    // If a user_id was passed through query params, filter by it
    const userId = params?.user_id as string | undefined
    if (userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    if (!error && data && data[0]) {
      const tokenRow = data[0]
      expiresAt = tokenRow.expires_at || null
      const now = new Date()
      const exp = tokenRow.expires_at ? new Date(tokenRow.expires_at) : null
      connected = !!tokenRow.access_token && (!exp || exp > now)
    }
  } catch (err) {
    console.error('Failed to check LinkedIn status on server:', err)
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>

      {showSuccessBanner && (
        <div className="rounded-md p-4 bg-green-50 text-green-800 mb-4">
          LinkedIn successfully connected.
        </div>
      )}

      <div className="rounded-md p-4 bg-white border">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <div className="font-medium">LinkedIn {connected ? 'Connected' : 'Not Connected'}</div>
        </div>
        {connected && expiresAt && (
          <div className="text-sm text-gray-600">Token expires at: {new Date(expiresAt).toLocaleString()}</div>
        )}
      </div>
    </main>
  )
}
