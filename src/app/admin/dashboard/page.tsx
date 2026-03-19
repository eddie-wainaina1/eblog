import { Box, Container, Grid, Card, CardContent, Typography, Button, Chip } from '@mui/material'
import ArticleIcon from '@mui/icons-material/Article'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { connectDB } from '@/lib/mongodb'
import Blog from '@/models/Blog'

async function getStats() {
  await connectDB()
  const [total, pending, published, draft] = await Promise.all([
    Blog.countDocuments(),
    Blog.countDocuments({ status: 'pending' }),
    Blog.countDocuments({ status: 'published' }),
    Blog.countDocuments({ status: 'draft' }),
  ])
  const recent = await Blog.find().sort({ createdAt: -1 }).limit(5).select('title status author createdAt').lean()
  return { total, pending, published, draft, recent }
}

export default async function DashboardPage() {
  const stats = await getStats()

  const statCards = [
    { label: 'Total Blogs', value: stats.total, icon: <ArticleIcon />, color: '#1a73e8' },
    { label: 'Published', value: stats.published, icon: <PublishedWithChangesIcon />, color: '#34a853' },
    { label: 'Pending Review', value: stats.pending, icon: <PendingActionsIcon />, color: '#fbbc04' },
  ]

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>Dashboard</Typography>
        <Button href="/admin/dashboard/blogs/new" variant="contained" startIcon={<AddCircleIcon />}>
          New Blog
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((s) => (
          <Grid size={{ xs: 12, sm: 4 }} key={s.label}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: s.color, color: 'white', display: 'flex' }}>
                  {s.icon}
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight={700}>{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Recent Blogs</Typography>
            <Button href="/admin/dashboard/blogs" size="small">View all</Button>
          </Box>
          {stats.recent.map((blog) => (
            <Box key={String(blog._id)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box>
                <Typography variant="body2" fontWeight={500}>{blog.title}</Typography>
                <Typography variant="caption" color="text.secondary">{new Date(blog.createdAt).toLocaleDateString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Chip label={blog.author} size="small" variant="outlined" />
                <Chip
                  label={blog.status}
                  size="small"
                  color={blog.status === 'published' ? 'success' : blog.status === 'pending' ? 'warning' : 'default'}
                />
              </Box>
            </Box>
          ))}
          {stats.pending > 0 && (
            <Box sx={{ mt: 2 }}>
              <Button href="/admin/dashboard/blogs?status=pending" color="warning" variant="outlined" fullWidth>
                Review {stats.pending} pending blog{stats.pending !== 1 ? 's' : ''}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  )
}
