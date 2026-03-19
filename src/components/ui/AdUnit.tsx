'use client'

import { useEffect, useRef } from 'react'

interface AdUnitProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'horizontal' | 'vertical'
  style?: React.CSSProperties
}

const PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID

export default function AdUnit({ adSlot, adFormat = 'auto', style }: AdUnitProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    pushed.current = true
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({})
    } catch {
      // AdSense not loaded (e.g. blocked by ad blocker)
    }
  }, [])

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block', width: '100%', height: '100%', ...style }}
      data-ad-client={PUBLISHER_ID}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive="false"
    />
  )
}
