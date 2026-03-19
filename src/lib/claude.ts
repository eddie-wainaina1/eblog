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

  const prompt = `You are a human blogger writing for a general audience. Write a blog post about the trending topic: "${topic.title}".

Context — recent related headlines:
${contextArticles}

Writing style rules (follow these strictly):
- Write the way a real person talks — use contractions, occasional rhetorical questions, and first-person perspective ("I think", "here's the thing", "honestly")
- Vary sentence length deliberately. Short sentences for emphasis. Longer ones when explaining something nuanced or building on an idea.
- Start some paragraphs with a transitional thought, not a subheading
- Avoid: "In conclusion", "It's worth noting", "In today's world", "In this article", "Delve", "Dive into", "Leverage", "Unleash", "Groundbreaking", "Game-changer", "It's important to", "Navigating", lists of exactly 3 generic adjectives
- Do NOT start every section with a heading — let ideas flow naturally between H2s
- Opinions are welcome. Take a light stance where appropriate
- Do NOT sound like a Wikipedia article or a corporate blog
- No emdashes, use simple hyphens instead

Format requirements:
1. Write in Markdown
2. Include a compelling H1 title at the top
3. Use H2 subheadings sparingly — only when the topic genuinely shifts
4. Length: 600–900 words
5. Include at least one relevant inline image: ![alt text](https://images.unsplash.com/photo-XXXXXXXX?w=800&q=80)
6. First line must be: COVER_IMAGE: <url> (before the # heading)
7. End naturally — no forced "conclusion" section

After the blog content, on separate lines, output:
TAGS: tag1, tag2, tag3, tag4, tag5
SEO_TITLE: (optimised title under 60 chars)
SEO_DESCRIPTION: (meta description under 160 chars)`

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
