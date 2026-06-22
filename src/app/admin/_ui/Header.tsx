'use client'

import { List, MagnifyingGlass } from '@phosphor-icons/react'
import { cn } from '@/lib/cn'
import { NotificationsDropdown } from './NotificationsDropdown'
import { CommandPalette } from './CommandPalette'
import { ProfileMenu } from './ProfileMenu'
import { useSidebar } from './SidebarContext'

export function Header({ className }: { className?: string }) {
  const { mobileOpen, setMobileOpen, commandOpen, setCommandOpen } = useSidebar()

  return (
    <header className={cn(
      'flex h-20 shrink-0 items-center gap-3 border-b border-border bg-background px-4 lg:px-8',
      className,
    )}>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
        className="flex h-11 w-11 items-center justify-center rounded-full text-foreground transition-colors hover:bg-surface lg:hidden"
        style={{ touchAction: 'manipulation' }}
      >
        <List size={22} weight="regular" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          aria-label="Tìm kiếm"
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface lg:hidden"
        >
          <MagnifyingGlass size={20} weight="regular" />
        </button>

        <NotificationsDropdown />
        <ProfileMenu />
      </div>

      <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />
    </header>
  )
}
