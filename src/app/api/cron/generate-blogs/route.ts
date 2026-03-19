import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'
import { getGoogleTrends } from '@/lib/trends'
import { generateBlogFromTrend } from '@/lib/claude'
import { markdownToHtml } from '@/lib/markdown'
import { getSession } from '@/lib/auth'

// Called by Vercel Cron daily, or manually from the admin dashboard.
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = request.headers.get('x-cron-secret')

  const isVercelCron = authHeader === `Bearer ${process.env.CRON_SECRET}`
  const isManual = cronSecret === process.env.CRON_SECRET
  const session = await getSession()
  const isAdmin = session?.role === 'admin'

  if (!isVercelCron && !isManual && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await connectDB()

    const trends = await getGoogleTrends('US')
    if (!trends.length) return NextResponse.json({ ok: true, generated: 0 })

    // Pick a random topic from the top 10
    const topic = trends[Math.floor(Math.random() * Math.min(10, trends.length))]

    const generated = await generateBlogFromTrend(topic)
    const htmlContent = await markdownToHtml(generated.content)

    // Ensure slug is unique
    let slug = generated.slug
    const existing = await Blog.findOne({ slug })
    if (existing) slug = `${slug}-${Date.now()}`

    const blog = await Blog.create({
      ...generated,
      slug,
      htmlContent,
      status: 'pending',  // requires admin review
      origin: 'ai',
    })

    return NextResponse.json({ ok: true, generated: 1, blogId: String(blog._id) })
  } catch (err) {
    console.error('[cron] generate-blogs error:', err)
    return NextResponse.json({ error: 'Failed to generate blog' }, { status: 500 })
  }
}

// Vercel Cron also supports GET for cron routes
export async function GET(request: NextRequest) {
  return POST(request)
}
