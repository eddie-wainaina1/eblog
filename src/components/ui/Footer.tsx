import { Box, Typography } from '@mui/material'
import NextLink from 'next/link'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: '#0d1b2a', py: 4, mt: 'auto', px: { xs: 2, sm: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
          © {new Date().getFullYear()} eblog.theewn. All rights reserved.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <NextLink href="/" className={styles.link}>Home</NextLink>
          <NextLink href="/sitemap.xml" className={styles.link}>Sitemap</NextLink>
        </Box>
      </Box>
    </Box>
  )
}
