import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ThemeRegistry from '@/components/ThemeRegistry'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'eblog.theewn — Latest Articles & Trending Topics',
    template: '%s | eblog.theewn',
  },
  description: 'Stay up to date with the latest articles, trends, and insights on eblog.theewn.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  robots: { index: true, follow: true },
  icons: { icon: '/icon.svg' },
  openGraph: { siteName: 'eblog.theewn', type: 'website', images: [{ url: '/logo.png' }] },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  )
}
