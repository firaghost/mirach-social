import { NextRequest, NextResponse } from 'next/server'

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/linkedin/callback`

export async function GET(request: NextRequest) {
  // Step 1: Redirect user to LinkedIn OAuth
  const scope = 'openid profile w_member_social'
  const state = Buffer.from(Math.random().toString()).toString('base64')
  
  const authUrl = new URL('https://www.linkedin.com/oauth/v2/authorization')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', LINKEDIN_CLIENT_ID!)
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('scope', scope)
  
  // Store state in cookie for validation
  const response = NextResponse.redirect(authUrl.toString())
  response.cookies.set('linkedin_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 10 // 10 minutes
  })
  
  return response
}
