import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Leaf, RefreshCw, Send } from 'lucide-react'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import { DeerLoader } from '../components/DeerLoader'
import { ReflectionCard } from '../components/ReflectionCard'
import { requestReflection } from '../lib/groq'
import type { Reflection } from '../types'
import { useUserData } from '../contexts/UserDataContext'

export function CheckIn() {
  const { addCheckIn, addTodo, todos } = useUserData()
  const [text, setText] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [reflection, setReflection] = useState<Reflection | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [latestCheckInId, setLatestCheckInId] = useState<string | null>(null)
  const [addedSuggestions, setAddedSuggestions] = useState<string[]>([])

  const canSubmit = text.trim().length > 2 && status !== 'loading'

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return

    setStatus('loading')
    setError(null)

    try {
      const result = await requestReflection({ text: text.trim() })
      const entry = addCheckIn({ text: text.trim(), reflection: result })
      setLatestCheckInId(entry.id)
      setReflection(result)
      setAddedSuggestions([])
      setStatus('done')
    } catch (err: any) {
      setError(err?.message ?? 'Something quiet went sideways. Try again in a moment.')
      setStatus('error')
    }
  }

  function reset() {
    setText('')
    setStatus('idle')
    setReflection(null)
    setError(null)
    setLatestCheckInId(null)
    setAddedSuggestions([])
  }

  function addSuggestionToTodo(suggestion: string) {
    const next = addTodo(suggestion, latestCheckInId)
    if (!next) return
    setAddedSuggestions((prev) =>
      prev.includes(suggestion) ? prev : [...prev, suggestion]
    )
  }

  const savedTodoTexts = todos.map((todo) => todo.text)

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            <Leaf size={12} className="mr-2 inline-block" />
            Today
          </div>
          <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            How is it, really?
          </h1>
          <p className="mt-1.5 max-w-xl text-ink-muted">
            A few lines, honestly. No extra step first. Just write what is actually going on.
          </p>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {status !== 'done' && (
          <motion.form
            key="form"
            onSubmit={onSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="space-y-5"
          >
            <Card>
              <CardHeader>
                <CardTitle>Write</CardTitle>
                <CardSub className="mt-1">
                  Try starting with "right now I feel…" or "today I noticed…"
                </CardSub>
              </CardHeader>
              <CardBody>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Right now I feel…"
                  rows={8}
                  autoFocus
                  maxLength={2000}
                  disabled={status === 'loading'}
                />
                <div className="on-paper-muted mt-2 flex items-center justify-between text-xs">
                  <span>Your check-ins stay with your account.</span>
                  <span>{text.length} / 2000</span>
                </div>
              </CardBody>
            </Card>

            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-ink-muted">
                Endeerment is a wellness companion — not a medical service.
              </p>
              <Button type="submit" size="lg" disabled={!canSubmit}>
                {status === 'loading' ? 'Listening…' : (
                  <>
                    Send to the clearing <Send size={16} />
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="rounded-2xl border border-red-300/30 bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </div>
            )}

            {status === 'loading' && <DeerLoader />}
          </motion.form>
        )}

        {status === 'done' && reflection && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <ReflectionCard
              reflection={reflection}
              addedSuggestions={reflection.suggestions.filter((item) =>
                addedSuggestions.includes(item) || savedTodoTexts.includes(item)
              )}
              onAddSuggestion={addSuggestionToTodo}
            />
            <div className="on-paper-muted flex items-center justify-between rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3">
              <div className="text-sm">
                Saved. Your forest grew a little, and the useful next steps can go straight into your todo list.
              </div>
              <Button variant="soft" onClick={reset}>
                <RefreshCw size={14} /> Another check-in
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
