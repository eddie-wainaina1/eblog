import { Suspense } from 'react'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'
import BlogCard from '@/components/blog/BlogCard'

export const metadata: Metadata = {
  title: 'eBlog — Latest Articles & Trending Topics',
  description: 'Stay up to date with the latest articles, trends, and insights on eBlog.',
  openGraph: {
    title: 'eBlog — Latest Articles & Trending Topics',
    description: 'Stay up to date with the latest articles, trends, and insights on eBlog.',
    type: 'website',
  },
}

async function BlogList({ tag, page }: { tag?: string; page: number }) {
  await connectDB()

  const limit = 12
  const query: Record<string, unknown> = { status: 'published' }
  if (tag) query.tags = tag

  const [blogs, total] = await Promise.all([
    Blog.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-htmlContent -content')
      .lean(),
    Blog.countDocuments(query),
  ])

  const allTags = await Blog.distinct('tags', { status: 'published' })

  if (!blogs.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 10 }}>
        <Typography variant="h5" color="text.secondary">No articles published yet.</Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>Check back soon!</Typography>
      </Box>
    )
  }

  return (
    <>
      {allTags.length > 0 && (
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Chip label="All" component="a" href="/" clickable color={!tag ? 'primary' : 'default'} variant={!tag ? 'filled' : 'outlined'} />
          {(allTags as string[]).map((t) => (
            <Chip
              key={t}
              label={t}
              component="a"
              href={`/?tag=${encodeURIComponent(t)}`}
              clickable
              color={tag === t ? 'primary' : 'default'}
              variant={tag === t ? 'filled' : 'outlined'}
            />
          ))}
        </Box>
      )}

      <Grid container spacing={3}>
        {blogs.map((blog) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={String(blog._id)}>
            <BlogCard blog={{
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
            }} />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body2" color="text.secondary">{total} article{total !== 1 ? 's' : ''} total</Typography>
      </Box>
    </>
  )
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ tag?: string; page?: string }> }) {
  const sp = await searchParams
  const tag = sp.tag
  const page = Math.max(1, parseInt(sp.page ?? '1'))

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

      <Suspense fallback={<Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>}>
        <BlogList tag={tag} page={page} />
      </Suspense>
    </Container>
  )
}
