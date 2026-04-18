import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full resize-none rounded-lg border border-slate-300 bg-white px-4 py-3.5 text-[1rem] leading-relaxed text-ink placeholder:text-ink-faint transition',
          'focus:border-sage-500 focus:outline-none focus:ring-4 focus:ring-sage-400/12',
          className
        )}
        {...rest}
      />
    )
  }
)
