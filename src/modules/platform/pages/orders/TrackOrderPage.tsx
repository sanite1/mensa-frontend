// ═══════════════════════════════════════════════════════════════
// /orders/track — public order lookup by order number + email.
//
// Same backend endpoint as the confirmation page (GET /orders/
// track/:orderNumber?email=...). The email acts as a soft PIN —
// both fields must match what was used at checkout.
// ═══════════════════════════════════════════════════════════════

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { OrderSummaryCard } from '@/modules/platform/components/OrderSummaryCard'

import { useTrackOrder } from '@/lib/network/api/order.api'

const lookupSchema = z.object({
  orderNumber: z
    .string()
    .trim()
    .regex(/^MS-\d{4}-\d{5}$/, 'Order numbers look like MS-2026-00001.'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required.')
    .email('Please enter the email you used at checkout.'),
})
type LookupValues = z.infer<typeof lookupSchema>

export function TrackOrderPage() {
  const [submitted, setSubmitted] = useState<LookupValues | null>(null)
  const form = useForm<LookupValues>({
    resolver: zodResolver(lookupSchema),
    defaultValues: { orderNumber: '', email: '' },
  })

  const trackQuery = useTrackOrder(submitted?.orderNumber, submitted?.email, !!submitted)
  const order = trackQuery.data?.data?.order

  const onSubmit = (values: LookupValues) => setSubmitted(values)

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 lg:py-16">
      <header className="mb-8">
        <p className="text-[11px] uppercase tracking-[0.12em] text-(--mute) font-medium">
          Track your order
        </p>
        <h1 className="mt-2 font-serif italic text-4xl text-(--ink)">Look up an order.</h1>
        <p className="mt-3 text-[15px] text-(--graphite) max-w-xl">
          Enter your order number and the email you used at checkout. Both came in your confirmation
          email.
        </p>
      </header>

      <div className="border border-(--hairline) bg-(--paper) p-6 lg:p-8 mb-10">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:items-end"
          >
            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Order number</FormLabel>
                  <FormControl>
                    <Input placeholder="MS-2026-00001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="sm:col-span-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full sm:w-auto"
                disabled={trackQuery.isFetching && !!submitted}
              >
                {trackQuery.isFetching && submitted ? 'Looking up…' : 'Find my order'}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      {submitted && trackQuery.isError ? (
        <div className="border border-(--coral) bg-(--coral-soft) px-4 py-5 text-[14px] text-(--ink)">
          No order matches that number and email combination. Double check both and try again.
        </div>
      ) : null}

      {order ? <OrderSummaryCard order={order} /> : null}
    </div>
  )
}
