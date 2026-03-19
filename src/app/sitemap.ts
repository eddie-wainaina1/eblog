import type { MetadataRoute } from 'next'

export const revalidate = 3600 // regenerate sitemap at most once per hour
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  await connectDB()
  const blogs = await Blog.find({ status: 'published' }).select('slug publishedAt updatedAt').lean()

  const blogUrls: MetadataRoute.Sitemap = blogs.map((b) => ({
    url: `${base}/blog/${b.slug}`,
    lastModified: b.updatedAt ?? b.publishedAt ?? new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    ...blogUrls,
  ]
}
