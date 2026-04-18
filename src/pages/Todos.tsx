import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownUp, Brain, CheckCircle2, Circle, ListTodo, Sparkles, Trash2 } from 'lucide-react'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Textarea'
import { useUserData } from '../contexts/UserDataContext'
import { requestBrainDumpTodos, requestTodoPriorities } from '../lib/groq'
import { formatDate } from '../lib/utils'
import type { BrainDumpTodoSuggestion, TodoItem } from '../types'

const IMPORTANCE_ORDER: Record<TodoItem['importance'], number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const IMPORTANCE_STYLES: Record<TodoItem['importance'], string> = {
  high: 'border-rose-200 bg-rose-50 text-rose-700',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  low: 'border-sky-200 bg-sky-50 text-sky-700',
}

function normalizeImportance(importance?: TodoItem['importance']) {
  return importance ?? 'medium'
}

function importanceLabel(importance?: TodoItem['importance']) {
  const value = normalizeImportance(importance)
  return value[0].toUpperCase() + value.slice(1)
}

export function Todos() {
  const { todos, toggleTodo, deleteTodo, addTodo, updateTodoImportance } = useUserData()
  const [brainDump, setBrainDump] = useState('')
  const [brainDumpSummary, setBrainDumpSummary] = useState('')
  const [brainDumpIdeas, setBrainDumpIdeas] = useState<BrainDumpTodoSuggestion[]>([])
  const [brainDumpError, setBrainDumpError] = useState('')
  const [sortMessage, setSortMessage] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [isSorting, setIsSorting] = useState(false)
  const [addedIdeas, setAddedIdeas] = useState<string[]>([])

  const sortedTodos = useMemo(
    () =>
      [...todos].sort((a, b) => {
        const aCompleted = Boolean(a.completed_at)
        const bCompleted = Boolean(b.completed_at)
        if (aCompleted && !bCompleted) return 1
        if (!aCompleted && bCompleted) return -1

        if (!aCompleted && !bCompleted) {
          const byImportance =
            IMPORTANCE_ORDER[normalizeImportance(a.importance)] -
            IMPORTANCE_ORDER[normalizeImportance(b.importance)]
          if (byImportance !== 0) return byImportance

          const aRankedAt = a.ai_ranked_at ? new Date(a.ai_ranked_at).getTime() : 0
          const bRankedAt = b.ai_ranked_at ? new Date(b.ai_ranked_at).getTime() : 0
          if (aRankedAt !== bRankedAt) return bRankedAt - aRankedAt
        }

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }),
    [todos]
  )

  const openTodos = sortedTodos.filter((todo) => !todo.completed_at)
  const doneTodos = sortedTodos.filter((todo) => todo.completed_at)

  async function handleBrainDump() {
    const text = brainDump.trim()
    if (!text) {
      setBrainDumpError('Drop a messy list or stream of thoughts in first.')
      return
    }

    setIsThinking(true)
    setBrainDumpError('')
    setSortMessage('')

    try {
      const result = await requestBrainDumpTodos({ text })
      setBrainDumpSummary(result.summary)
      setBrainDumpIdeas(result.todos)
      setAddedIdeas([])
    } catch (error) {
      setBrainDumpError(error instanceof Error ? error.message : 'Could not turn that into todos.')
    } finally {
      setIsThinking(false)
    }
  }

  function handleAddIdea(todo: BrainDumpTodoSuggestion) {
    const created = addTodo(todo.text, null, {
      importance: todo.importance,
      importanceReason: todo.reason,
      aiRankedAt: new Date().toISOString(),
    })

    if (created) {
      setAddedIdeas((prev) => [...prev, todo.text.toLowerCase()])
    }
  }

  function handleAddAllIdeas() {
    const now = new Date().toISOString()
    const nextAdded: string[] = []

    for (const todo of brainDumpIdeas) {
      const created = addTodo(todo.text, null, {
        importance: todo.importance,
        importanceReason: todo.reason,
        aiRankedAt: now,
      })
      if (created) nextAdded.push(todo.text.toLowerCase())
    }

    if (nextAdded.length > 0) {
      setAddedIdeas((prev) => [...prev, ...nextAdded])
    }
  }

  async function handleSortByImportance() {
    if (openTodos.length === 0) return

    setIsSorting(true)
    setSortMessage('')
    setBrainDumpError('')

    try {
      const result = await requestTodoPriorities({
        todos: openTodos.map((todo) => todo.text),
      })

      const rankedAt = new Date().toISOString()
      for (const priority of result.priorities) {
        const match = openTodos.find(
          (todo) => todo.text.trim().toLowerCase() === priority.text.trim().toLowerCase()
        )
        if (!match) continue
        updateTodoImportance(match.id, priority.importance, priority.reason, rankedAt)
      }

      setSortMessage('Your open tasks were re-ranked by urgency and payoff.')
    } catch (error) {
      setSortMessage(error instanceof Error ? error.message : 'Could not sort your todos right now.')
    } finally {
      setIsSorting(false)
    }
  }

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">Next steps</div>
          <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Todos
          </h1>
          <p className="mt-1.5 max-w-2xl text-ink-muted">
            Brain dump everything, turn it into clearer tasks, and let AI help sort what matters first.
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm">
          <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">Overview</div>
          <div className="mt-1 flex items-center gap-4">
            <span className="text-ink"><strong>{openTodos.length}</strong> open</span>
            <span className="text-ink-muted"><strong>{doneTodos.length}</strong> done</span>
          </div>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: 'easeOut' }}
      >
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-sage-500" />
            <CardTitle>Brain dump to todos</CardTitle>
          </div>
          <CardSub className="mt-1">
            Paste the chaotic version. I&apos;ll clean it up into doable tasks with importance tags.
          </CardSub>
        </CardHeader>
        <CardBody className="space-y-4">
          <Textarea
            value={brainDump}
            onChange={(event) => setBrainDump(event.target.value)}
            rows={6}
            placeholder="Example: email Sam back, fix the billing bug, book dentist, figure out mom's birthday gift, maybe clean the kitchen, finish onboarding deck..."
          />
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBrainDump} disabled={isThinking}>
              <Sparkles size={16} />
              {isThinking ? 'Turning into todos...' : 'Turn into todos'}
            </Button>
            {brainDumpIdeas.length > 0 && (
              <Button variant="soft" onClick={handleAddAllIdeas}>
                Add all suggested todos
              </Button>
            )}
          </div>
          {brainDumpError && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {brainDumpError}
            </motion.div>
          )}
          {(brainDumpSummary || brainDumpIdeas.length > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="space-y-3 rounded-xl border border-ink/10 bg-paper-50 p-4"
            >
              {brainDumpSummary && <p className="text-sm text-ink">{brainDumpSummary}</p>}
              <motion.div layout className="space-y-2.5">
                <AnimatePresence initial={false}>
                {brainDumpIdeas.map((idea, index) => {
                  const alreadyAdded = addedIdeas.includes(idea.text.toLowerCase())

                  return (
                    <motion.div
                      layout
                      key={`${idea.text}-${index}`}
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.98 }}
                      transition={{ duration: 0.24, delay: index * 0.03, ease: 'easeOut' }}
                      className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-white px-4 py-3"
                    >
                      <div
                        className={`mt-0.5 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] ${IMPORTANCE_STYLES[idea.importance]}`}
                      >
                        {importanceLabel(idea.importance)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-ink">{idea.text}</div>
                        <div className="mt-1 text-xs text-ink-muted">{idea.reason}</div>
                      </div>
                      <Button
                        size="sm"
                        variant={alreadyAdded ? 'outline' : 'soft'}
                        onClick={() => handleAddIdea(idea)}
                        disabled={alreadyAdded}
                      >
                        {alreadyAdded ? 'Added' : 'Add'}
                      </Button>
                    </motion.div>
                  )
                })}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </CardBody>
      </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      >
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <ListTodo size={18} className="text-sage-500" />
                <CardTitle>Saved actions</CardTitle>
              </div>
              <CardSub className="mt-1">
                Open todos float to the top, and importance helps surface the ones to tackle first.
              </CardSub>
            </div>
            <Button
              size="sm"
              variant="soft"
              onClick={handleSortByImportance}
              disabled={isSorting || openTodos.length === 0}
            >
              <ArrowDownUp size={14} />
              {isSorting ? 'Sorting...' : 'AI sort open todos'}
            </Button>
          </div>
          {sortMessage && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800"
            >
              {sortMessage}
            </motion.div>
          )}
        </CardHeader>
        <CardBody className="space-y-2.5">
          {sortedTodos.length === 0 ? (
            <div className="rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3 text-sm text-ink-muted">
              Nothing here yet. Use the brain dump box above or save a suggestion from a check-in.
            </div>
          ) : (
            <motion.div layout className="space-y-2.5">
              <AnimatePresence initial={false}>
            {sortedTodos.map((todo, index) => {
              const completed = Boolean(todo.completed_at)
              const importance = normalizeImportance(todo.importance)

              return (
                <motion.div
                  layout
                  key={todo.id}
                  initial={{ opacity: 0, y: 12, scale: 0.985 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    scale: completed ? 0.992 : 1,
                    backgroundColor: completed ? 'rgba(251,246,238,0.72)' : 'rgba(251,246,238,1)',
                  }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.28, delay: Math.min(index, 6) * 0.025, ease: 'easeOut' }}
                  className="flex items-start gap-3 rounded-2xl border border-ink/10 px-4 py-3"
                >
                  <motion.span
                    animate={completed ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                    transition={{ duration: 0.32, ease: 'easeOut' }}
                    className="mt-0.5 text-sage-500"
                  >
                    {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                  </motion.span>
                  <div className="min-w-0 flex-1">
                    <motion.div
                      animate={completed ? { opacity: 0.62 } : { opacity: 1 }}
                      className={`text-sm ${completed ? 'text-ink-muted line-through' : 'text-ink'}`}
                    >
                      {todo.text}
                    </motion.div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                      <span
                        className={`rounded-full border px-2 py-0.5 font-semibold uppercase tracking-[0.12em] ${IMPORTANCE_STYLES[importance]}`}
                      >
                        {importanceLabel(importance)}
                      </span>
                      <span>Added {formatDate(todo.created_at)}</span>
                      {todo.completed_at && <span>Done {formatDate(todo.completed_at)}</span>}
                      {todo.ai_ranked_at && !completed && <span>AI-ranked</span>}
                    </div>
                    {todo.importance_reason && !completed && (
                      <div className="mt-1 text-xs text-ink-muted">{todo.importance_reason}</div>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" variant="soft" onClick={() => toggleTodo(todo.id)}>
                      {completed ? 'Reopen' : 'Done'}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => deleteTodo(todo.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </motion.div>
              )
            })
              }</AnimatePresence>
            </motion.div>
          )}
        </CardBody>
      </Card>
      </motion.div>
    </div>
  )
}
