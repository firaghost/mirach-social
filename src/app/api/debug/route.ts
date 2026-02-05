import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  return NextResponse.json({ ok: true, now: new Date().toISOString(), route: 'debug', method: 'GET' })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  return NextResponse.json({ ok: true, now: new Date().toISOString(), route: 'debug', method: 'POST', body })
}
