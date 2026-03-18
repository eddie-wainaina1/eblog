import mongoose, { Schema, Document, Model } from 'mongoose'

export type BlogStatus = 'draft' | 'pending' | 'published'
export type BlogOrigin = 'admin' | 'ai'

export interface IBlog extends Document {
  title: string
  slug: string
  content: string       // markdown source
  htmlContent: string   // converted HTML
  excerpt: string
  coverImage: string
  tags: string[]
  status: BlogStatus
  origin: BlogOrigin    // who created it: 'admin' or 'ai'
  author: string        // displayed author — set to reviewer's email on publish
  seoTitle: string
  seoDescription: string
  publishedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    content: { type: String, required: true },
    htmlContent: { type: String, required: true },
    excerpt: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    tags: [{ type: String, trim: true, lowercase: true }],
    status: { type: String, enum: ['draft', 'pending', 'published'], default: 'draft' },
    origin: { type: String, enum: ['admin', 'ai'], default: 'admin' },
    author: { type: String, default: '' },
    seoTitle: { type: String, default: '' },
    seoDescription: { type: String, default: '' },
    publishedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

BlogSchema.index({ slug: 1 })
BlogSchema.index({ status: 1, publishedAt: -1 })
BlogSchema.index({ tags: 1 })

const Blog: Model<IBlog> = mongoose.models.Blog ?? mongoose.model<IBlog>('Blog', BlogSchema)
export default Blog
