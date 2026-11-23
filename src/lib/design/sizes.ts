// Ported from the Mensa design repo (lib/sizes.ts); ranges read "26 to 32" instead of using a dash.
// Period pant sizes: Mensa's own size chart, as published on the previous
// mensaproducts.com. Waist only, in inches, and the ranges overlap on purpose.
// 2XL and 3XL are made but have no published measurements, so the chart sends
// those customers to email rather than guessing.

export const PANT_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const
export type PantSize = (typeof PANT_SIZES)[number]

export interface SizeRow {
  size: PantSize
  /** Waist in inches, or null when there's no published measurement. */
  waist: [number, number] | null
}

export const SIZE_TABLE: SizeRow[] = [
  { size: 'S', waist: [26, 32] },
  { size: 'M', waist: [30, 36] },
  { size: 'L', waist: [35, 41] },
  { size: 'XL', waist: [37, 44] },
  { size: '2XL', waist: null },
  { size: '3XL', waist: null },
]

/** The largest waist on the chart, in inches. */
export const CHART_MAX_IN = 44
export const CHART_MIN_IN = 26
export const SIZE_EMAIL = 'hi@mensaproducts.com'

export type Unit = 'cm' | 'in'
export const CM_PER_IN = 2.54
/** Inches → the unit shown. cm rounded to whole numbers, inches to halves. */
export const fromInches = (inches: number, unit: Unit) =>
  unit === 'in' ? Math.round(inches * 2) / 2 : Math.round(inches * CM_PER_IN)
/** A value in `unit` → inches. */
export const toInches = (v: number, unit: Unit) => (unit === 'in' ? v : v / CM_PER_IN)
export const range = ([a, b]: [number, number], unit: Unit) =>
  `${fromInches(a, unit)} to ${fromInches(b, unit)}`
export const unitLabel = (unit: Unit) => (unit === 'in' ? '"' : ' cm')

export interface Recommendation {
  size: PantSize
  /** True when the waist sits where two sizes overlap: we sized up. */
  between: boolean
  /** True when the waist is past the chart: email us. */
  offChart: boolean
  note: string
}

/** Sizes whose range contains this waist (inches). */
export const sizesFor = (waistIn: number) =>
  SIZE_TABLE.filter((r) => r.waist && waistIn >= r.waist[0] && waistIn <= r.waist[1]).map(
    (r) => r.size,
  )

/**
 * The brand rule: on the boundary between two sizes, size up. A waist inside
 * one range gets that size; inside an overlap, the larger one. Null until a
 * waist is entered.
 */
export function recommendSize(waistIn: number): Recommendation | null {
  if (!(waistIn > 0)) return null
  if (waistIn < CHART_MIN_IN) {
    return {
      size: 'S',
      between: false,
      offChart: false,
      note: `Your waist is under ${CHART_MIN_IN}", so S is the snuggest fit we make.`,
    }
  }
  if (waistIn > CHART_MAX_IN) {
    return {
      size: '2XL',
      between: false,
      offChart: true,
      note: `Over ${CHART_MAX_IN}", you're in 2XL or 3XL. Email ${SIZE_EMAIL} with your waist measurement and we'll recommend the right one.`,
    }
  }
  const fits = sizesFor(waistIn)
  if (fits.length === 1)
    return {
      size: fits[0]!,
      between: false,
      offChart: false,
      note: `${fits[0]} fits your waist. It should feel like a hug, not a squeeze.`,
    }
  const larger = fits[fits.length - 1]!
  return {
    size: larger,
    between: true,
    offChart: false,
    note: `You're between ${fits.slice(0, -1).join(' and ')} and ${larger}: size up to ${larger} for comfort.`,
  }
}
