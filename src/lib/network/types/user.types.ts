// user.types.ts — mirrors backend src/interfaces/user.interface.ts.

export interface UserAddress {
  _id: string
  label?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  country: string
  postal?: string
  isDefault: boolean
}

export interface UserAddressInput {
  label?: string
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state: string
  country?: string
  postal?: string
  /** When true, this address becomes the default and any existing default
   *  is demoted. First-ever address is auto-default regardless. */
  isDefault?: boolean
}

export type UpdateUserAddressInput = Partial<UserAddressInput>

export interface AddressesResponseData {
  addresses: UserAddress[]
}

export interface AddressResponseData {
  address: UserAddress
  addresses: UserAddress[]
}
