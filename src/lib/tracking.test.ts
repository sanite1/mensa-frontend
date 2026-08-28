import { describe, it, expect } from 'vitest'
import { estimatedDelivery, shortStatus, statusPillClasses } from './tracking'
import type { Order } from '@/lib/network/types/order.types'

/** Build a minimal Order shape just full enough for the tracking helpers
 *  to read. Anything not asserted on stays a sensible default. */
function makeOrder(overrides: Partial<Order> & { _id?: string } = {}): Order {
  return {
    _id: overrides._id ?? 'order_1',
    orderNumber: 'MS-2026-00001',
    source: 'web',
    userId: null,
    customerEmail: 'a@b.com',
    customerPhone: '+2348030000000',
    lines: [],
    address: {
      fullName: 'Ada',
      phone: '+2348030000000',
      line1: '1 Studio Rd',
      city: 'Abuja',
      state: 'FCT',
      country: 'NG',
    },
    totals: { subtotal: 2_500_000, shipping: 0, discount: 0, total: 2_500_000 },
    payment: { status: 'paid', reference: 'MS-2026-00001', paidAt: '2026-08-01T10:00:00Z' },
    fulfilment: { status: 'processing', shippingMethod: 'sendbox' },
    createdAt: '2026-08-01T09:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
    ...overrides,
  } as Order
}

describe('estimatedDelivery', () => {
  it('returns null for unpaid orders', () => {
    const order = makeOrder({ payment: { status: 'pending', reference: 'x' } })
    expect(estimatedDelivery(order)).toBeNull()
  })

  it('returns null for delivered orders', () => {
    const order = makeOrder({
      fulfilment: { status: 'delivered', shippingMethod: 'inhouse' },
    })
    expect(estimatedDelivery(order)).toBeNull()
  })

  it('returns null for cancelled orders', () => {
    const order = makeOrder({
      fulfilment: { status: 'cancelled', shippingMethod: 'sendbox' },
    })
    expect(estimatedDelivery(order)).toBeNull()
  })

  it('quotes 1-2 days for inhouse, anchored to paidAt before shipping', () => {
    const order = makeOrder({
      fulfilment: { status: 'processing', shippingMethod: 'inhouse' },
    })
    const eta = estimatedDelivery(order)
    expect(eta).not.toBeNull()
    expect(eta!.anchoredToShip).toBe(false)
    // 1 pack-out day + 1 minimum lead day = 2 days from paidAt for earliest
    expect(eta!.earliest.toISOString()).toBe('2026-08-03T10:00:00.000Z')
    // 1 + 2 max = 3 days from paidAt for latest
    expect(eta!.latest.toISOString()).toBe('2026-08-04T10:00:00.000Z')
  })

  it('quotes 2-5 days for sendbox, anchored to paidAt before shipping', () => {
    const order = makeOrder({
      fulfilment: { status: 'processing', shippingMethod: 'sendbox' },
    })
    const eta = estimatedDelivery(order)
    expect(eta).not.toBeNull()
    // 1 pack-out + 2 min = 3 days; 1 pack-out + 5 max = 6 days
    expect(eta!.earliest.toISOString()).toBe('2026-08-04T10:00:00.000Z')
    expect(eta!.latest.toISOString()).toBe('2026-08-07T10:00:00.000Z')
  })

  it('flips to anchoredToShip=true once shippedAt is set, no pack-out pad', () => {
    const order = makeOrder({
      fulfilment: {
        status: 'shipped',
        shippingMethod: 'sendbox',
        shippedAt: '2026-08-02T10:00:00Z',
      },
    })
    const eta = estimatedDelivery(order)
    expect(eta).not.toBeNull()
    expect(eta!.anchoredToShip).toBe(true)
    // No pack-out cushion once shipped. 2-5 days from shippedAt.
    expect(eta!.earliest.toISOString()).toBe('2026-08-04T10:00:00.000Z')
    expect(eta!.latest.toISOString()).toBe('2026-08-07T10:00:00.000Z')
  })
})

describe('shortStatus', () => {
  it('reports awaiting payment for pending payment', () => {
    expect(shortStatus(makeOrder({ payment: { status: 'pending', reference: 'x' } }))).toBe(
      'Awaiting payment',
    )
  })

  it('reports payment failed', () => {
    expect(shortStatus(makeOrder({ payment: { status: 'failed', reference: 'x' } }))).toBe(
      'Payment failed',
    )
  })

  it('reports the fulfilment stage when paid', () => {
    expect(
      shortStatus(makeOrder({ fulfilment: { status: 'shipped', shippingMethod: 'sendbox' } })),
    ).toBe('Shipped')
    expect(
      shortStatus(makeOrder({ fulfilment: { status: 'delivered', shippingMethod: 'sendbox' } })),
    ).toBe('Delivered')
  })
})

describe('statusPillClasses', () => {
  it('uses ok tone for delivered', () => {
    expect(
      statusPillClasses(
        makeOrder({ fulfilment: { status: 'delivered', shippingMethod: 'sendbox' } }),
      ),
    ).toContain('text-ok')
  })

  it('uses pink fill for shipped', () => {
    expect(
      statusPillClasses(
        makeOrder({ fulfilment: { status: 'shipped', shippingMethod: 'sendbox' } }),
      ),
    ).toContain('bg-pink')
  })

  it('uses blush for cancelled', () => {
    expect(
      statusPillClasses(
        makeOrder({ fulfilment: { status: 'cancelled', shippingMethod: 'sendbox' } }),
      ),
    ).toContain('bg-blush')
  })
})
