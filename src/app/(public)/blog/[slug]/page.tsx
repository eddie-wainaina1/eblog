import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Button from '@mui/material/Button'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import type { Metadata } from 'next'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  await connectDB()
  const blog = await Blog.findOne({ slug, status: 'published' }).lean()
  if (!blog) return { title: 'Not Found' }

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''

  return {
    title: blog.seoTitle || blog.title,
    description: blog.seoDescription || blog.excerpt,
    keywords: blog.tags.join(', '),
    openGraph: {
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      type: 'article',
      publishedTime: blog.publishedAt?.toISOString(),
      tags: blog.tags,
      images: blog.coverImage ? [{ url: blog.coverImage, width: 1200, height: 630, alt: blog.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.seoTitle || blog.title,
      description: blog.seoDescription || blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : [],
    },
    alternates: { canonical: `${base}/blog/${slug}` },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  await connectDB()
  const blog = await Blog.findOne({ slug, status: 'published' }).lean()
  if (!blog) notFound()

  const date = blog.publishedAt ?? blog.createdAt
  const formatted = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage,
    datePublished: blog.publishedAt?.toISOString(),
    dateModified: blog.updatedAt.toISOString(),
    author: { '@type': 'Person', name: blog.author || (blog.origin === 'ai' ? 'eBlog AI' : 'eBlog Admin') },
    keywords: blog.tags.join(', '),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Button component={Link} href="/" startIcon={<ArrowBackIcon />} sx={{ mb: 3 }} color="inherit">
          Back to articles
        </Button>

        {blog.coverImage && (
          <Box sx={{ position: 'relative', height: { xs: 220, sm: 360 }, borderRadius: 2, overflow: 'hidden', mb: 4 }}>
            <Image src={blog.coverImage} alt={blog.title} fill style={{ objectFit: 'cover' }} priority sizes="(max-width: 900px) 100vw, 900px" />
          </Box>
        )}

        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {blog.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" component={Link} href={`/?tag=${encodeURIComponent(tag)}`} clickable variant="outlined" color="primary" />
          ))}
        </Box>

        <Typography variant="h3" component="h1" fontWeight={700} gutterBottom sx={{ lineHeight: 1.25 }}>
          {blog.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4, color: 'text.secondary' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {blog.origin === 'ai' ? <SmartToyIcon fontSize="small" /> : <PersonIcon fontSize="small" />}
            <Typography variant="body2">{blog.author || (blog.origin === 'ai' ? 'AI Generated' : 'Admin')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <CalendarTodayIcon fontSize="small" />
            <Typography variant="body2">{formatted}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 4 }} />

        <Box
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: blog.htmlContent }}
          sx={{
            '& h1,& h2,& h3,& h4': { mt: 4, mb: 2, fontWeight: 700, lineHeight: 1.3 },
            '& h1': { fontSize: '2rem' },
            '& h2': { fontSize: '1.5rem' },
            '& h3': { fontSize: '1.25rem' },
            '& p': { mb: 2, lineHeight: 1.8 },
            '& ul,& ol': { pl: 3, mb: 2 },
            '& li': { mb: 0.5, lineHeight: 1.8 },
            '& img': { maxWidth: '100%', borderRadius: 2, my: 2 },
            '& a': { color: 'primary.main', textDecoration: 'underline' },
            '& code': { bgcolor: 'grey.100', px: 0.5, borderRadius: 0.5, fontFamily: 'monospace', fontSize: '0.875em' },
            '& pre': { bgcolor: 'grey.900', color: 'common.white', p: 2, borderRadius: 2, overflow: 'auto', mb: 2 },
            '& pre code': { bgcolor: 'transparent', p: 0 },
            '& blockquote': { borderLeft: 4, borderColor: 'primary.main', pl: 2, ml: 0, color: 'text.secondary', fontStyle: 'italic' },
            '& hr': { my: 4 },
          }}
        />
      </Container>
    </>
  )
}

export async function generateStaticParams() {
  await connectDB()
  const blogs = await Blog.find({ status: 'published' }).select('slug').lean()
  return blogs.map((b) => ({ slug: b.slug }))
}
