export type ProductCategory = 'pants' | 'pads' | 'bundles' | 'education'

export interface ProductImage {
  url: string
  publicId: string
  alt: string
  order: number
}

export interface ProductVariant {
  _id: string
  sku: string
  size: string
  stockCount: number
  lowStockThreshold: number
  b2cPriceOverride?: number
  b2bPriceOverride?: number
  active: boolean
}

export interface Product {
  _id: string
  slug: string
  name: string
  subheading: string
  description: string
  shortDescription: string
  category: ProductCategory
  basePriceB2C: number   // kobo
  basePriceB2B: number   // kobo
  salePrice?: number     // kobo
  images: ProductImage[]
  variants: ProductVariant[]
  active: boolean
  metadata: {
    badge?: string
    badgeTone?: 'pink' | 'coral' | 'ink'
    rating?: number
    reviewCount?: number
  }
  createdAt: string
  updatedAt: string
}

export interface ProductListParams {
  category?: ProductCategory
  q?: string
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'featured'
  page?: number
  pageSize?: number
}
