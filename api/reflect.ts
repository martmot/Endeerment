const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

type Reflection = {
  summary: string
  reflection: string
  suggestions: string[]
}

type BrainDumpTodo = {
  text: string
  importance: 'high' | 'medium' | 'low'
  reason: string
}

type BrainDumpResult = {
  summary: string
  todos: BrainDumpTodo[]
}

type TodoPriorityResult = {
  priorities: BrainDumpTodo[]
}

function normalizeImportance(value: unknown): BrainDumpTodo['importance'] {
  const lowered = String(value ?? 'medium').toLowerCase()
  if (lowered === 'high' || lowered === 'low') return lowered
  return 'medium'
}

function safeParseReflection(content: string): Reflection {
  const fallback = {
    summary: '',
    reflection: content.trim(),
    suggestions: [] as string[],
  }

  if (!content) return fallback

  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')
  const slice =
    firstBrace >= 0 && lastBrace > firstBrace
      ? content.slice(firstBrace, lastBrace + 1)
      : content

  try {
    const parsed = JSON.parse(slice)
    return {
      summary: String(parsed.summary ?? '').slice(0, 240),
      reflection: String(parsed.reflection ?? '').slice(0, 800),
      suggestions: Array.isArray(parsed.suggestions)
        ? parsed.suggestions.slice(0, 3).map((item: unknown) => String(item).slice(0, 120))
        : [],
    }
  } catch {
    const bullets = content.match(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+(.+)/g) || []
    const suggestions = bullets
      .slice(0, 3)
      .map((item) => item.replace(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+/, '').trim().slice(0, 120))

    return {
      summary: '',
      reflection: content.replace(/(?:^|\n)\s*(?:[-*•]|\d+\.)\s+.+/g, '').trim().slice(0, 800),
      suggestions,
    }
  }
}

function safeParseBrainDump(content: string): BrainDumpResult {
  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')
  const slice =
    firstBrace >= 0 && lastBrace > firstBrace
      ? content.slice(firstBrace, lastBrace + 1)
      : content

  try {
    const parsed = JSON.parse(slice)
    const todos = Array.isArray(parsed.todos) ? parsed.todos : []
    return {
      summary: String(parsed.summary ?? '').slice(0, 240),
      todos: todos
        .map((item: unknown) => {
          const todo = (item ?? {}) as Record<string, unknown>
          return {
            text: String(todo.text ?? '').trim().slice(0, 140),
            importance: normalizeImportance(todo.importance),
            reason: String(todo.reason ?? '').trim().slice(0, 180),
          }
        })
        .filter((item: BrainDumpTodo) => item.text)
        .slice(0, 8),
    }
  } catch {
    const lines = content
      .split('\n')
      .map((line) => line.replace(/^\s*(?:[-*•]|\d+\.)\s+/, '').trim())
      .filter(Boolean)
      .slice(0, 6)

    return {
      summary: '',
      todos: lines.map((text) => ({
        text: text.slice(0, 140),
        importance: 'medium',
        reason: 'Captured from your brain dump.',
      })),
    }
  }
}

function safeParseTodoPriorities(content: string): TodoPriorityResult {
  const firstBrace = content.indexOf('{')
  const lastBrace = content.lastIndexOf('}')
  const slice =
    firstBrace >= 0 && lastBrace > firstBrace
      ? content.slice(firstBrace, lastBrace + 1)
      : content

  try {
    const parsed = JSON.parse(slice)
    const priorities = Array.isArray(parsed.priorities) ? parsed.priorities : []
    return {
      priorities: priorities
        .map((item: unknown) => {
          const todo = (item ?? {}) as Record<string, unknown>
          return {
            text: String(todo.text ?? '').trim().slice(0, 140),
            importance: normalizeImportance(todo.importance),
            reason: String(todo.reason ?? '').trim().slice(0, 180),
          }
        })
        .filter((item: BrainDumpTodo) => item.text)
        .slice(0, 20),
    }
  } catch {
    return { priorities: [] }
  }
}

