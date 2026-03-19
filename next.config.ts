import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Explicit project root so Turbopack ignores the stray lockfile at ~/package-lock.json
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'source.unsplash.com' },
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.githubusercontent.com' },
    ],
  },
}

export default nextConfig
