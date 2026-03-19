'use client'

import { Box, Chip } from '@mui/material'
import { useRouter } from 'next/navigation'

interface TagFilterProps {
  tags: string[]
  active?: string
}

export default function TagFilter({ tags, active }: TagFilterProps) {
  const router = useRouter()

  if (!tags.length) return null

  return (
    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      <Chip
        label="All"
        clickable
        color={!active ? 'primary' : 'default'}
        variant={!active ? 'filled' : 'outlined'}
        onClick={() => router.push('/')}
      />
      {tags.map((t) => (
        <Chip
          key={t}
          label={t}
          clickable
          color={active === t ? 'primary' : 'default'}
          variant={active === t ? 'filled' : 'outlined'}
          onClick={() => router.push(`/?tag=${encodeURIComponent(t)}`)}
        />
      ))}
    </Box>
  )
}
