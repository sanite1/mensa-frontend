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
            'group toast group-[.toaster]:bg-(--paper) group-[.toaster]:text-(--ink) group-[.toaster]:border-(--hairline) group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-none',
          description: 'group-[.toast]:text-(--mute)',
          actionButton: 'group-[.toast]:bg-(--ink) group-[.toast]:text-(--paper)',
          cancelButton: 'group-[.toast]:bg-(--cream) group-[.toast]:text-(--ink)',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
