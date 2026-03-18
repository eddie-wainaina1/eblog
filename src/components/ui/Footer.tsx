import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import NextLink from 'next/link'

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider', py: 4, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} eBlog. All rights reserved.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Link component={NextLink} href="/" variant="body2" color="text.secondary" underline="hover">
              Home
            </Link>
            <Link component={NextLink} href="/sitemap.xml" variant="body2" color="text.secondary" underline="hover">
              Sitemap
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}
