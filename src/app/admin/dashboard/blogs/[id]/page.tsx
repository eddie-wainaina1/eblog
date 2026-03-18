'use client'

import { useState, useEffect, FormEvent, use } from 'react'
import { useRouter } from 'next/navigation'
import Container from '@mui/material/Container'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Chip from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import SaveIcon from '@mui/icons-material/Save'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Link from 'next/link'
import MarkdownEditor from '@/components/admin/MarkdownEditor'

export default function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [status, setStatus] = useState('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  useEffect(() => {
    fetch(`/api/blogs/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setTitle(data.title ?? '')
        setContent(data.content ?? '')
        setCoverImage(data.coverImage ?? '')
        setTags(data.tags ?? [])
        setStatus(data.status ?? 'draft')
        setSeoTitle(data.seoTitle ?? '')
        setSeoDescription(data.seoDescription ?? '')
        setFetching(false)
      })
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const res = await fetch(`/api/blogs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, coverImage, tags, status, seoTitle, seoDescription }),
    })

    if (res.ok) {
      setSuccess('Blog saved successfully.')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save')
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    setLoading(true)
    await fetch(`/api/blogs/${id}/approve`, { method: 'POST' })
    setStatus('published')
    setSuccess('Blog approved and published!')
    setLoading(false)
  }

  if (fetching) {
    return <Box sx={{ textAlign: 'center', py: 10 }}><CircularProgress /></Box>
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button component={Link} href="/admin/dashboard/blogs" startIcon={<ArrowBackIcon />} color="inherit">Back</Button>
          <Typography variant="h4" fontWeight={700}>Edit Blog</Typography>
        </Box>
        {status === 'pending' && (
          <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} onClick={handleApprove} disabled={loading}>
            Approve & Publish
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />
        <TextField label="Cover Image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} fullWidth />
        <MarkdownEditor value={content} onChange={setContent} />

        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={tags}
          onChange={(_, val) => setTags(val as string[])}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip variant="outlined" label={option} size="small" {...getTagProps({ index })} key={option} />
            ))
          }
          renderInput={(params) => <TextField {...params} label="Tags" placeholder="Add tag..." />}
        />

        <TextField
          select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          sx={{ maxWidth: 200 }}
        >
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="published">Published</MenuItem>
        </TextField>

        <Typography variant="subtitle1" fontWeight={600}>SEO</Typography>
        <TextField label="SEO Title" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} fullWidth inputProps={{ maxLength: 60 }} />
        <TextField label="SEO Description" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} fullWidth multiline rows={2} inputProps={{ maxLength: 160 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
