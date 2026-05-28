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
  verificationStatus: B2BVerificationStatus
  creditTerms: CreditTerms
  pricingTierId?: string
  createdAt: string
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
