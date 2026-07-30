// AddressForm, reusable address fieldset. Parent owns the RHF instance and schema.
// Fields mirror backend CheckoutAddressInput, country locked to "NG" while shipping is NG only.

import { useEffect } from 'react'
import { type Control, type FieldValues, type Path, type UseFormReturn } from 'react-hook-form'
import { z } from 'zod'

import { Input } from '@/components/ui/input'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
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

  const control = form.control as unknown as Control<FieldValues>
  const path = (suffix: string) => `${namePrefix}.${suffix}` as Path<FieldValues>

  return (
    <section className={cn('flex flex-col gap-5', className)}>
      {heading ? <h2 className="font-serif italic text-2xl text-(--ink)">{heading}</h2> : null}

      <FormField
        control={control}
        name={path('fullName')}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Full name</FormLabel>
            <FormControl>
              <Input autoComplete="name" placeholder="Adaeze Okoro" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={path('phone')}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Phone</FormLabel>
            <FormControl>
              <Input type="tel" autoComplete="tel" placeholder="0801 234 5678" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={path('line1')}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Street address</FormLabel>
            <FormControl>
              <Input autoComplete="address-line1" placeholder="12 Aminu Kano Crescent" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={path('line2')}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Apartment, suite, etc. (optional)</FormLabel>
            <FormControl>
              <Input autoComplete="address-line2" placeholder="Flat 4B" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <FormField
          control={control}
          name={path('city')}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input autoComplete="address-level2" placeholder="Kubwa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={path('state')}
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>State</FormLabel>
              <FormControl>
                <select
                  autoComplete="address-level1"
                  className="flex h-11 w-full border border-(--hairline) bg-(--paper) px-3 py-2 text-[15px] text-(--ink) focus-visible:outline-none focus-visible:border-(--ink) disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  value={field.value ?? ''}
                >
                  <option value="" disabled>
                    Pick a state
                  </option>
                  {NG_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name={path('postal')}
        render={({ field }) => (
          <FormItem className="space-y-2">
            <FormLabel>Postal code (optional)</FormLabel>
            <FormControl>
              <Input autoComplete="postal-code" placeholder="900288" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section>
  )
}
