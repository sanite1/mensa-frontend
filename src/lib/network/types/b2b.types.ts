export type B2BOrgType = 'school' | 'ngo' | 'council' | 'other'
export type B2BVerificationStatus = 'pending' | 'verified' | 'rejected'
export type CreditTerms = 'prepay' | 'net_15' | 'net_30'
export type QuoteStatus = 'submitted' | 'quoted' | 'accepted' | 'rejected' | 'fulfilled'

export interface B2BOrg {
  _id: string
  name: string
  type: B2BOrgType
  registrationNumber?: string
  contactName: string
  contactEmail: string
  contactPhone: string
  notes?: string
  verificationStatus: B2BVerificationStatus
  verificationNote?: string
  verifiedAt?: string | null
  verifiedBy?: string | null
  creditTerms: CreditTerms
  pricingTierId?: string | null
  createdAt: string
  updatedAt: string
}

export interface QuoteRequest {
  _id: string
  b2bOrgId: string
  requestedItems: Array<{ productId: string; variantId?: string; qty: number }>
  status: QuoteStatus
  quotedTotal?: number
  quotedExpiresAt?: string
  acceptedAt?: string
  resultingOrderId?: string
  createdAt: string
}
