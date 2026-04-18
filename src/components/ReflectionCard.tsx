import { motion } from 'framer-motion'
import { Check, Plus, Sparkles } from 'lucide-react'
import type { Reflection } from '../types'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from './ui/Card'
import { Button } from './ui/Button'

interface Props {
  reflection: Reflection
  title?: string
  addedSuggestions?: string[]
  onAddSuggestion?: (suggestion: string) => void
}

export function ReflectionCard({
  reflection,
  title = 'A gentle reflection',
  addedSuggestions = [],
  onAddSuggestion,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: 'easeOut' }}
    >
      <Card className="border-forest-300/20">
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            background:
              'radial-gradient(60% 60% at 10% 0%, rgba(127,174,135,0.25), transparent 70%), radial-gradient(60% 60% at 90% 0%, rgba(252,213,142,0.18), transparent 70%)',
          }}
        />
        <CardHeader className="relative">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-300 bg-amber-50 text-amber-500">
              <Sparkles size={16} />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl">{title}</CardTitle>
              {reflection.summary && (
                <CardSub className="mt-0.5">{reflection.summary}</CardSub>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="relative">
          <p className="on-paper-strong font-display text-[1.08rem] leading-relaxed md:text-[1.15rem]">
            {reflection.reflection}
          </p>

          {reflection.suggestions?.length > 0 && (
            <div className="mt-6 space-y-3">
              <div className="on-paper-muted text-xs uppercase tracking-[0.14em]">
                Suggestions you can actually save
              </div>
              <div className="space-y-2.5">
                {reflection.suggestions.map((suggestion, index) => {
                  const added = addedSuggestions.includes(suggestion)

                  return (
                    <motion.div
                      key={suggestion}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.18 + index * 0.08 }}
                      className="rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3 shadow-[0_1px_0_rgba(26,46,34,0.04)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="on-paper-strong text-sm font-medium leading-6">
                            {suggestion}
                          </div>
                        </div>
                        {onAddSuggestion && (
                          <Button
                            type="button"
                            size="sm"
                            variant={added ? 'soft' : 'outline'}
                            disabled={added}
                            onClick={() => onAddSuggestion(suggestion)}
                            className="shrink-0"
                          >
                            {added ? <Check size={14} /> : <Plus size={14} />}
                            {added ? 'Added' : 'Add to todo'}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </motion.div>
  )
}
