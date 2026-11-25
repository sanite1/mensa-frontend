// AddressForm, reusable address fieldset. Parent owns the RHF instance and schema.
// Fields mirror backend CheckoutAddressInput, country locked to "NG" while shipping is NG only.

import { useEffect } from 'react'
import { type FieldError, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { MField } from '@/components/design/MField'
import { NG_STATES } from '@/data/nigerian-states'
import { cn } from '@/lib/utils'

// ── Shared Zod schema, exported so the checkout page can compose it ──

export const addressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, 'Please enter the full name on the order.')
    .max(120, 'That name is too long.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{7,20}$/, 'Please enter a valid phone number.'),
  line1: z.string().trim().min(2, 'Street address is required.').max(200, 'Address is too long.'),
  line2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'City is required.').max(80, 'City is too long.'),
  state: z.string().trim().min(2, 'Please pick a delivery state.'),
  country: z.string().trim().default('NG'),
  postal: z.string().trim().max(20).optional().or(z.literal('')),
})

export type AddressValues = z.infer<typeof addressSchema>

// Optional empty defaults for parents to spread into useForm defaultValues.
export const emptyAddress: AddressValues = {
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  country: 'NG',
  postal: '',
}

interface AddressFormProps<TFieldValues extends FieldValues> {
  /** Parent react-hook-form instance. */
  form: UseFormReturn<TFieldValues>
  /** Dotted path prefix where the address sits inside the parent form.
   *  Default 'address'. */
  namePrefix?: Path<TFieldValues>
  /** Optional heading shown above the fieldset. */
  heading?: string
  /** Extra classes for the outer container. */
  className?: string
}

export function AddressForm<TFieldValues extends FieldValues>({
  form,
  namePrefix = 'address' as Path<TFieldValues>,
  heading,
  className,
}: AddressFormProps<TFieldValues>) {
  // Guard against blank country after rehydration, NG only for now.
  useEffect(() => {
    const countryPath = `${namePrefix}.country` as Path<TFieldValues>
    const current = form.getValues(countryPath)
    if (!current) {
      form.setValue(countryPath, 'NG' as TFieldValues[Path<TFieldValues>])
    }
  }, [form, namePrefix])

  const path = (suffix: string) => `${namePrefix}.${suffix}` as Path<TFieldValues>
  const reg = (suffix: string) => form.register(path(suffix))
  const err = (suffix: string): FieldError | undefined =>
    form.getFieldState(path(suffix), form.formState).error

  return (
    <section className={cn('grid gap-5', className)}>
      {heading ? <h2 className="text-(length:--fs-lg)">{heading}</h2> : null}
      <MField label="Full name" error={err('fullName')}>
        <input autoComplete="name" placeholder="Adaeze Okoro" {...reg('fullName')} />
      </MField>
      <MField label="Phone" error={err('phone')}>
        <input type="tel" autoComplete="tel" placeholder="0801 234 5678" {...reg('phone')} />
      </MField>
      <MField label="Street address" error={err('line1')}>
        <input
          autoComplete="address-line1"
          placeholder="12 Aminu Kano Crescent"
          {...reg('line1')}
        />
      </MField>
      <MField label="Apartment, suite, etc. (optional)" error={err('line2')}>
        <input autoComplete="address-line2" placeholder="Flat 4B" {...reg('line2')} />
      </MField>
      <div className="grid gap-5 sm:grid-cols-2">
        <MField label="City" error={err('city')}>
          <input autoComplete="address-level2" placeholder="Abuja" {...reg('city')} />
        </MField>
        <MField label="State" error={err('state')}>
          <select autoComplete="address-level1" {...reg('state')}>
            <option value="" disabled>
              Pick a state
            </option>
            {NG_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </MField>
      </div>
      <MField label="Postal code (optional)" error={err('postal')}>
        <input autoComplete="postal-code" placeholder="900288" {...reg('postal')} />
      </MField>
    </section>
  )
}
