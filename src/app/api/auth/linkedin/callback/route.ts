import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseAdmin } from '@/lib/supabase'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')
  
  // Check for errors
  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=${encodeURIComponent(error)}`
    )
  }
  
  // Validate state
  const storedState = request.cookies.get('linkedin_oauth_state')?.value
  if (!state || state !== storedState) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=invalid_state`
    )
  }
  
  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=no_code`
    )
  }
  
  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CLIENT_ID!,
        client_secret: LINKEDIN_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI
      })
    })
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange error:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=token_exchange_failed`
      )
    }
    
    const tokenData = await tokenResponse.json()
    
    // IMPORTANT: Store this access token securely!
    // For now, we'll redirect with instructions
    // In production, store in database or secure env
    
    console.log('LinkedIn Access Token:', tokenData.access_token)
    console.log('Expires in:', tokenData.expires_in, 'seconds')
    
    // Store token in database (server-side) for improved security
    try {
      const supabaseAdmin = createSupabaseAdmin()

      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000)).toISOString()

      // Optional user_id passed through the initial auth request
      const userId = new URL(request.url).searchParams.get('user_id') || null

      // Insert new token record (attach user_id if provided)
      const insertPayload: any = {
        access_token: tokenData.access_token,
        expires_at: expiresAt
      }
      if (userId) insertPayload.user_id = userId

      const { error: insertError } = await supabaseAdmin
        .from('linkedin_tokens')
        .insert([insertPayload])

      if (insertError) {
        console.error('Failed to store LinkedIn token in DB:', insertError)
        return NextResponse.redirect(
          `${process.env.NEXT_PUBLIC_APP_URL}/?error=token_store_failed`
        )
      }

      // Clear the state cookie and redirect to settings
      const response = NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/settings?linkedin_connected=true`
      )
      response.cookies.delete('linkedin_oauth_state')
      return response
    } catch (err) {
      console.error('Error storing LinkedIn token:', err)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_APP_URL}/?error=token_store_exception`
      )
    }
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=oauth_failed`
    )
  }
}
