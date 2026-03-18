'use client'

import { useState, FormEvent } from 'react'
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
import Link from 'next/link'
import MarkdownEditor from '@/components/admin/MarkdownEditor'

export default function NewBlogPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [status, setStatus] = useState('draft')
  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/blogs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content, coverImage, tags, status, seoTitle, seoDescription }),
    })

    if (res.ok) {
      router.push('/admin/dashboard/blogs')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save blog')
    }
    setLoading(false)
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button component={Link} href="/admin/dashboard/blogs" startIcon={<ArrowBackIcon />} color="inherit">Back</Button>
        <Typography variant="h4" fontWeight={700}>New Blog</Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required fullWidth />

        <TextField label="Cover Image URL" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} fullWidth placeholder="https://images.unsplash.com/..." />

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
          renderInput={(params) => <TextField {...params} label="Tags (press Enter to add)" placeholder="Add tag..." />}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="published">Published</MenuItem>
          </TextField>
        </Box>

        <Typography variant="subtitle1" fontWeight={600} sx={{ mt: 1 }}>SEO</Typography>
        <TextField label="SEO Title (max 60 chars)" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} fullWidth inputProps={{ maxLength: 60 }} />
        <TextField label="SEO Description (max 160 chars)" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} fullWidth multiline rows={2} inputProps={{ maxLength: 160 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            disabled={loading}
          >
            {loading ? 'Saving…' : 'Save Blog'}
          </Button>
        </Box>
      </Box>
    </Container>
  )
}
