import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { getSession } from '@/lib/auth'
import { markdownToHtml, generateExcerpt, slugify } from '@/lib/markdown'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/blogs/[id] — public by slug, admin by _id
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    await connectDB()

    const blog = await Blog.findOne({
      $or: [{ _id: id.match(/^[0-9a-f]{24}$/) ? id : null }, { slug: id }],
    })

    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const session = await getSession()
    if (blog.status !== 'published' && !session) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/blogs/[id] — admin only
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const body = await request.json()
    const updates: Record<string, unknown> = {}

    if (body.title !== undefined) {
      updates.title = body.title
      updates.slug = slugify(body.title)
    }
    if (body.content !== undefined) {
      updates.content = body.content
      updates.htmlContent = await markdownToHtml(body.content)
      updates.excerpt = generateExcerpt(body.content)
    }
    if (body.coverImage !== undefined) updates.coverImage = body.coverImage
    if (body.tags !== undefined) updates.tags = body.tags
    if (body.status !== undefined) {
      updates.status = body.status
      if (body.status === 'published') {
        updates.publishedAt = new Date()
        updates.author = session.email
      }
    }
    if (body.seoTitle !== undefined) updates.seoTitle = body.seoTitle
    if (body.seoDescription !== undefined) updates.seoDescription = body.seoDescription

    const blog = await Blog.findByIdAndUpdate(id, updates, { returnDocument: 'after' })
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json(blog)
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/blogs/[id] — admin only
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await connectDB()

    const blog = await Blog.findByIdAndDelete(id)
    if (!blog) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
