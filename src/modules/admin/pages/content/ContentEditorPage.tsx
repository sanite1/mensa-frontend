// ═══════════════════════════════════════════════════════════════
// /content/new + /content/:id/edit (admin)
//
// One page handles both modes. Markdown body lives in a textarea
// for now; richer editor can land later without changing the API.
// Status flip (draft ↔ published) is a single switch on the form.
// ═══════════════════════════════════════════════════════════════

import { useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Trash2 } from 'lucide-react'
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
import {
  useAdminContentPost,
  useCreateContentPost,
  useDeleteContentPost,
  useUpdateContentPost,
  type CreateContentPostInput,
} from '@/lib/network/api/content.api'

const formSchema = z.object({
  title: z.string().min(1, 'Title is required.').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required.')
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase letters, numbers, and dashes.'),
  kind: z.enum(['journal', 'education']),
  category: z.enum(['classroom', 'product', 'community', 'policy', 'care']),
  eyebrow: z.string().max(80).default(''),
  excerpt: z.string().max(400).default(''),
  body: z.string().default(''),
  authorName: z.string().min(1, 'Author name is required.').max(120),
  authorBio: z.string().max(400).default(''),
  readMinutes: z.number().int().min(1).max(120).default(5),
  status: z.enum(['draft', 'published']).default('draft'),
  coverImageUrl: z.string().url().or(z.literal('')).default(''),
  coverImageAlt: z.string().max(160).default(''),
})
type FormValues = z.infer<typeof formSchema>

const defaultValues: FormValues = {
  title: '',
  slug: '',
  kind: 'journal',
  category: 'classroom',
  eyebrow: '',
  excerpt: '',
  body: '',
  authorName: '',
  authorBio: '',
  readMinutes: 5,
  status: 'draft',
  coverImageUrl: '',
  coverImageAlt: '',
}

const slugify = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120)

