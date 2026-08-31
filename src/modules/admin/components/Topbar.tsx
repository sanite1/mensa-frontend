// Admin topbar — paper strip across the top of the main content area.
import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, User } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/lib/network/stores/auth.store'
import { useLogout } from '@/lib/network/api/auth.api'

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const user = useAuthStore((s) => s.user)
  const logout = useLogout()
  const navigate = useNavigate()
  if (!user) return null

  const initials = user.name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="h-17 bg-paper border-b border-hairline flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open menu"
        className="lg:hidden inline-flex h-10 w-10 items-center justify-center text-ink hover:bg-cream"
      >
        <Menu size={20} strokeWidth={1.6} />
      </button>

      {/* Spacer that pushes the user dropdown to the right on desktop where
          there's no hamburger. */}
      <div className="hidden lg:block" />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-2.5 h-10 px-2 md:px-3 hover:bg-cream rounded-none"
          >
            <span className="inline-flex items-center justify-center h-8 w-8 bg-ink text-paper font-medium text-[12px] tracking-[0.04em]">
              {initials}
            </span>
            <span className="hidden sm:inline text-[14px] text-ink truncate max-w-40">
              {user.name}
            </span>
            <ChevronDown size={16} strokeWidth={1.6} className="text-mute" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="bg-paper border border-hairline rounded-none min-w-55"
        >
          <DropdownMenuLabel className="text-mute uppercase text-[11px] tracking-[0.12em] font-medium">
            Signed in as
          </DropdownMenuLabel>
          <div className="px-2 pb-2 text-[13px] text-ink truncate">{user.email}</div>
          <DropdownMenuSeparator className="bg-hairline-soft" />
          <DropdownMenuItem
            onClick={() => navigate('/profile')}
            className="text-[14px] text-ink cursor-pointer"
          >
            <User size={14} strokeWidth={1.6} className="mr-2" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-hairline-soft" />
          <DropdownMenuItem
            onClick={() => logout.mutate()}
            className="text-[14px] text-ink cursor-pointer"
          >
            <LogOut size={14} strokeWidth={1.6} className="mr-2" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
