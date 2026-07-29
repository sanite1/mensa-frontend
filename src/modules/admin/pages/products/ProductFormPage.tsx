// ═══════════════════════════════════════════════════════════════
// /products/new and /products/:slug/edit
//
// Single page handles both modes. When :slug is present, it
// fetches the product, populates the form, and renders the image
// uploader. On /products/new, the form is blank and the image
// section is hidden (images require an existing product to attach
// to — admin is redirected to /edit after a successful create).
// ═══════════════════════════════════════════════════════════════
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Plus, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { confirm } from '@/components/ui/confirm'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { cn, koboToNaira, nairaToKobo } from '@/lib/utils'
import {
  useAdminProduct,
  useCreateProduct,
  useDeleteProduct,
  useRemoveProductImage,
  useUpdateProduct,
  useUploadProductImage,
} from '@/lib/network/api/product.api'
import type {
  CreateProductInput,
  ProductAccordion,
  ProductAccordionInput,
  ProductCategory,
  // ProductImage,
  ProductTrustLine,
  ProductTrustLineInput,
  ProductVariant,
  ProductVariantInput,
  TrustIcon,
} from '@/lib/network/types/product.types'

// ── Zod schema ─────────────────────────────────────────────────────────

const accordionSchema = z.object({
  _id: z.string().optional(),
  heading: z
    .string()
    .min(1, 'Heading is required.')
    .max(80, 'Heading must be 80 characters or fewer.'),
  body: z.string().min(1, 'Body is required.').max(4000, 'Body must be 4000 characters or fewer.'),
})

const trustLineSchema = z.object({
  _id: z.string().optional(),
  icon: z.enum(['truck', 'shield', 'leaf', 'star', 'check', 'mail']),
  text: z
    .string()
    .min(1, 'Trust line text is required.')
    .max(200, 'Trust line must be 200 characters or fewer.'),
})

const TRUST_ICON_OPTIONS: { value: TrustIcon; label: string }[] = [
  { value: 'truck', label: 'Truck (shipping)' },
  { value: 'shield', label: 'Shield (guarantee)' },
  { value: 'leaf', label: 'Leaf (sustainability)' },
  { value: 'mail', label: 'Mail (digital / contact)' },
  { value: 'star', label: 'Star (quality)' },
  { value: 'check', label: 'Check (generic)' },
]

const variantSchema = z.object({
  _id: z.string().optional(),
  /** Option values keyed by option type name. Server computes the SKU from
   *  product slug + these values, so we don't ask for a SKU in the form. */
  options: z.record(z.string(), z.string()).default({}),
  stockCount: z.number().int().min(0, 'Stock cannot be negative.'),
  lowStockThreshold: z.number().int().min(0).default(5),
  b2cPriceOverrideNaira: z.number().min(0).nullable().default(null),
  b2bPriceOverrideNaira: z.number().min(0).nullable().default(null),
  isActive: z.boolean().default(true),
})

const formSchema = z.object({
  name: z.string().min(1, 'Name is required.').max(160),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and dashes.'),
  category: z.enum(['pants', 'pads', 'bundles', 'education']),
  subheading: z.string().max(220).default(''),
  shortDescription: z.string().max(280).default(''),
  description: z.string().default(''),
  basePriceB2CNaira: z.number().min(0, 'Price cannot be negative.'),
  basePriceB2BNaira: z.number().min(0, 'Price cannot be negative.'),
  salePriceNaira: z.number().min(0).nullable().default(null),
  badge: z.string().max(40).default(''),
  badgeTone: z.enum(['pink', 'coral', 'ink']).default('pink'),
  optionTypes: z.array(z.string().trim().min(1).max(40)).default([]),
  variants: z.array(variantSchema).min(1, 'Add at least one variant.'),
  accordions: z.array(accordionSchema).default([]),
  trustLines: z.array(trustLineSchema).default([]),
  isActive: z.boolean().default(true),
  isSoldOut: z.boolean().default(false),
  showSizeGuide: z.boolean().default(false),
})

type FormValues = z.infer<typeof formSchema>

// ── Defaults ───────────────────────────────────────────────────────────

const blankVariant = (): FormValues['variants'][number] => ({
  options: {},
  stockCount: 0,
  lowStockThreshold: 5,
  b2cPriceOverrideNaira: null,
  b2bPriceOverrideNaira: null,
  isActive: true,
})

const blankAccordion = (): FormValues['accordions'][number] => ({
  heading: '',
  body: '',
})

const blankTrustLine = (): FormValues['trustLines'][number] => ({
  icon: 'truck',
  text: '',
})

