import { XMLParser } from 'fast-xml-parser'

export interface TrendingTopic {
  title: string
  traffic: string
  articles: { title: string; url: string }[]
}

export async function getGoogleTrends(geo = 'US'): Promise<TrendingTopic[]> {
  const res = await fetch(
    `https://trends.google.com/trending/rss?geo=${geo}`,
    { next: { revalidate: 3600 } },
  )

  if (!res.ok) throw new Error(`Failed to fetch Google Trends: ${res.status}`)

  const xml = await res.text()
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' })
  const data = parser.parse(xml)

  const items: Record<string, unknown>[] = data?.rss?.channel?.item ?? []

  return items.slice(0, 20).map((item) => {
    const newsItems = item['ht:news_item']
    const articles = (Array.isArray(newsItems) ? newsItems : newsItems ? [newsItems] : [])
      .slice(0, 3)
      .map((n: Record<string, unknown>) => ({
        title: String(n['ht:news_item_title'] ?? ''),
        url: String(n['ht:news_item_url'] ?? ''),
      }))

    return {
      title: String(item.title ?? ''),
      traffic: String(item['ht:approx_traffic'] ?? ''),
      articles,
    }
  })
}
