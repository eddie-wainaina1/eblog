'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Container, Box, Typography, Button, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from '@mui/material'
import Link from 'next/link'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import BlogTable from '@/components/admin/BlogTable'

type BlogStatus = '' | 'draft' | 'pending' | 'published'

interface BlogRow {
  _id: string
  title: string
  slug: string
  status: 'draft' | 'pending' | 'published'
  origin: 'admin' | 'ai'
  author: string
  tags: string[]
  createdAt: string
  publishedAt: string | null
}

function AdminBlogsContent() {
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<BlogStatus>((searchParams.get('status') ?? '') as BlogStatus)
  const [blogs, setBlogs] = useState<BlogRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [genMessage, setGenMessage] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      setLoading(true)
      const params = new URLSearchParams({ admin: '1', limit: '50' })
      if (status) params.set('status', status)
      const res = await fetch(`/api/blogs?${params}`)
      const data = await res.json()
      if (!cancelled) {
        setBlogs(data.blogs ?? [])
        setTotal(data.total ?? 0)
        setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  }, [status, refreshKey])

  const handleGenerateNow = async () => {
    setGenerating(true)
    setGenMessage('')
    const res = await fetch('/api/cron/generate-blogs', { method: 'POST' })
    if (res.ok) {
      setGenMessage('AI blog generation triggered. Refresh to see the new pending blog.')
      setRefreshKey(k => k + 1)
    } else {
      setGenMessage('Generation failed — check ANTHROPIC_API_KEY and CRON_SECRET.')
    }
    setGenerating(false)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" fontWeight={700}>Blogs ({total})</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SmartToyIcon />}
            onClick={handleGenerateNow}
            disabled={generating}
            color="secondary"
          >
            {generating ? 'Generating…' : 'Generate AI Blog'}
          </Button>
          <Button component={Link} href="/admin/dashboard/blogs/new" variant="contained" startIcon={<AddCircleIcon />}>
            New Blog
          </Button>
        </Box>
      </Box>

      {genMessage && <Alert severity="info" sx={{ mb: 2 }} onClose={() => setGenMessage('')}>{genMessage}</Alert>}

      <ToggleButtonGroup exclusive value={status} onChange={(_, v) => { if (v !== null) setStatus(v) }} sx={{ mb: 3 }}>
        <ToggleButton value="">All</ToggleButton>
        <ToggleButton value="published">Published</ToggleButton>
        <ToggleButton value="pending">Pending</ToggleButton>
        <ToggleButton value="draft">Draft</ToggleButton>
      </ToggleButtonGroup>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <BlogTable blogs={blogs} onRefresh={() => setRefreshKey(k => k + 1)} />
      )}
    </Container>
  )
}

export default function AdminBlogsPage() {
  return (
    <Suspense fallback={<Box sx={{ textAlign: 'center', py: 8 }}><CircularProgress /></Box>}>
      <AdminBlogsContent />
    </Suspense>
  )
}
