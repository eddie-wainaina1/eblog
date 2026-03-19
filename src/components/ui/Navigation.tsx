'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Box,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const navLinks = [
  { label: 'Home', href: '/' },
  { label: 'Blog', href: '/#blogs' },
]

export default function Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: 'primary.main' }}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Box component={Link} href="/" sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Image src="/logo.svg" alt="EWN logo" width={52} height={52} priority />
        </Box>

        {/* Desktop nav — hidden on xs */}
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 1 }}>
          {navLinks.map((link) => (
            <Button key={link.href} component={Link} href={link.href} sx={{ color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}>
              {link.label}
            </Button>
          ))}
        </Box>

        {/* Mobile menu button — hidden on sm+ */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' } }}>
          <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: 'white' }}>
            <MenuIcon />
          </IconButton>
        </Box>

        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 220 }}>
            <List>
              {navLinks.map((link) => (
                <ListItem key={link.href} disablePadding>
                  <ListItemButton component={Link} href={link.href} onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary={link.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  )
}
