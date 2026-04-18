import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          'h-11 w-full rounded-lg border border-slate-300 bg-white px-4 text-[0.95rem] text-ink placeholder:text-ink-faint transition',
          'focus:border-sage-500 focus:outline-none focus:ring-4 focus:ring-sage-400/12',
          'disabled:bg-slate-100 disabled:text-ink-muted',
          className
        )}
        {...rest}
      />
    )
  }
)
