import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { getSession } from '@/lib/auth'

type RouteContext = { params: Promise<{ id: string }> }

// POST /api/blogs/[id]/approve — admin approves a pending blog
export async function POST(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const blog = await Blog.findByIdAndUpdate(
      id,
      { status: 'published', publishedAt: new Date(), author: session.email },
      { returnDocument: 'after' },
    )

    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
