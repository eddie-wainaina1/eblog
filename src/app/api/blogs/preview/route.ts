import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { markdownToHtml } from '@/lib/markdown'

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { markdown } = await request.json()
  if (!markdown) return NextResponse.json({ html: '' })

  const html = await markdownToHtml(markdown)
  return NextResponse.json({ html })
}
