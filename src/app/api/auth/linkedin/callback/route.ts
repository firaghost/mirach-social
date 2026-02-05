import { NextRequest, NextResponse } from 'next/server'

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
    
    // Redirect to settings page with token info
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/settings?linkedin_connected=true`
    )
    
    // Clear the state cookie
    response.cookies.delete('linkedin_oauth_state')
    
    // Store token in httpOnly cookie (temporary for demo)
    // In production, store in database
    response.cookies.set('linkedin_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: tokenData.expires_in
    })
    
    return response
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/?error=oauth_failed`
    )
  }
}
