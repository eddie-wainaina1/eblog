import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { getSession } from '@/lib/auth'
import { markdownToHtml, generateExcerpt, slugify } from '@/lib/markdown'

// GET /api/blogs — public: returns published blogs (paginated)
// GET /api/blogs?admin=1 — admin: returns all blogs
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const { searchParams } = request.nextUrl
    const admin = searchParams.get('admin') === '1'
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.min(50, parseInt(searchParams.get('limit') ?? '12'))
    const tag = searchParams.get('tag') ?? ''
    const status = searchParams.get('status') ?? ''

    if (admin) {
      const session = await getSession()
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const query: Record<string, unknown> = admin ? {} : { status: 'published' }
    if (tag) query.tags = tag
    if (admin && status) query.status = status

    const [blogs, total] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-htmlContent')
        .lean(),
      Blog.countDocuments(query),
    ])

    return NextResponse.json({ blogs, total, page, limit })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/blogs — admin or AI agent (CRON_SECRET header)
export async function POST(request: NextRequest) {
  try {
    // Allow both admin session and AI agent via secret
    const cronSecret = request.headers.get('x-cron-secret')
    const isAgent = cronSecret && cronSecret === process.env.CRON_SECRET

    if (!isAgent) {
      const session = await getSession()
      if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    const body = await request.json()
    const {
      title,
      content,
      coverImage = '',
      tags = [],
      status = 'draft',
      seoTitle = '',
      seoDescription = '',
    } = body

    if (!title || !content) {
      return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
    }

    const htmlContent = await markdownToHtml(content)
    const excerpt = generateExcerpt(content)
    let slug = slugify(title)

    // Ensure unique slug
    const existing = await Blog.findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    const blog = await Blog.create({
      title,
      slug,
      content,
      htmlContent,
      excerpt,
      coverImage,
      tags,
      status,
      origin: isAgent ? 'ai' : 'admin',
      seoTitle: seoTitle || title,
      seoDescription: seoDescription || excerpt,
      publishedAt: status === 'published' ? new Date() : null,
    })

    return NextResponse.json(blog, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
