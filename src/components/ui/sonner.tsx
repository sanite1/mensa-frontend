import { CircleCheck, Info, LoaderCircle, OctagonX, TriangleAlert } from 'lucide-react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      icons={{
        success: <CircleCheck className="h-4 w-4" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-[var(--paper)] group-[.toaster]:text-[var(--ink)] group-[.toaster]:border-[var(--hairline)] group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-none',
          description: 'group-[.toast]:text-[var(--mute)]',
          actionButton: 'group-[.toast]:bg-[var(--ink)] group-[.toast]:text-[var(--paper)]',
          cancelButton: 'group-[.toast]:bg-[var(--cream)] group-[.toast]:text-[var(--ink)]',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
