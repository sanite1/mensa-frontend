// Shared shapes for the partner (individual / referral) programme.
// Mirrors backend interfaces/partner.interface.ts.

export type PartnerStatus =
  | 'pending'
  | 'approved'
  | 'active'
  | 'rejected'
  | 'suspended'

export type PartnerCommissionStatus =
  | 'pending'
  | 'available'
  | 'paid'
  | 'reversed'

export type PartnerPayoutStatus = 'pending' | 'paid' | 'rejected'

export interface PartnerBankAccount {
  accountName: string
  accountNumber: string
  bankName: string
  bankCode?: string
}

export interface PartnerSummary {
  _id: string
  userId: string | null
  name: string
  email: string
  phone: string
  socialHandle?: string
  notes?: string
  status: PartnerStatus
  rejectionReason?: string
  approvedAt?: string | null
  activatedAt?: string | null
  referralCode?: string
  commissionRate: number
  bankAccount?: PartnerBankAccount
  pendingBalanceKobo: number
  availableBalanceKobo: number
  lifetimeEarnedKobo: number
  lifetimePaidKobo: number
  createdAt: string
  updatedAt: string
}

export interface PartnerCommissionRow {
  _id: string
  orderNumber: string
  amountKobo: number
  status: PartnerCommissionStatus | string
  createdAt: string
  availableAt?: string | null
}

export interface PartnerPayoutRow {
  _id: string
  amountKobo: number
  status: PartnerPayoutStatus | string
  requestedAt: string
  processedAt?: string | null
  paymentReference?: string
}

export interface PartnerSelfDashboard {
  partner: {
    _id: string
    name: string
    email: string
    referralCode: string
    commissionRate: number
    status: PartnerStatus
    pendingBalanceKobo: number
    availableBalanceKobo: number
    lifetimeEarnedKobo: number
    lifetimePaidKobo: number
    bankAccount?: PartnerBankAccount
  }
  referralUrl: string
  minPayoutKobo: number
  recentCommissions: PartnerCommissionRow[]
  payoutRequests: PartnerPayoutRow[]
}

export interface AdminPayoutListItem {
  _id: string
  partnerId: string
  partnerName: string
  partnerEmail: string
  amountKobo: number
  status: PartnerPayoutStatus | string
  requestedAt: string
  processedAt?: string | null
  paymentReference?: string
  bankAccountSnapshot: PartnerBankAccount
}
