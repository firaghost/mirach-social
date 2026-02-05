import { NextRequest, NextResponse } from 'next/server'

// Debug endpoints are disabled in production. This route returns 404.
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 404 })
}

export async function POST(request: NextRequest) {
  return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 404 })
}
