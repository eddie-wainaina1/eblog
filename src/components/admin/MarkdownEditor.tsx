'use client'

import { useState } from 'react'
import {
  Box,
  Tabs,
  Tab,
  TextField,
  Paper,
  Typography,
} from '@mui/material'

interface MarkdownEditorProps {
  value: string
  onChange: (val: string) => void
  label?: string
  minRows?: number
}

export default function MarkdownEditor({ value, onChange, label = 'Content (Markdown)', minRows = 20 }: MarkdownEditorProps) {
  const [tab, setTab] = useState(0)
  const [previewHtml, setPreviewHtml] = useState('')

  const handleTabChange = async (_: React.SyntheticEvent, newVal: number) => {
    if (newVal === 1) {
      const res = await fetch('/api/blogs/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markdown: value }),
      })
      if (res.ok) {
        const data = await res.json()
        setPreviewHtml(data.html)
      }
    }
    setTab(newVal)
  }

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom>{label}</Typography>
      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 1 }}>
        <Tab label="Write" />
        <Tab label="Preview" />
      </Tabs>
      {tab === 0 ? (
        <TextField
          multiline
          fullWidth
          minRows={minRows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your blog in Markdown..."
          variant="outlined"
          sx={{ fontFamily: 'monospace' }}
          inputProps={{ style: { fontFamily: 'monospace', fontSize: 14 } }}
        />
      ) : (
        <Paper
          variant="outlined"
          sx={{ p: 3, minHeight: minRows * 24, overflowY: 'auto' }}
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: previewHtml || '<p style="color:#999">Preview will appear here</p>' }}
        />
      )}
    </Box>
  )
}
