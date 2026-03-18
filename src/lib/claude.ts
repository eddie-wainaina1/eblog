import Anthropic from '@anthropic-ai/sdk'
import type { TrendingTopic } from './trends'
import { slugify, generateExcerpt } from './markdown'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface GeneratedBlog {
  title: string
  slug: string
  content: string  // markdown
  excerpt: string
  coverImage: string
  tags: string[]
  seoTitle: string
  seoDescription: string
}

export async function generateBlogFromTrend(topic: TrendingTopic): Promise<GeneratedBlog> {
  const contextArticles = topic.articles
    .map((a) => `- ${a.title}`)
    .join('\n')

  const prompt = `You are a skilled blog writer. Write a comprehensive, engaging, and well-researched blog post about the trending topic: "${topic.title}".

Context — recent related headlines:
${contextArticles}

Requirements:
1. Write in Markdown format
2. Include a compelling H1 title at the top
3. Use H2 and H3 subheadings to structure the content
4. Length: 600–1000 words
5. Include at least one relevant inline image using Markdown syntax: ![alt text](https://images.unsplash.com/photo-XXXXXXXX?w=800&q=80) — use real-looking Unsplash photo IDs relevant to the topic
6. Add a cover image URL as the very first thing (a line starting with COVER_IMAGE: followed by the URL, before the # heading)
7. Include bullet lists and/or numbered lists where appropriate
8. Write in a professional but accessible tone
9. End with a brief conclusion

After the blog content, on separate lines, output:
TAGS: tag1, tag2, tag3, tag4, tag5
SEO_TITLE: (an optimised title under 60 chars)
SEO_DESCRIPTION: (a meta description under 160 chars)`

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = (message.content[0] as { type: string; text: string }).text

  // Parse cover image
  const coverMatch = raw.match(/^COVER_IMAGE:\s*(.+)/m)
  const coverImage = coverMatch
    ? coverMatch[1].trim()
    : `https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&q=80`

  // Parse tags
  const tagsMatch = raw.match(/^TAGS:\s*(.+)/m)
  const tags = tagsMatch
    ? tagsMatch[1].split(',').map((t) => t.trim()).filter(Boolean)
    : [topic.title.toLowerCase()]

  // Parse SEO fields
  const seoTitleMatch = raw.match(/^SEO_TITLE:\s*(.+)/m)
  const seoDescMatch = raw.match(/^SEO_DESCRIPTION:\s*(.+)/m)

  // Strip metadata lines to get clean markdown
  const content = raw
    .replace(/^COVER_IMAGE:.*$/m, '')
    .replace(/^TAGS:.*$/m, '')
    .replace(/^SEO_TITLE:.*$/m, '')
    .replace(/^SEO_DESCRIPTION:.*$/m, '')
    .trim()

  // Extract title from first H1
  const titleMatch = content.match(/^#\s+(.+)/m)
  const title = titleMatch ? titleMatch[1].trim() : topic.title

  return {
    title,
    slug: slugify(title),
    content,
    excerpt: generateExcerpt(content),
    coverImage,
    tags,
    seoTitle: seoTitleMatch ? seoTitleMatch[1].trim() : title.slice(0, 60),
    seoDescription: seoDescMatch ? seoDescMatch[1].trim() : generateExcerpt(content, 160),
  }
}
