'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Box,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import PersonIcon from '@mui/icons-material/Person'

type BlogStatus = 'draft' | 'pending' | 'published'

interface BlogRow {
  _id: string
  title: string
  slug: string
  status: BlogStatus
  origin: 'admin' | 'ai'
  author: string
  tags: string[]
  createdAt: string
  publishedAt: string | null
}

interface BlogTableProps {
  blogs: BlogRow[]
  onRefresh: () => void
}

const statusColors: Record<BlogStatus, 'default' | 'warning' | 'success'> = {
  draft: 'default',
  pending: 'warning',
  published: 'success',
}

export default function BlogTable({ blogs, onRefresh }: BlogTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<BlogRow | null>(null)
  const [loading, setLoading] = useState(false)

  const handleApprove = async (id: string) => {
    setLoading(true)
    await fetch(`/api/blogs/${id}/approve`, { method: 'POST' })
    onRefresh()
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setLoading(true)
    await fetch(`/api/blogs/${deleteTarget._id}`, { method: 'DELETE' })
    setDeleteTarget(null)
    onRefresh()
    setLoading(false)
  }

  if (!blogs.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">No blogs found.</Typography>
      </Box>
    )
  }

  return (
    <>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell><strong>Title</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Author</strong></TableCell>
              <TableCell><strong>Tags</strong></TableCell>
              <TableCell><strong>Created</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>{blog.title}</Typography>
                  <Typography variant="caption" color="text.secondary">/blog/{blog.slug}</Typography>
                </TableCell>
                <TableCell>
                  <Chip label={blog.status} size="small" color={statusColors[blog.status]} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {blog.origin === 'ai' ? <SmartToyIcon fontSize="small" color="action" /> : <PersonIcon fontSize="small" color="action" />}
                    <Typography variant="caption">{blog.author || (blog.origin === 'ai' ? 'AI' : 'Admin')}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {blog.tags.slice(0, 2).map((t) => <Chip key={t} label={t} size="small" variant="outlined" />)}
                    {blog.tags.length > 2 && <Typography variant="caption" color="text.secondary">+{blog.tags.length - 2}</Typography>}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{new Date(blog.createdAt).toLocaleDateString()}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                    {blog.status === 'pending' && (
                      <Tooltip title="Approve & Publish">
                        <IconButton size="small" color="success" onClick={() => handleApprove(blog._id)} disabled={loading}>
                          <CheckCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton size="small" component={Link} href={`/admin/dashboard/blogs/${blog._id}`}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(blog)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete Blog</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &ldquo;{deleteTarget?.title}&rdquo;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={loading}>Delete</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
