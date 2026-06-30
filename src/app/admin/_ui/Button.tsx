'use client'

import { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: ReactNode
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, icon, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={variant === 'primary' ? {
          background: 'linear-gradient(180deg, #6366F1 0%, #4F46E5 50%, #4338CA 100%)',
          boxShadow: '0 2px 6px 0 rgba(79,70,229,0.35), inset 0 1px 1px 0 rgba(255,255,255,0.35), inset 0 -1px 1px 0 rgba(0,0,0,0.10)',
        } : variant === 'danger' ? {
          background: 'linear-gradient(180deg, #EF4444 0%, #DC2626 50%, #B91C1C 100%)',
          boxShadow: '0 2px 6px 0 rgba(220,38,38,0.35), inset 0 1px 1px 0 rgba(255,255,255,0.25), inset 0 -1px 1px 0 rgba(0,0,0,0.10)',
        } : undefined}
        className={cn(
          'inline-flex items-center justify-center rounded-full font-medium transition-[filter,opacity] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:pointer-events-none',
          {
            'text-white hover:brightness-110 active:brightness-95': variant === 'primary' || variant === 'danger',
            'bg-surface text-foreground hover:bg-surface/80': variant === 'secondary',
            'text-muted hover:bg-surface hover:text-foreground': variant === 'ghost',
            'border border-border bg-transparent text-foreground hover:bg-surface': variant === 'outline',
          },
          {
            'h-8 px-3 text-sm gap-1.5': size === 'sm',
            'h-11 px-4 text-sm gap-2': size === 'md',
            'h-12 px-6 text-base gap-2.5': size === 'lg',
          },
          disabled && !loading && 'opacity-50',
          className,
        )}
        {...props}
      >
        {loading ? (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <>
            {icon ?? leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    )
  },
)

Button.displayName = 'Button'