const defaultValues: FormValues = {
  name: '',
  slug: '',
  category: 'pants',
  subheading: '',
  shortDescription: '',
  description: '',
  basePriceB2CNaira: 0,
  basePriceB2BNaira: 0,
  salePriceNaira: null,
  badge: '',
  badgeTone: 'pink',
  optionTypes: [],
  variants: [],
  accordions: [],
  trustLines: [],
  isActive: true,
  isSoldOut: false,
  showSizeGuide: false,
}

// ── SKU helper ─────────────────────────────────────────────────────────

/** Mirror of mensa-backend/src/helpers/sku.ts so the form can show the same
 *  SKU the server will compute on save. */
function skuToken(value: string): string {
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function previewSku(slug: string, optionTypes: string[], options: Record<string, string>): string {
  const slugPart = skuToken(slug || 'PRODUCT')
  if (optionTypes.length === 0) return slugPart
  const valueParts = optionTypes
    .map((t: string) => options[t])
    .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
    .map(skuToken)
  if (valueParts.length === 0) return slugPart
  return `${slugPart}-${valueParts.join('-')}`
}

// ── Slug helpers ───────────────────────────────────────────────────────

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)

// ═══════════════════════════════════════════════════════════════
//  Page
// ═══════════════════════════════════════════════════════════════

