export const dynamic = 'force-dynamic'

import { Box } from '@mui/material'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', overflow: 'auto' }}>
        {children}
      </Box>
    </Box>
  )
}
