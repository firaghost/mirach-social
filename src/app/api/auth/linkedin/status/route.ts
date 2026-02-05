import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('linkedin_token')?.value
    return NextResponse.json({ connected: !!token })
  } catch (err) {
    console.error('Error checking LinkedIn status:', err)
    return NextResponse.json({ connected: false })
  }
}