export function ContentEditorPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id
  const navigate = useNavigate()

  const postQuery = useAdminContentPost(id)
  const createMutation = useCreateContentPost()
  const updateMutation = useUpdateContentPost()
  const deleteMutation = useDeleteContentPost()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: 'onBlur',
  })

  // Populate the form when an existing post finishes loading.
  useEffect(() => {
    const post = postQuery.data?.data?.post
    if (!post) return
    form.reset({
      title: post.title,
      slug: post.slug,
      kind: post.kind,
      category: post.category,
      eyebrow: post.eyebrow ?? '',
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      authorName: post.authorName,
      authorBio: post.authorBio ?? '',
      readMinutes: post.readMinutes ?? 5,
      status: post.status,
      coverImageUrl: post.coverImage?.url ?? '',
      coverImageAlt: post.coverImage?.alt ?? '',
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postQuery.data?.data?.post?._id])

  const onSubmit = (values: FormValues) => {
    const payload: CreateContentPostInput = {
      slug: values.slug,
      kind: values.kind,
      title: values.title,
      eyebrow: values.eyebrow || undefined,
      category: values.category,
      excerpt: values.excerpt || undefined,
      body: values.body,
      authorName: values.authorName,
      authorBio: values.authorBio || undefined,
      readMinutes: values.readMinutes,
      status: values.status,
      coverImage: values.coverImageUrl
        ? { url: values.coverImageUrl, alt: values.coverImageAlt }
        : undefined,
    }
    if (isEdit && id) {
      updateMutation.mutate(
        { id, body: payload },
        {
          onSuccess: () => navigate('/content'),
        },
      )
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => navigate('/content'),
      })
    }
  }

  const onDelete = async () => {
    if (!id) return
    const ok = await confirm({
      title: 'Delete this post?',
      description: 'This cannot be undone.',
      confirmLabel: 'Delete',
      tone: 'destructive',
    })
    if (!ok) return
    deleteMutation.mutate(id, {
      onSuccess: () => navigate('/content'),
    })
  }

  // Auto-slug from title only when slug is empty (create mode only).
  const titleValue = form.watch('title')
  const slugValue = form.watch('slug')
  useEffect(() => {
    if (isEdit) return
    if (!titleValue) return
    if (slugValue && slugValue !== slugify(slugValue)) return
    const next = slugify(titleValue)
    if (next !== slugValue) form.setValue('slug', next, { shouldValidate: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titleValue, isEdit])

  if (isEdit && postQuery.isLoading) {
    return <section className="px-4 md:px-6 lg:px-8 py-10 t-body-s text-mute">Loading…</section>
  }
  if (isEdit && (postQuery.isError || !postQuery.data?.data?.post)) {
    return (
      <section className="px-4 md:px-6 lg:px-8 py-10">
        <Link
          to="/content"
          className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
        >
          <ArrowLeft size={14} /> Content
        </Link>
        <p className="t-body text-err">We could not load that post.</p>
      </section>
    )
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <section className="px-4 md:px-6 lg:px-8 py-6 md:py-8 lg:py-10 max-w-7xl">
      <Link
        to="/content"
        className="inline-flex items-center gap-2 text-[12px] uppercase tracking-widest font-medium text-ink no-underline hover:text-pink-deep mb-6"
      >
        <ArrowLeft size={14} /> Content
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <div className="t-eyebrow text-mute mb-3">{isEdit ? 'Edit post' : 'New post'}</div>
          <h1 className="m-0 font-display italic font-semibold text-[clamp(28px,5vw,40px)] leading-[1.05] tracking-tight text-ink">
            {isEdit ? form.watch('title') || 'Untitled post' : 'Write a new post'}
          </h1>
        </div>
        {isEdit ? (
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash2 size={14} strokeWidth={1.6} />
            Delete
          </Button>
        ) : null}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            const first = Object.values(errors)[0]
            if (first && 'message' in first) toast.error(String(first.message))
          })}
          className="flex flex-col gap-6 max-w-4xl"
        >
          <Section title="Basics" eyebrow="01">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Why we built reusable pants" {...field} />
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
                    <Input placeholder="why-we-built-reusable-pants" {...field} />
                  </FormControl>
                  <FormDescription>URL path under /journal or /education.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kind</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'journal', label: 'Journal' },
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
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onChange={field.onChange}
                        options={[
                          { value: 'classroom', label: 'Classroom' },
                          { value: 'product', label: 'Product' },
                          { value: 'community', label: 'Community' },
                          { value: 'policy', label: 'Policy' },
                          { value: 'care', label: 'Care' },
                        ]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="eyebrow"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Eyebrow</FormLabel>
                  <FormControl>
                    <Input placeholder="Issue 04 · 2026" {...field} />
                  </FormControl>
                  <FormDescription>Small uppercase line above the title on the page.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <TextArea
                      rows={3}
                      placeholder="One or two sentence summary for the listing card."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="Body" eyebrow="02">
            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Markdown body</FormLabel>
                  <FormControl>
                    <TextArea rows={18} placeholder="# Heading…" {...field} />
                  </FormControl>
                  <FormDescription>
                    Plain markdown. The reader will render headings, lists, quotes, and images.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="Cover image" eyebrow="03">
            <FormField
              control={form.control}
              name="coverImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://res.cloudinary.com/…"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Paste a Cloudinary URL. A direct upload flow will land later.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverImageAlt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt text</FormLabel>
                  <FormControl>
                    <Input placeholder="Two students reading a Mensa guide" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="Author" eyebrow="04">
            <FormField
              control={form.control}
              name="authorName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author name</FormLabel>
                  <FormControl>
                    <Input placeholder="Yetunde Bello" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authorBio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author bio</FormLabel>
                  <FormControl>
                    <TextArea rows={2} placeholder="One liner about the author." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="readMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Read minutes</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={120}
                      value={Number.isFinite(field.value) ? field.value : 5}
                      onChange={(e) => field.onChange(Number(e.target.value) || 5)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          <Section title="Status" eyebrow="05">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <Label>Visibility</Label>
                  <FormControl>
                    <Select
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: 'draft', label: 'Draft (hidden from public)' },
                        { value: 'published', label: 'Published (live)' },
                      ]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Section>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 sm:justify-end mt-2">
            <Button asChild variant="secondary" size="lg">
              <Link to="/content">Cancel</Link>
            </Button>
            <Button type="submit" variant="primary" size="lg" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create post'}
            </Button>
          </div>
        </form>
      </Form>
    </section>
  )
}

// ── Helpers ──────────────────────────────────────────────────────

function Section({
  title,
  eyebrow,
  children,
}: {
  title: string
  eyebrow: string
  children: React.ReactNode
}) {
  return (
    <div className="border border-hairline-soft bg-paper">
      <div className="px-5 py-4 border-b border-hairline-soft flex items-baseline gap-3">
        <div className="text-[10.5px] uppercase tracking-widest font-medium text-mute font-mono">
          {eyebrow}
        </div>
        <h2 className="m-0 text-[16px] font-medium text-ink">{title}</h2>
      </div>
      <div className="p-5 flex flex-col gap-4">{children}</div>
    </div>
  )
}

function TextArea({
  rows = 4,
  placeholder,
  value,
  onChange,
  onBlur,
  name,
}: {
  rows?: number
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onBlur?: React.FocusEventHandler<HTMLTextAreaElement>
  name?: string
}) {
  return (
    <textarea
      rows={rows}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      name={name}
      className="flex w-full border border-hairline bg-paper px-3.5 py-2.5 text-[15px] text-ink placeholder:text-mute focus-visible:outline-none focus-visible:border-ink resize-y"
    />
  )
}

function Select({
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
