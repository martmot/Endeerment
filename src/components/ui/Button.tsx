import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type Variant = 'primary' | 'ghost' | 'outline' | 'soft' | 'ink'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

const variantClasses: Record<Variant, string> = {
  primary:
    'border border-sage-600 bg-sage-600 text-paper-100 hover:bg-sage-700 active:bg-sage-800 shadow-soft',
  ink:
    'border border-ink bg-ink text-paper-100 hover:bg-ink-soft active:bg-black shadow-soft',
  outline:
    'bg-white/70 border border-ink/15 text-ink hover:bg-ink/5 active:bg-ink/10',
  soft:
    'bg-slate-100 text-ink hover:bg-slate-200 border border-slate-200',
  ghost:
    'bg-transparent text-ink/75 hover:bg-ink/5 hover:text-ink',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-md',
  md: 'h-11 px-5 text-[0.95rem] rounded-lg',
  lg: 'h-12 px-6 text-sm rounded-lg',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = 'primary', size = 'md', ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100 disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...rest}
    />
  )
})
