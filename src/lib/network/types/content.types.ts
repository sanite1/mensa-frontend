export type ContentKind = 'journal' | 'education'
export type ContentCategory = 'classroom' | 'product' | 'community' | 'policy' | 'care'

export interface ContentPost {
  _id: string
  slug: string
  kind: ContentKind
  title: string
  eyebrow: string
  category: ContentCategory
  excerpt: string
  body: string   // markdown
  coverImage?: { url: string; alt: string }
  authorName: string
  authorBio?: string
  readMinutes: number
  status: 'draft' | 'published'
  publishedAt?: string
  createdAt: string
  updatedAt: string
}
