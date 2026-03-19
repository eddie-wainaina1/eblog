'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardActionArea, Chip, Typography, Box, Stack } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'

interface BlogCardProps {
  blog: {
    _id: string
    title: string
    slug: string
    excerpt: string
    coverImage: string
    tags: string[]
    origin: 'admin' | 'ai'
    author: string        // reviewer's name/email after publish
    publishedAt: string | null
    createdAt: string
  }
}

export default function BlogCard({ blog }: BlogCardProps) {
  const date = blog.publishedAt ?? blog.createdAt
  const formatted = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardActionArea component={Link} href={`/blog/${blog.slug}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        {blog.coverImage && (
          <Box sx={{ position: 'relative', height: 200, width: '100%' }}>
            <Image
              src={blog.coverImage}
              alt={blog.title}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
            />
          </Box>
        )}
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {blog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {blog.excerpt}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.5 }}>
            {blog.tags.slice(0, 3).map((tag) => (
              <Chip key={tag} label={tag} size="small" variant="outlined" color="primary" />
            ))}
          </Stack>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'text.secondary' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="caption">eblog.theewn</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <CalendarTodayIcon fontSize="small" />
              <Typography variant="caption">{formatted}</Typography>
            </Box>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
