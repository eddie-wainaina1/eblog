import { marked } from 'marked'

// Configure marked with safe defaults
marked.setOptions({
  gfm: true,       // GitHub-flavoured markdown
  breaks: true,    // Convert \n to <br>
})

export async function markdownToHtml(markdown: string): Promise<string> {
  return marked.parse(markdown)
}

export function generateExcerpt(markdown: string, maxLength = 160): string {
  // Strip markdown syntax to get plain text
  const plain = markdown
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/>\s+/g, '')
    .replace(/\n+/g, ' ')
    .trim()

  if (plain.length <= maxLength) return plain
  return plain.slice(0, maxLength).replace(/\s+\S*$/, '') + '…'
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
