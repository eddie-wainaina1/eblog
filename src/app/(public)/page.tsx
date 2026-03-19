import { Grid, Typography, Box, Chip, Container } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
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

  const featured = !tag && page === 1 ? blogs[0] : null
  const rest = featured ? blogs.slice(1) : blogs

  return (
    <>
      {/* Hero */}
      <Box
        sx={{
          bgcolor: '#0d1b2a',
          color: 'white',
          py: { xs: 8, md: 12 },
          px: { xs: 2, sm: 3 },
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
          <TrendingUpIcon sx={{ color: '#1a73e8', fontSize: 28 }} />
          <Typography variant="overline" sx={{ color: '#1a73e8', letterSpacing: 3, fontWeight: 700 }}>
            Trending now
          </Typography>
        </Box>
        <Typography
          variant="h2"
          component="h1"
          fontWeight={800}
          sx={{ fontSize: { xs: '2rem', md: '3rem' }, lineHeight: 1.2, mb: 2 }}
        >
          Stories worth reading
        </Typography>
        <Typography
          variant="h6"
          sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: 520, mx: 'auto', fontWeight: 400 }}
        >
          Fresh takes on what the world is talking about — updated daily.
        </Typography>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }} id="blogs">
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
            {/* Featured post */}
            {featured && (
              <Box
                component={Link}
                href={`/blog/${featured.slug}`}
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  borderRadius: 3,
                  overflow: 'hidden',
                  mb: 6,
                  textDecoration: 'none',
                  color: 'inherit',
                  bgcolor: 'background.paper',
                  boxShadow: 2,
                  transition: 'box-shadow 0.2s',
                  '&:hover': { boxShadow: 6 },
                }}
              >
                {featured.coverImage && (
                  <Box sx={{ position: 'relative', minHeight: { xs: 220, md: 360 }, width: { xs: '100%', md: '55%' }, flexShrink: 0 }}>
                    <Image
                      src={featured.coverImage}
                      alt={featured.title}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 900px) 100vw, 55vw"
                      priority
                    />
                  </Box>
                )}
                <Box sx={{ p: { xs: 3, md: 5 }, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                    {featured.tags.slice(0, 3).map((t: string) => (
                      <Chip key={t} label={t} size="small" color="primary" variant="outlined" />
                    ))}
                  </Box>
                  <Typography variant="h4" fontWeight={700} gutterBottom sx={{ lineHeight: 1.25 }}>
                    {featured.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                    {featured.excerpt}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    {new Date(featured.publishedAt ?? featured.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'long', day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Tag filter */}
            <TagFilter tags={allTags as string[]} active={tag} />

            {/* Article grid */}
            {rest.length > 0 && (
              <Grid container spacing={3}>
                {rest.map((blog) => (
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
            )}

            <Box sx={{ textAlign: 'center', mt: 5 }}>
              <Typography variant="body2" color="text.secondary">
                {total} article{total !== 1 ? 's' : ''} published
              </Typography>
            </Box>
          </>
        )}
      </Container>
    </>
  )
}
