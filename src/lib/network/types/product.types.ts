// product.types.ts — mirrors backend src/interfaces/product.interface.ts.

export type ProductCategory =
  | 'pants'
  | 'pads'
  | 'bundles'
  | 'education'
  | 'advocacy'
export type BadgeTone = 'pink' | 'coral' | 'ink'

// ── Embedded subdocuments ──

export interface ProductImage {
  _id: string
  url: string
  publicId: string
  alt: string
  order: number
}

export interface ProductVariant {
  _id: string
  /** Server-computed. Admin never enters this directly. */
  sku: string
  /** Option values for this variant. Keys correspond to entries in the
   *  parent product's `optionTypes`. Example: `{ Size: 'M', Color: 'Black' }`.
   *  Empty object for single-variant products. */
  options: Record<string, string>
  stockCount: number
  lowStockThreshold: number
  /** kobo. null means inherit from the product's basePriceB2C. */
  b2cPriceOverride: number | null
  /** kobo. null means inherit from the product's basePriceB2B. */
  b2bPriceOverride: number | null
  isActive: boolean
}

export interface ProductMetadata {
  badge?: string
  badgeTone?: BadgeTone
  rating?: number
  reviewCount?: number
}

/** Editable accordion sections on the PDP (Product details, Care, Shipping,
 *  etc.). Authored per product so the layout never shows copy that doesn't
 *  apply. */
export interface ProductAccordion {
  _id: string
  heading: string
  body: string
}

/** Icon shorthand for trust lines. Maps 1:1 to frontend icon components. */
export type TrustIcon = 'truck' | 'shield' | 'leaf' | 'star' | 'check' | 'mail'

/** Editable trust line shown above the accordion block on the PDP.
 *  Admin chooses the icon + writes the copy per product. */
export interface ProductTrustLine {
  _id: string
  icon: TrustIcon
  text: string
}

// ── Root product ──

export interface Product {
  _id?: string
  id: string
  slug: string
  name: string
  subheading: string
  shortDescription: string
  description: string
  category: ProductCategory
  /** kobo */
  basePriceB2C: number
  /** kobo */
  basePriceB2B: number
  /** kobo. null when not on sale. */
  salePrice: number | null
  /** Ordered list of option type names. Drives the PDP selector layout. */
  optionTypes: string[]
  images: ProductImage[]
  variants: ProductVariant[]
  accordions: ProductAccordion[]
  trustLines: ProductTrustLine[]
  metadata: ProductMetadata
  /** When false, the product is hidden from the public storefront. Admin
   *  still sees it (acts as a soft delete / pause). */
  isActive: boolean
  /** When true, the product stays visible on the storefront but Add to bag
   *  is disabled and a "Sold out" treatment renders — regardless of variant
   *  stockCount. Lets admin pause sales without zeroing inventory. */
  isSoldOut: boolean
  /** When true, the PDP renders a "Size guide" link that opens the pants
   *  size-chart dialog. Off by default — admin opts in per product. */
  showSizeGuide: boolean
  createdAt: string
  updatedAt: string
}

// ── Query params ──

export type ProductSort = 'price_asc' | 'price_desc' | 'newest' | 'featured'

export interface ProductListParams {
  category?: ProductCategory
  q?: string
  sort?: ProductSort
  page?: number
  pageSize?: number
}

// ── Admin DTOs ──

export interface ProductVariantInput {
  /** Optional — server computes from slug + options. Can be omitted. */
  sku?: string
  options: Record<string, string>
  stockCount: number
  lowStockThreshold: number
  b2cPriceOverride: number | null
  b2bPriceOverride: number | null
  isActive: boolean
}

export interface ProductAccordionInput {
  heading: string
  body: string
}

export interface ProductTrustLineInput {
  icon: TrustIcon
  text: string
}

export interface CreateProductInput {
  slug: string
  name: string
  subheading?: string
  shortDescription?: string
  description?: string
  category: ProductCategory
  basePriceB2C: number
  basePriceB2B: number
  salePrice?: number | null
  optionTypes?: string[]
  variants: ProductVariantInput[]
  accordions?: ProductAccordionInput[]
  trustLines?: ProductTrustLineInput[]
  metadata?: ProductMetadata
  isActive?: boolean
  isSoldOut?: boolean
  showSizeGuide?: boolean
}

export type UpdateProductInput = Partial<CreateProductInput>

// ── Response payloads ──

export interface ListProductsResponseData {
  items: Product[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ProductResponseData {
  product: Product
}

export interface ProductImageResponseData {
  product: Product
  image: ProductImage
}

export interface ReorderImagesPayload {
  orderedImageIds: string[]
}
