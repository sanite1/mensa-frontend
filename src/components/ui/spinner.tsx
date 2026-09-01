// Spinner — small inline loading indicator for pending buttons.
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Spinner({ size = 14, className }: { size?: number; className?: string }) {
  return <Loader2 size={size} strokeWidth={2} className={cn('animate-spin', className)} />
}
