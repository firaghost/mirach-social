import { NextRequest, NextResponse } from 'next/server'

// Disabled to avoid exposing database contents. Return 404.
export async function GET(request: NextRequest) {
  return NextResponse.json({ error: 'Debug endpoint disabled' }, { status: 404 })
}