export function ProductFormPage() {
  const { slug: slugParam } = useParams<{ slug: string }>()
  const isEditMode = !!slugParam
  const navigate = useNavigate()

  const productQuery = useAdminProduct(slugParam)
  const createMutation = useCreateProduct()
  const updateMutation = useUpdateProduct()
  const deleteMutation = useDeleteProduct()
  const uploadMutation = useUploadProductImage()

  // Pending image files for create mode. Held in local state with object URL
  // previews until the product exists and they can be uploaded to Cloudinary.
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([])

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      pendingImages.forEach((p: { file: File; preview: string }) => URL.revokeObjectURL(p.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addPendingImage = (file: File) => {
    setPendingImages((prev) => [...prev, { file, preview: URL.createObjectURL(file) }])
  }

  const removePendingImage = (index: number) => {
    setPendingImages((prev: { file: File; preview: string }[]) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_: { file: File; preview: string }, i: number) => i !== index)
    })
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'variants',
  })

  const accordionFields = useFieldArray({
    control: form.control,
    name: 'accordions',
  })

  const trustLineFields = useFieldArray({
    control: form.control,
    name: 'trustLines',
  })

  // Track whether the user has manually edited the slug. If not, keep it in
  // sync with the name (create mode only).
  const slugManuallyEdited = useRef(false)
  const nameValue = form.watch('name')
  const slugValue = form.watch('slug')

  useEffect(() => {
    if (isEditMode) return
    if (slugManuallyEdited.current) return
    const generated = slugify(nameValue || '')
    if (generated !== slugValue) {
      form.setValue('slug', generated, { shouldValidate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nameValue, isEditMode])

  // Populate form when editing.
  const product = productQuery.data?.data?.product
  useEffect(() => {
    if (!product || !isEditMode) return
    form.reset({
      name: product.name,
      slug: product.slug,
      category: product.category,
      subheading: product.subheading,
      shortDescription: product.shortDescription,
      description: product.description,
      basePriceB2CNaira: koboToNaira(product.basePriceB2C),
      basePriceB2BNaira: koboToNaira(product.basePriceB2B),
      salePriceNaira: product.salePrice != null ? koboToNaira(product.salePrice) : null,
      badge: product.metadata?.badge ?? '',
      badgeTone: product.metadata?.badgeTone ?? 'pink',
      optionTypes: product.optionTypes ?? [],
      variants: (product.variants ?? []).map((v: ProductVariant) => ({
        _id: v._id,
        options: v.options ?? {},
        stockCount: v.stockCount,
        lowStockThreshold: v.lowStockThreshold,
        b2cPriceOverrideNaira: v.b2cPriceOverride != null ? koboToNaira(v.b2cPriceOverride) : null,
        b2bPriceOverrideNaira: v.b2bPriceOverride != null ? koboToNaira(v.b2bPriceOverride) : null,
        isActive: v.isActive,
      })),
      accordions: (product.accordions ?? []).map((a: ProductAccordion) => ({
        _id: a._id,
        heading: a.heading,
        body: a.body,
      })),
      trustLines: (product.trustLines ?? []).map((t: ProductTrustLine) => ({
        _id: t._id,
        icon: t.icon,
        text: t.text,
      })),
      isActive: product.isActive,
      isSoldOut: product.isSoldOut ?? false,
      showSizeGuide: product.showSizeGuide ?? false,
    })
    slugManuallyEdited.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, isEditMode])

  // ── Submit ──────────────────────────────────────────────────────────
  const onSubmit = (values: FormValues) => {
    const variants: ProductVariantInput[] = values.variants.map(
      (v: FormValues['variants'][number]) => {
        // Strip any option keys that aren't in the product's option types,
        // and trim values, so the payload matches what the backend expects.
        const cleanedOptions: Record<string, string> = {}
        for (const type of values.optionTypes) {
          const raw = v.options?.[type]
          if (typeof raw === 'string' && raw.trim()) cleanedOptions[type] = raw.trim()
        }
        return {
          options: cleanedOptions,
          stockCount: v.stockCount,
          lowStockThreshold: v.lowStockThreshold,
          b2cPriceOverride:
            v.b2cPriceOverrideNaira != null ? nairaToKobo(v.b2cPriceOverrideNaira) : null,
          b2bPriceOverride:
            v.b2bPriceOverrideNaira != null ? nairaToKobo(v.b2bPriceOverrideNaira) : null,
          isActive: v.isActive,
        }
      },
    )

    const accordions: ProductAccordionInput[] = values.accordions.map(
      (a: FormValues['accordions'][number]) => ({
        heading: a.heading.trim(),
        body: a.body.trim(),
      }),
    )

    const trustLines: ProductTrustLineInput[] = values.trustLines.map(
      (t: FormValues['trustLines'][number]) => ({
        icon: t.icon,
        text: t.text.trim(),
      }),
    )

    const payload: CreateProductInput = {
      slug: values.slug,
      name: values.name.trim(),
      subheading: values.subheading.trim(),
      shortDescription: values.shortDescription.trim(),
      description: values.description,
      category: values.category,
      basePriceB2C: nairaToKobo(values.basePriceB2CNaira),
      basePriceB2B: nairaToKobo(values.basePriceB2BNaira),
      salePrice: values.salePriceNaira != null ? nairaToKobo(values.salePriceNaira) : null,
      optionTypes: values.optionTypes,
      variants,
      accordions,
      trustLines,
      metadata: values.badge.trim()
        ? { badge: values.badge.trim(), badgeTone: values.badgeTone }
        : {},
      isActive: values.isActive,
      isSoldOut: values.isSoldOut,
      showSizeGuide: values.showSizeGuide,
    }

    if (isEditMode && slugParam) {
      updateMutation.mutate(
        { slug: slugParam, payload },
        {
          onSuccess: (res) => {
            // If the slug changed, route to the new edit URL.
            const newSlug = res.data?.product.slug
            if (newSlug && newSlug !== slugParam) {
              navigate(`/products/${newSlug}/edit`, { replace: true })
            }
          },
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: async (res) => {
          const newSlug = res.data?.product.slug
          if (!newSlug) return

          // If the admin selected images during create, upload them now that
          // the product exists. Sequential so we don't slam Cloudinary, and
          // failures don't block the rest from uploading.
          if (pendingImages.length > 0) {
            for (const { file } of pendingImages) {
              try {
                await uploadMutation.mutateAsync({ slug: newSlug, file })
              } catch {
                // Per-image errors already toast via the hook. Continue with
                // the rest so a single bad file doesn't strand the others.
              }
            }
            // Clear local previews — the real images are now on the product.
            pendingImages.forEach((p: { file: File; preview: string }) =>
              URL.revokeObjectURL(p.preview),
            )
            setPendingImages([])
          }

          navigate(`/products/${newSlug}/edit`, { replace: true })
        },
      })
    }
  }

  const onDelete = async () => {
    if (!slugParam) return
    const ok = await confirm({
      title: `Archive "${product?.name ?? slugParam}"?`,
      description:
        'It will be hidden from the shop but kept in the catalogue. You can reactivate later.',
      confirmLabel: 'Archive',
      tone: 'destructive',
    })
    if (!ok) return
    deleteMutation.mutate(slugParam, {
      onSuccess: () => navigate('/products'),
    })
  }

  // ── Loading / not found ─────────────────────────────────────────────
  if (isEditMode && productQuery.isLoading) {
    return <div className="px-4 md:px-8 py-6 md:py-10 t-body text-mute">Loading…</div>
  }
  if (isEditMode && (productQuery.isError || !product)) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-10">
        <p className="t-body text-graphite mb-4">Product not found.</p>
        <Button asChild variant="secondary">
          <Link to="/products">Back to catalogue</Link>
        </Button>
      </div>
    )
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-240">
      {/* Header */}
      <div className="flex items-start justify-between gap-6 flex-wrap mb-8">
        <div>
          <Link
            to="/products"
            className="t-eyebrow text-mute hover:text-ink no-underline mb-3 inline-block"
          >
            ← Catalogue
          </Link>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,5vw,48px)] leading-[1.02] tracking-tight text-ink">
            {isEditMode ? (product?.name ?? 'Edit product') : 'New product'}
          </h1>
          {isEditMode ? (
            <p className="t-body-s mt-2 text-mute font-mono tracking-[0.06em]">{product?.slug}</p>
          ) : null}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-8">
          {/* ── Basics ──────────────────────────────────────────────── */}
          <Section title="Basics" eyebrow="01">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Pack of 5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="pack-of-5-pants"
                        {...field}
                        onChange={(e) => {
                          slugManuallyEdited.current = true
                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Lowercase letters, numbers, and dashes. Appears in the URL.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <SelectInput
                        value={field.value}
                        onChange={(v) => field.onChange(v as ProductCategory)}
                        options={[
                          { value: 'pants', label: 'Period pants' },
                          { value: 'pads', label: 'Reusable pads' },
                          { value: 'bundles', label: 'Bundles' },
                          { value: 'education', label: 'Education' },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visibility</FormLabel>
                    <FormControl>
                      <SelectInput
                        value={field.value ? 'active' : 'archived'}
                        onChange={(v) => field.onChange(v === 'active')}
                        options={[
                          { value: 'active', label: 'Visible on storefront' },
                          { value: 'archived', label: 'Hidden from storefront' },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isSoldOut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stock state</FormLabel>
                    <FormControl>
                      <SelectInput
                        value={field.value ? 'sold_out' : 'available'}
                        onChange={(v) => field.onChange(v === 'sold_out')}
                        options={[
                          { value: 'available', label: 'Available to buy' },
                          {
                            value: 'sold_out',
                            label: 'Mark as sold out (inventory unchanged)',
                          },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Forces a sold out treatment on the storefront without touching the variant
                      stock counts.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="showSizeGuide"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Size guide link</FormLabel>
                    <FormControl>
                      <SelectInput
                        value={field.value ? 'show' : 'hide'}
                        onChange={(v) => field.onChange(v === 'show')}
                        options={[
                          { value: 'hide', label: 'Do not show on this product' },
                          { value: 'show', label: 'Show size guide link on the PDP' },
                        ]}
                      />
                    </FormControl>
                    <FormDescription>
                      Adds a small Size guide link above the size picker that opens the pants
                      size chart. Turn on for pants and bundles; leave off for pads, books, etc.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          {/* ── Editorial copy ──────────────────────────────────────── */}
          <Section title="Editorial copy" eyebrow="02">
            <div className="flex flex-col gap-5">
              <FormField
                control={form.control}
                name="subheading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subheading</FormLabel>
                    <FormControl>
                      <Input placeholder="A full cycle, sorted." {...field} />
                    </FormControl>
                    <FormDescription>One short line under the product name.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short description</FormLabel>
                    <FormControl>
                      <Input placeholder="Five pairs. Light to heavy days." {...field} />
                    </FormControl>
                    <FormDescription>Shown on cards and meta tags.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <TextArea
                        rows={6}
                        placeholder="Full product description shown on the PDP. Markdown is supported in later sprints."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          {/* ── Pricing ─────────────────────────────────────────────── */}
          <Section title="Pricing" eyebrow="03">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="basePriceB2CNaira"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base B2C price (₦)</FormLabel>
                    <FormControl>
                      <NairaInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="basePriceB2BNaira"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base B2B price (₦)</FormLabel>
                    <FormControl>
                      <NairaInput value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormDescription>Wholesale rate for partnerships.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="salePriceNaira"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sale price (₦, optional)</FormLabel>
                    <FormControl>
                      <NairaInput value={field.value} onChange={field.onChange} allowEmpty />
                    </FormControl>
                    <FormDescription>Leave blank when not on sale.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          {/* ── Badge ───────────────────────────────────────────────── */}
          <Section title="Badge" eyebrow="04">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="badge"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge label</FormLabel>
                    <FormControl>
                      <Input placeholder="Bestseller" {...field} />
                    </FormControl>
                    <FormDescription>Leave blank to hide the badge.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="badgeTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge tone</FormLabel>
                    <FormControl>
                      <SelectInput
                        value={field.value}
                        onChange={(v) => field.onChange(v as 'pink' | 'coral' | 'ink')}
                        options={[
                          { value: 'pink', label: 'Pink' },
                          { value: 'coral', label: 'Coral' },
                          { value: 'ink', label: 'Ink' },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </Section>

          {/* ── Variants ────────────────────────────────────────────── */}
          <VariantsSection form={form} fields={fields} append={append} remove={remove} />

          {/* ── Detail sections (accordions) ──────────────────────── */}
          <Section
            title="Detail sections"
            eyebrow="06"
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => accordionFields.append(blankAccordion())}
              >
                <Plus size={14} strokeWidth={2} />
                Add section
              </Button>
            }
          >
            {accordionFields.fields.length === 0 ? (
              <div className="border border-dashed border-hairline bg-cream-soft py-8 px-6 text-center">
                <p className="t-body-s text-mute mb-1">
                  No sections yet. Add things like "Product details", "Care instructions", or
                  "Shipping and returns".
                </p>
                <p className="t-body-s text-mute">
                  They appear as collapsible accordions on the product page.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {accordionFields.fields.map((field, index) => (
                  <AccordionRow
                    key={field.id}
                    index={index}
                    onRemove={() => accordionFields.remove(index)}
                    form={form}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* ── Trust lines ──────────────────────────────────────── */}
          <Section
            title="Trust lines"
            eyebrow="07"
            action={
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => trustLineFields.append(blankTrustLine())}
              >
                <Plus size={14} strokeWidth={2} />
                Add trust line
              </Button>
            }
          >
            {trustLineFields.fields.length === 0 ? (
              <div className="border border-dashed border-hairline bg-cream-soft py-8 px-6 text-center">
                <p className="t-body-s text-mute mb-1">
                  No trust lines yet. Add one liners with icons that go above the accordion block on
                  the PDP.
                </p>
                <p className="t-body-s text-mute">
                  Common picks: shipping time, comfort guarantee, longevity.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {trustLineFields.fields.map((field, index) => (
                  <TrustLineRow
                    key={field.id}
                    index={index}
                    onRemove={() => trustLineFields.remove(index)}
                    form={form}
                  />
                ))}
              </div>
            )}
          </Section>

          {/* ── Images ───────────────────────────────────────────────
              Edit mode: hits Cloudinary directly via the upload hook.
              Create mode: holds File objects locally with object URL
              previews; uploaded after the product is created. */}
          {isEditMode && product ? (
            <ImagesSection slug={product.slug} images={product.images ?? []} eyebrow="08" />
          ) : (
            <PendingImagesSection
              eyebrow="08"
              pending={pendingImages}
              onAdd={addPendingImage}
              onRemove={removePendingImage}
            />
          )}

          {/* ── Footer actions ──────────────────────────────────────── */}
          <div className="flex items-center justify-between gap-4 flex-wrap pt-4 border-t border-hairline-soft">
            {isEditMode ? (
              <Button
                type="button"
                variant="ghost"
                size="default"
                onClick={onDelete}
                disabled={deleteMutation.isPending}
                className="text-err hover:bg-blush"
              >
                <Trash2 size={14} strokeWidth={1.6} />
                {deleteMutation.isPending ? 'Archiving…' : 'Archive product'}
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              <Button asChild variant="secondary" size="default">
                <Link to="/products">Cancel</Link>
              </Button>
              <Button type="submit" variant="primary" size="default" disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? 'Saving…'
                    : 'Creating…'
                  : isEditMode
                    ? 'Save changes'
                    : 'Create product'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Section wrapper
// ═══════════════════════════════════════════════════════════════
function Section({
  title,
  eyebrow,
  action,
  children,
}: {
  title: string
  eyebrow: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="border border-hairline-soft bg-paper p-4 md:p-6 lg:p-8">
      <div className="flex items-start justify-between gap-4 mb-5">
        <div>
          <div className="t-eyebrow text-mute mb-1">{eyebrow}</div>
          <h2 className="font-display italic font-semibold text-[24px] leading-[1.1] text-ink">
            {title}
          </h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Variants section
//
//  Lifted to its own component so we can react to changes in
//  `optionTypes` from inside it (via form.watch) without rerunning
//  the whole page component on every keystroke. Empty state guides
//  the admin: define option types first, then add variants. A
//  sizeless escape hatch (single variant with no option types) is
//  inlined under the empty state for products like books.
// ═══════════════════════════════════════════════════════════════
function VariantsSection({
  form,
  fields,
  append,
  remove,
}: {
  form: ReturnType<typeof useForm<FormValues>>
  fields: ReturnType<typeof useFieldArray<FormValues, 'variants'>>['fields']
  append: ReturnType<typeof useFieldArray<FormValues, 'variants'>>['append']
  remove: ReturnType<typeof useFieldArray<FormValues, 'variants'>>['remove']
}) {
  const optionTypes = form.watch('optionTypes') ?? []
  const hasOptionTypes = optionTypes.length > 0
  const hasVariants = fields.length > 0
  // Add variant is only useful once the admin has either declared
  // option types (so the variant row knows what fields to show) or
  // already added at least one variant.
  const addVariantEnabled = hasOptionTypes || hasVariants

  return (
    <Section
      title="Variants"
      eyebrow="05"
      action={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append(blankVariant())}
          disabled={!addVariantEnabled}
          title={!addVariantEnabled ? 'Define an option type above first.' : undefined}
        >
          <Plus size={14} strokeWidth={2} />
          Add variant
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <OptionTypesField form={form} />

        {hasVariants ? (
          fields.map((field, index) => (
            <VariantRow
              key={field.id}
              index={index}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
              form={form}
            />
          ))
        ) : (
          <div className="border border-dashed border-hairline bg-cream-soft py-8 px-6 text-center">
            <p className="t-body-s text-mute mb-2 font-medium">No variants yet.</p>
            {hasOptionTypes ? (
              <p className="t-body-s text-mute mb-3">
                Click <strong className="text-ink">Add variant</strong> to create the first one.
                Each variant gets a field per option type ({optionTypes.join(', ')}).
              </p>
            ) : (
              <>
                <p className="t-body-s text-mute mb-3">
                  Define option types above (Size, Color, etc.), then click{' '}
                  <strong className="text-ink">Add variant</strong>. Each variant gets one field per
                  option type.
                </p>
                <button
                  type="button"
                  onClick={() => append(blankVariant())}
                  className="text-[13px] text-ink underline underline-offset-2 hover:text-pink-deep"
                >
                  Or add a single variant for a no option product (books, sizeless).
                </button>
              </>
            )}
          </div>
        )}

        {form.formState.errors.variants?.root ? (
          <p className="t-body-s text-err">{form.formState.errors.variants.root.message}</p>
        ) : null}
      </div>
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Option types field — local string state, commits on blur
//
//  Editing the optionTypes array on every keystroke causes variant rows
//  to remount their option inputs (each keyed by type name) and confuses
//  react-hook-form's register/unregister cycle. By keeping the raw text
//  in local state and only writing the parsed array to the form on blur,
//  variant rows update once, not on every character.
// ═══════════════════════════════════════════════════════════════
function OptionTypesField({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  const arrayValue = form.watch('optionTypes') ?? []
  // String key to detect external resets (e.g. when switching products).
  const externalString = arrayValue.join(', ')
  const [text, setText] = useState(externalString)

  useEffect(() => {
    setText(externalString)
  }, [externalString])

  const commit = () => {
    const parsed = text
      .split(',')
      .map((t: string) => t.trim())
      .filter(Boolean)
    form.setValue('optionTypes', parsed, { shouldDirty: true })
  }

  // Plain wrappers (not FormItem/FormControl/FormLabel) because the optional
  // optionTypes field isn't wrapped in a FormField — those shadcn components
  // require a FormFieldContext and throw without one.
  return (
    <div className="flex flex-col gap-2">
      <Label>Option types</Label>
      <Input
        placeholder="Size, Color"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
      />
      <p className="text-[12.5px] text-(--mute) leading-relaxed">
        Comma separated. Leave blank for single variant products. Each variant below gets one input
        per option type, and the SKU is computed from your slug plus the option values.
      </p>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Variant row
// ═══════════════════════════════════════════════════════════════
function VariantRow({
  index,
  onRemove,
  canRemove,
  form,
}: {
  index: number
  onRemove: () => void
  canRemove: boolean
  form: ReturnType<typeof useForm<FormValues>>
}) {
  const optionTypes = form.watch('optionTypes') ?? []
  const slug = form.watch('slug') ?? ''
  const variantOptions = form.watch(`variants.${index}.options`) ?? {}
  const computedSku = previewSku(slug, optionTypes, variantOptions)

  return (
    <div className="border border-hairline-soft bg-cream-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="t-eyebrow text-mute tracking-[0.12em]">
          Variant {index + 1}
          <span className="ml-3 text-mute font-mono text-[10.5px] tracking-[0.06em] normal-case">
            SKU · {computedSku}
          </span>
        </div>
        {canRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-mute hover:text-err"
            aria-label="Remove variant"
          >
            <X size={16} strokeWidth={1.6} />
          </button>
        ) : null}
      </div>

      {/* Option value inputs — one per declared option type. Each input
          registers a nested field path; react-hook-form holds the value via
          ref so we don't fight a controlled re-render on every keystroke.
          Plain wrappers (not shadcn FormItem/FormControl) because there's
          no FormField context for these dynamic field names. */}
      {optionTypes.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {optionTypes.map((type: string) => (
            <div key={type} className="flex flex-col gap-2">
              <Label>{type}</Label>
              <Input
                placeholder={type === 'Size' ? 'M' : type === 'Color' ? 'Black' : type}
                defaultValue={variantOptions[type] ?? ''}
                {...form.register(
                  // The Zod schema types `options` as Record<string, string>
                  // so dynamic keys are valid at runtime, but the TS
                  // Path<FormValues> doesn't enumerate every string. Cast.
                  `variants.${index}.options.${type}` as `variants.${number}.options.${string}`,
                )}
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* Stock + status inputs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FormField
          control={form.control}
          name={`variants.${index}.stockCount`}
          render={({ field }) => (
            <FormItem>
              <Label>Stock</Label>
              <FormControl>
                <NumberInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.lowStockThreshold`}
          render={({ field }) => (
            <FormItem>
              <Label>Low alert</Label>
              <FormControl>
                <NumberInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`variants.${index}.isActive`}
          render={({ field }) => (
            <FormItem>
              <Label>Active</Label>
              <FormControl>
                <SelectInput
                  value={field.value ? 'yes' : 'no'}
                  onChange={(v) => field.onChange(v === 'yes')}
                  options={[
                    { value: 'yes', label: 'Yes' },
                    { value: 'no', label: 'No' },
                  ]}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Accordion row (Product details / Care instructions / etc.)
// ═══════════════════════════════════════════════════════════════
function AccordionRow({
  index,
  onRemove,
  form,
}: {
  index: number
  onRemove: () => void
  form: ReturnType<typeof useForm<FormValues>>
}) {
  const placeholderHeading =
    index === 0
      ? 'Product details'
      : index === 1
        ? 'Care instructions'
        : index === 2
          ? 'Shipping and returns'
          : 'Section heading'

  const placeholderBody =
    index === 0
      ? 'Fabric, materials, dimensions, what makes this product special.'
      : index === 1
        ? 'How to wash, dry, and care for this product so it lasts.'
        : index === 2
          ? 'Where it ships from, how long it takes, return policy.'
          : 'Section content, shown when the user expands the accordion.'

  return (
    <div className="border border-hairline-soft bg-cream-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="t-eyebrow text-mute tracking-[0.12em]">Section {index + 1}</div>
        <button
          type="button"
          onClick={onRemove}
          className="text-mute hover:text-err"
          aria-label="Remove section"
        >
          <X size={16} strokeWidth={1.6} />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        <FormField
          control={form.control}
          name={`accordions.${index}.heading`}
          render={({ field }) => (
            <FormItem>
              <Label>Heading</Label>
              <FormControl>
                <Input placeholder={placeholderHeading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`accordions.${index}.body`}
          render={({ field }) => (
            <FormItem>
              <Label>Body</Label>
              <FormControl>
                <TextArea rows={4} placeholder={placeholderBody} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Images section
// ═══════════════════════════════════════════════════════════════
type ImgItem = { _id: string; url: string; alt: string; order: number }

function ImagesSection({
  slug,
  images,
  eyebrow = '06',
}: {
  slug: string
  images: ImgItem[]
  eyebrow?: string
}) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const uploadMutation = useUploadProductImage()
  const removeMutation = useRemoveProductImage()

  const sortedImages = useMemo(
    () => [...images].sort((a: ImgItem, b: ImgItem) => a.order - b.order),
    [images],
  )

  const onPick = () => fileRef.current?.click()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please pick an image file.')
      return
    }
    uploadMutation.mutate({ slug, file })
    // Reset input so the same file can be uploaded again if needed.
    e.target.value = ''
  }

  return (
    <Section
      title="Images"
      eyebrow={eyebrow}
      action={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onPick}
          disabled={uploadMutation.isPending}
        >
          <Upload size={14} strokeWidth={1.6} />
          {uploadMutation.isPending ? 'Uploading…' : 'Upload image'}
        </Button>
      }
    >
      <input ref={fileRef} type="file" accept="image/*" onChange={onChange} className="hidden" />
      {sortedImages.length === 0 ? (
        <div className="border border-dashed border-hairline bg-cream-soft py-10 text-center">
          <p className="t-body-s text-mute mb-3">No images yet.</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onPick}
            disabled={uploadMutation.isPending}
          >
            <Upload size={14} strokeWidth={1.6} />
            Upload the first image
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sortedImages.map((img: ImgItem, i: number) => (
            <div key={img._id} className="relative group">
              <div
                className={cn(
                  'overflow-hidden bg-blush aspect-4/5',
                  i === 0 ? 'ring-2 ring-pink' : '',
                )}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
              {i === 0 ? (
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-pink text-paper font-mono uppercase tracking-widest text-[9px] rounded-xs">
                  Hero
                </span>
              ) : null}
              <button
                type="button"
                onClick={() => removeMutation.mutate({ slug, imageId: img._id })}
                disabled={removeMutation.isPending}
                className="absolute top-2 right-2 w-7 h-7 bg-paper border border-hairline hover:bg-err hover:text-paper inline-flex items-center justify-center rounded-xs"
                aria-label="Remove image"
              >
                <X size={14} strokeWidth={1.6} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Trust line row
// ═══════════════════════════════════════════════════════════════
function TrustLineRow({
  index,
  onRemove,
  form,
}: {
  index: number
  onRemove: () => void
  form: ReturnType<typeof useForm<FormValues>>
}) {
  return (
    <div className="border border-hairline-soft bg-cream-soft p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="t-eyebrow text-mute tracking-[0.12em]">Trust line {index + 1}</div>
        <button
          type="button"
          onClick={onRemove}
          className="text-mute hover:text-err"
          aria-label="Remove trust line"
        >
          <X size={16} strokeWidth={1.6} />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-3">
        <FormField
          control={form.control}
          name={`trustLines.${index}.icon`}
          render={({ field }) => (
            <FormItem>
              <Label>Icon</Label>
              <FormControl>
                <SelectInput
                  value={field.value}
                  onChange={(v) => field.onChange(v as TrustIcon)}
                  options={TRUST_ICON_OPTIONS}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name={`trustLines.${index}.text`}
          render={({ field }) => (
            <FormItem>
              <Label>Text</Label>
              <FormControl>
                <Input placeholder="Ships nationwide in 2 to 5 days." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Pending images section (create mode)
//
//  The image upload endpoint requires an existing product slug, but the
//  admin shouldn't have to fill out a form, save, and only then think
//  about images. So during create we accept files into local component
//  state with object URL previews, then upload them in onSubmit's success
//  callback once the product has a real slug.
// ═══════════════════════════════════════════════════════════════
function PendingImagesSection({
  eyebrow,
  pending,
  onAdd,
  onRemove,
}: {
  eyebrow: string
  pending: { file: File; preview: string }[]
  onAdd: (file: File) => void
  onRemove: (index: number) => void
}) {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const onPick = () => fileRef.current?.click()

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error(`Skipped "${file.name}". Please pick an image file.`)
        continue
      }
      onAdd(file)
    }
    e.target.value = ''
  }

  return (
    <Section
      title="Images"
      eyebrow={eyebrow}
      action={
        <Button type="button" variant="secondary" size="sm" onClick={onPick}>
          <Upload size={14} strokeWidth={1.6} />
          Add images
        </Button>
      }
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={onChange}
        className="hidden"
      />
      {pending.length === 0 ? (
        <div className="border border-dashed border-hairline bg-cream-soft py-10 text-center">
          <p className="t-body-s text-mute mb-3">
            No images yet. They will upload after you create the product.
          </p>
          <Button type="button" variant="secondary" size="sm" onClick={onPick}>
            <Upload size={14} strokeWidth={1.6} />
            Add images
          </Button>
        </div>
      ) : (
        <>
          <p className="t-body-s text-mute mb-4">
            {pending.length} image{pending.length === 1 ? '' : 's'} queued. They will upload after
            you submit the form.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {pending.map((p: { file: File; preview: string }, i: number) => (
              <div key={p.preview} className="relative group">
                <div
                  className={cn(
                    'overflow-hidden bg-blush aspect-4/5',
                    i === 0 ? 'ring-2 ring-pink' : '',
                  )}
                >
                  <img
                    src={p.preview}
                    alt={p.file.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </div>
                {i === 0 ? (
                  <span className="absolute top-2 left-2 px-2 py-0.5 bg-pink text-paper font-mono uppercase tracking-widest text-[9px] rounded-xs">
                    Hero
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => onRemove(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-paper border border-hairline hover:bg-err hover:text-paper inline-flex items-center justify-center rounded-xs"
                  aria-label="Remove image"
                >
                  <X size={14} strokeWidth={1.6} />
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </Section>
  )
}

// ═══════════════════════════════════════════════════════════════
//  Small form inputs
// ═══════════════════════════════════════════════════════════════

function NairaInput({
  value,
  onChange,
  allowEmpty = false,
}: {
  value: number | null
  onChange: (v: number | null) => void
  allowEmpty?: boolean
}) {
  const display = value == null ? '' : String(value)
  return (
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-mute text-[14px]">₦</span>
      <input
        type="number"
        inputMode="numeric"
        step="any"
        min={0}
        value={display}
        onChange={(e) => {
          const raw = e.target.value
          if (raw === '') {
            onChange(allowEmpty ? null : 0)
            return
          }
          const n = Number(raw)
          onChange(Number.isFinite(n) ? n : 0)
        }}
        className="flex h-11 w-full border border-hairline bg-paper pl-8 pr-3.5 py-2 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
      />
    </div>
  )
}

function NumberInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const n = Number(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
      className="flex h-11 w-full border border-hairline bg-paper px-3.5 py-2 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink"
    />
  )
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-11 w-full border border-hairline bg-paper px-3.5 py-2 text-[15px] text-ink focus-visible:outline-none focus-visible:border-ink"
    >
      {options.map((o: { value: string; label: string }) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  )
}

function TextArea({
  rows = 4,
  placeholder,
  value,
  onChange,
  ...props
}: {
  rows?: number
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full min-h-25 border border-hairline bg-paper px-3.5 py-3 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
      {...props}
    />
  )
}
