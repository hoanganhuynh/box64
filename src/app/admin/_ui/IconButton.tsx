'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  badge?: number
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, badge, size = 'md', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'flex items-center justify-center rounded-full border border-border transition-colors hover:bg-surface disabled:pointer-events-none disabled:opacity-50',
          {
            'h-8 w-8': size === 'sm',
            'h-10 w-10': size === 'md',
            'h-11 w-11': size === 'xl',
            'h-12 w-12': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        <span className="relative flex items-center justify-center">
          {icon}
          {badge !== undefined && badge > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-background bg-indigo-600 text-[9px] font-semibold text-white">
              {badge > 9 ? '9+' : badge}
            </span>
          )}
        </span>
      </button>
    )
  },
)

IconButton.displayName = 'IconButton'
