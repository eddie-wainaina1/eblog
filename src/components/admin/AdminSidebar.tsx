'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button,
  Toolbar,
} from '@mui/material'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ArticleIcon from '@mui/icons-material/Article'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import PendingActionsIcon from '@mui/icons-material/PendingActions'
import LogoutIcon from '@mui/icons-material/Logout'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: <DashboardIcon /> },
  { label: 'All Blogs', href: '/admin/dashboard/blogs', icon: <ArticleIcon /> },
  { label: 'Pending Review', href: '/admin/dashboard/blogs?status=pending', icon: <PendingActionsIcon /> },
  { label: 'New Blog', href: '/admin/dashboard/blogs/new', icon: <AddCircleIcon /> },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/admin')
    router.refresh()
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ArticleIcon color="primary" />
          <Typography variant="h6" fontWeight={700}>eBlog Admin</Typography>
        </Box>
      </Toolbar>
      <Divider />
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href.split('?')[0] + '/')
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton
                component={Link}
                href={item.href}
                selected={isActive}
                sx={{ '&.Mui-selected': { bgcolor: 'primary.light', color: 'white', '& .MuiListItemIcon-root': { color: 'white' } } }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      <Divider />
      <Box sx={{ p: 2 }}>
        <Button fullWidth startIcon={<LogoutIcon />} onClick={handleLogout} color="error" variant="outlined">
          Logout
        </Button>
      </Box>
    </Drawer>
  )
}
