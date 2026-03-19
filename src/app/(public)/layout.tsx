import { Box } from '@mui/material'
import Navigation from '@/components/ui/Navigation'
import Footer from '@/components/ui/Footer'
import AdUnit from '@/components/ui/AdUnit'

// Replace with your real ad slot IDs — use separate slots per side for independent reporting
const LEFT_AD_SLOT = '4236919287'
const RIGHT_AD_SLOT = '4856833980'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navigation />
      <Box sx={{ display: 'flex', flex: 1, alignItems: 'flex-start' }}>

        {/* Left sticky ad — hidden below xl breakpoint */}
        <Box
          sx={{
            display: { xs: 'none', xl: 'flex' },
            width: 160,
            flexShrink: 0,
            position: 'sticky',
            top: 24,
            alignSelf: 'flex-start',
            height: 600,
            px: 1,
          }}
        >
          <AdUnit adSlot={LEFT_AD_SLOT} adFormat="vertical" style={{ width: 160, height: 600 }} />
        </Box>

        {/* Main content */}
        <Box component="main" sx={{ flex: 1, minWidth: 0 }}>
          {children}
        </Box>

        {/* Right sticky ad — hidden below xl breakpoint */}
        <Box
          sx={{
            display: { xs: 'none', xl: 'flex' },
            width: 160,
            flexShrink: 0,
            position: 'sticky',
            top: 24,
            alignSelf: 'flex-start',
            height: 600,
            px: 1,
          }}
        >
          <AdUnit adSlot={RIGHT_AD_SLOT} adFormat="vertical" style={{ width: 160, height: 600 }} />
        </Box>

      </Box>
      <Footer />
    </Box>
  )
}
