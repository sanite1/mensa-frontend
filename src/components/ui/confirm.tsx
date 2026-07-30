// Confirm / Prompt — imperative replacement for window.confirm/prompt.
import { useEffect, useRef, useState } from 'react'
import { useStore } from 'zustand'
import { createStore } from 'zustand/vanilla'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'

type Tone = 'default' | 'destructive'

interface ConfirmOptions {
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: Tone
}

interface PromptOptions extends ConfirmOptions {
  placeholder?: string
  defaultValue?: string
  multiline?: boolean
  required?: boolean
}

type ActiveConfirm = ConfirmOptions & {
  kind: 'confirm'
  resolve: (ok: boolean) => void
}

type ActivePrompt = PromptOptions & {
  kind: 'prompt'
  resolve: (value: string | null) => void
}

type Active = ActiveConfirm | ActivePrompt

interface ConfirmState {
  active: Active | null
  set: (a: Active | null) => void
}

const store = createStore<ConfirmState>((set) => ({
  active: null,
  set: (a) => set({ active: a }),
}))

export function confirm(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    store.getState().set({ kind: 'confirm', resolve, ...options })
  })
}

export function prompt(options: PromptOptions): Promise<string | null> {
  return new Promise((resolve) => {
    store.getState().set({ kind: 'prompt', resolve, ...options })
  })
}

export function ConfirmHost() {
  const active = useStore(store, (s) => s.active)
  const clear = useStore(store, (s) => s.set)

  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null)

  useEffect(() => {
    if (active?.kind === 'prompt') {
      setValue(active.defaultValue ?? '')
      const t = setTimeout(() => inputRef.current?.focus(), 50)
      return () => clearTimeout(t)
    }
  }, [active])

  if (!active) return null

  const isPrompt = active.kind === 'prompt'
  const tone = active.tone ?? 'default'
  const confirmLabel = active.confirmLabel ?? (isPrompt ? 'Save' : 'Confirm')
  const cancelLabel = active.cancelLabel ?? 'Cancel'

  const cancel = () => {
    if (active.kind === 'confirm') active.resolve(false)
    else active.resolve(null)
    clear(null)
  }

  const submit = () => {
    if (active.kind === 'confirm') {
      active.resolve(true)
    } else {
      const trimmed = value.trim()
      if (active.required && !trimmed) {
        inputRef.current?.focus()
        return
      }
      active.resolve(value)
    }
    clear(null)
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) cancel()
      }}
    >
      <DialogContent
        className="max-w-110 p-7"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (!isPrompt || !(active as ActivePrompt).multiline)) {
            e.preventDefault()
            submit()
          }
        }}
      >
        <DialogTitle className="font-display italic font-semibold text-[26px] leading-[1.1] text-ink tracking-tight">
          {active.title}
        </DialogTitle>

        {active.description ? (
          <DialogDescription className="mt-2.5 text-graphite text-[14.5px] leading-[1.55]">
            {active.description}
          </DialogDescription>
        ) : null}

        {isPrompt ? (
          (active as ActivePrompt).multiline ? (
            <textarea
              ref={(el) => {
                inputRef.current = el
              }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={(active as ActivePrompt).placeholder}
              rows={4}
              className="mt-5 w-full border border-hairline bg-paper px-3.5 py-3 text-[14.5px] text-ink placeholder:text-mute focus:outline-none focus:border-ink resize-none"
            />
          ) : (
            <input
              ref={(el) => {
                inputRef.current = el
              }}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={(active as ActivePrompt).placeholder}
              className="mt-5 w-full border border-hairline bg-paper px-3.5 py-2.5 text-[14.5px] text-ink placeholder:text-mute focus:outline-none focus:border-ink"
            />
          )
        ) : null}

        <div className="mt-7 flex items-center justify-end gap-2.5">
          <Button type="button" variant="ghost" size="md" onClick={cancel}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={tone === 'destructive' ? 'danger' : 'primary'}
            size="md"
            onClick={submit}
          >
            {confirmLabel}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
