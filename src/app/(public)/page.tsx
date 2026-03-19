import { Container, Grid, Typography, Box } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'
import BlogCard from '@/components/blog/BlogCard'
import TagFilter from '@/components/blog/TagFilter'

export const metadata: Metadata = {
  title: 'eblog.theewn — Latest Articles & Trending Topics',
  description: 'Stay up to date with the latest articles, trends, and insights on eblog.theewn.',
  openGraph: {
    title: 'eblog.theewn — Latest Articles & Trending Topics',
    description: 'Stay up to date with the latest articles, trends, and insights on eblog.theewn.',
    type: 'website',
  },
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; page?: string }>
}) {
  const sp = await searchParams
  const tag = sp.tag
  const page = Math.max(1, parseInt(sp.page ?? '1'))
  const limit = 12

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let blogs: any[] = []
  let total = 0
  let allTags: string[] = []
  let error = false

  try {
    await connectDB()
    const query: Record<string, unknown> = { status: 'published' }
    if (tag) query.tags = tag

    ;[blogs, total, allTags] = await Promise.all([
      Blog.find(query)
        .sort({ publishedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-htmlContent -content')
        .lean(),
      Blog.countDocuments(query),
      Blog.distinct('tags', { status: 'published' }),
    ])
  } catch {
    error = true
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} id="blogs">
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom>
          {tag ? `#${tag}` : 'Latest Articles'}
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Insights, trends, and stories from around the web
        </Typography>
      </Box>

      {error ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ArticleIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>Could not load articles</Typography>
          <Typography color="text.secondary">
            We&apos;re having trouble connecting right now. Please try again shortly.
          </Typography>
        </Box>
      ) : blogs.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <ArticleIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {tag ? `No articles tagged "#${tag}" yet` : 'No articles published yet'}
          </Typography>
          <Typography color="text.secondary">
            {tag ? 'Try browsing all articles instead.' : 'Check back soon — new content is on the way.'}
          </Typography>
        </Box>
      ) : (
        <>
          <TagFilter tags={allTags as string[]} active={tag} />

          <Grid container spacing={3}>
            {blogs.map((blog) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={String(blog._id)}>
                <BlogCard
                  blog={{
                    _id: String(blog._id),
                    title: blog.title,
                    slug: blog.slug,
                    excerpt: blog.excerpt,
                    coverImage: blog.coverImage,
                    tags: blog.tags,
                    origin: blog.origin,
                    author: blog.author,
                    publishedAt: blog.publishedAt ? blog.publishedAt.toISOString() : null,
                    createdAt: blog.createdAt.toISOString(),
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              {total} article{total !== 1 ? 's' : ''} total
            </Typography>
          </Box>
        </>
      )}
    </Container>
  )
}