function parseByMode(mode: string, content: string) {
  if (mode === 'brain_dump') return safeParseBrainDump(content)
  if (mode === 'prioritize_todos') return safeParseTodoPriorities(content)
  return safeParseReflection(content)
}

function mockReflection(text: string, mood: string): Reflection {
  const trimmed = text.trim().slice(0, 80)
  return {
    summary: trimmed
      ? `You shared something feeling ${mood}: "${trimmed}${text.length > 80 ? '…' : ''}"`
      : `A quiet ${mood} check-in.`,
    reflection:
      "Thank you for putting this into words. What you wrote sounds specific and real, not small, and it makes sense that it is sitting with you this way. You do not have to solve the whole thing at once to care for yourself inside it.",
    suggestions: [
      'Write the exact next step you are avoiding',
      'Draft one honest message you could send',
      'Move one stressful task to tomorrow',
    ],
  }
}

function mockBrainDump(text: string): BrainDumpResult {
  const lines = text
    .split('\n')
    .flatMap((line) => line.split(/[.,;]+/))
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 6)

  const todos = lines.map((item, index) => ({
    text: item
      .replace(/^(i need to|need to|remember to|dont forget to|don't forget to)\s+/i, '')
      .replace(/^\w/, (char) => char.toUpperCase()),
    importance: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
    reason:
      index === 0
        ? 'This sounds like the most urgent or blocking thing.'
        : index < 3
          ? 'Useful to keep momentum moving.'
          : 'Important, but less time-sensitive.',
  }))

  return {
    summary: todos.length
      ? `I pulled out ${todos.length} clearer todos from your note.`
      : 'Write a few messy thoughts and I will turn them into todos.',
    todos,
  }
}

function mockTodoPriorities(todos: string[]): TodoPriorityResult {
  return {
    priorities: todos.slice(0, 20).map((text, index) => ({
      text,
      importance: index === 0 ? 'high' : index < 3 ? 'medium' : 'low',
      reason:
        index === 0
          ? 'This looks like the biggest blocker or nearest deadline.'
          : index < 3
            ? 'Worth doing soon to reduce stress.'
            : 'Can wait until after the higher-pressure items.',
    })),
  }
}

function mockByMode(mode: string, text: string, mood: string, todos: string[]) {
  if (mode === 'brain_dump') return mockBrainDump(text)
  if (mode === 'prioritize_todos') return mockTodoPriorities(todos)
  return mockReflection(text, mood)
}

function createSystemPrompt(mode: string) {
  if (mode === 'brain_dump') {
    return [
      'You are an organizing assistant inside a calming app called Endeerment.',
      'The user will paste a messy brain dump with half-thoughts, reminders, worries, and fragments.',
      'Your job is to turn it into a short list of clear, actionable todos.',
      'Merge duplicates, remove non-actionable filler, and rewrite each item as a direct todo starting with a strong verb.',
      'Infer the likely next concrete action, but do not invent large commitments the user did not imply.',
      'Also estimate importance based on urgency, deadlines, dependency, and emotional weight.',
      'Use only these importance values: high, medium, low.',
      'Give each todo a brief reason under 18 words explaining why it got that importance.',
      'You MUST return a single valid JSON object and nothing else.',
      'Shape: {"summary": string, "todos": [{"text": string, "importance": "high" | "medium" | "low", "reason": string}]}',
      'Return 3-8 todos when possible, each under 12 words.',
    ].join(' ')
  }

  if (mode === 'prioritize_todos') {
    return [
      'You are an organizing assistant inside a calming app called Endeerment.',
      'The user will provide an existing todo list.',
      'Your job is to assign importance to each todo using urgency, dependencies, deadlines, and likely stress reduction.',
      'Use only these importance values: high, medium, low.',
      'Preserve the original todo wording exactly in the text field.',
      'Give each todo a brief reason under 18 words.',
      'You MUST return a single valid JSON object and nothing else.',
      'Shape: {"priorities": [{"text": string, "importance": "high" | "medium" | "low", "reason": string}]}',
    ].join(' ')
  }

  return [
    'You are a warm, supportive companion inside a wellness app called Endeerment.',
    'You are NOT a therapist or medical professional. Never diagnose or give clinical advice.',
    'Speak gently, validate feelings first, and keep responses short.',
    "Everything you say must be grounded in the user's exact check-in, not generic wellness advice.",
    'Mention concrete details, situations, people, places, or tensions from the check-in whenever possible.',
    'Do not give generic suggestions like "breathe deeply", "drink water", or "take a walk" unless the user\'s words clearly make that relevant.',
    "Suggestions should feel custom-made for this exact check-in and should help with the specific situation the user described.",
    "At least 2 suggestions must directly reference the user's actual context, task, relationship, decision, or emotion.",
    'If the user describes conflict, pressure, avoidance, grief, work stress, guilt, loneliness, or a hard conversation, tailor suggestions to that exact issue.',
    'Prefer suggestions like drafting a specific text, postponing a specific obligation, naming one boundary, writing one sentence, or doing one tiny action related to what they described.',
    'Write suggestions like clean todo items the user could save directly into a task list.',
    'Each suggestion should start with a strong verb and name the specific person, task, message, decision, or problem when possible.',
    'Avoid vague wording like "reflect on it", "take a moment", or "be kind to yourself" unless the user explicitly asked for that kind of support.',
    'You MUST reply with a single valid JSON object and nothing else.',
    'Shape: {"summary": string, "reflection": string, "suggestions": [string, string, string]}',
    '- summary: one sentence distilling what the user shared, mentioning the real issue.',
    "- reflection: 2-3 warm sentences that clearly relate to the user's specific situation.",
    "- suggestions: 2-3 short practical todo-style actions, each under 14 words, and each tied to the user's situation.",
    'Return a fresh response specific to the user.',
  ].join(' ')
}

function createUserPrompt(mode: string, text: string, mood: string, todos: string[]) {
  if (mode === 'brain_dump') {
    return `Brain dump:\n${text}`
  }

  if (mode === 'prioritize_todos') {
    return `Todos to prioritize:\n${todos.map((todo, index) => `${index + 1}. ${todo}`).join('\n')}`
  }

  return `Mood: ${mood}\n\nCheck-in:\n${text}`
}

type RequestLike = {
  method?: string
  body?: unknown
}

type ResponseLike = {
  status: (code: number) => ResponseLike
  setHeader: (name: string, value: string) => void
  json: (body: unknown) => void
  end: (body?: string) => void
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  Object.entries(corsHeaders).forEach(([name, value]) => res.setHeader(name, value))

  if (req.method === 'OPTIONS') {
    res.status(200).end('ok')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  try {
    const body =
      typeof req.body === 'string'
        ? JSON.parse(req.body || '{}')
        : (req.body as Record<string, unknown> | null) ?? {}

    const text = String(body.text ?? '')
    const mood = String(body.mood ?? 'reflective')
    const mode = String(body.mode ?? 'reflect')
    const todos = Array.isArray(body.todos) ? body.todos.map((todo) => String(todo)) : []
    const key = process.env.GROQ_API_KEY
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile'

    if (!key) {
      res.status(200).json(mockByMode(mode, text, mood, todos))
      return
    }

    const systemPrompt = createSystemPrompt(mode)
    const userPrompt = createUserPrompt(mode, text, mood, todos)

    async function callGroq(useJsonMode: boolean) {
      return fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model,
          temperature: mode === 'reflect' ? 0.6 : 0.3,
          ...(useJsonMode ? { response_format: { type: 'json_object' } } : {}),
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      })
    }

    let response = await callGroq(true)
    if (!response.ok) response = await callGroq(false)

    if (!response.ok) {
      const detail = await response.text().catch(() => '')
      res.status(502).json({
        error: 'groq_upstream_error',
        status: response.status,
        detail: detail.slice(0, 500),
      })
      return
    }

    const data = await response.json()
    const content = String(data?.choices?.[0]?.message?.content ?? '{}')
    res.status(200).json(parseByMode(mode, content))
  } catch (error) {
    res.status(500).json({
      error: 'internal',
      detail: String(error instanceof Error ? error.message : error),
    })
  }
}
