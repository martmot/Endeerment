import type { BrainDumpResult, Reflection, TodoPriorityResult } from '../types'
import { supabase, supabaseEnabled } from './supabase'

function normalizeImportance(value: unknown): 'high' | 'medium' | 'low' {
  const importance = String(value ?? 'medium').toLowerCase()
  if (importance === 'high' || importance === 'low') return importance
  return 'medium'
}

function normalizeReflection(data: unknown): Reflection {
  const record = (data ?? {}) as Record<string, unknown>
  return {
    summary: String(record.summary ?? ''),
    reflection: String(record.reflection ?? ''),
    suggestions: Array.isArray(record.suggestions)
      ? record.suggestions.map((item) => String(item))
      : [],
  }
}

async function invokeSupabaseReflection(args: {
  text: string
  mood?: string
  mode?: string
  todos?: string[]
}): Promise<unknown | null> {
  if (!supabaseEnabled || !supabase) return null

  const { data, error } = await supabase.functions.invoke('reflect', {
    body: args,
  })

  if (error) {
    const details = String(error.message || '')

    if (
      details.includes('404') ||
      details.includes('Failed to send a request') ||
      details.includes('FunctionsFetchError') ||
      details.includes('Failed to fetch') ||
      details.toLowerCase().includes('cors') ||
      details.toLowerCase().includes('network')
    ) {
      return null
    }

    throw new Error(`Supabase function error: ${details}`)
  }

  return data
}

async function invokeLocalReflection(args: {
  text: string
  mood?: string
  mode?: string
  todos?: string[]
}): Promise<unknown> {
  const response = await fetch('/api/reflect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object' && 'detail' in payload
        ? String((payload as Record<string, unknown>).detail ?? '')
        : ''
    throw new Error(detail || `Reflection request failed (${response.status})`)
  }

  return payload
}

/**
 * Reflection uses the hosted function first and falls back to the local route when needed.
 */
export async function requestReflection(args: {
  text: string
}): Promise<Reflection> {
  try {
    const supabaseResult = await invokeSupabaseReflection(args)
    if (supabaseResult) return normalizeReflection(supabaseResult)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Supabase reflection failed.'
    )
  }

  try {
    return normalizeReflection(await invokeLocalReflection(args))
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Reflection backend is unavailable right now.'
    )
  }
}

function normalizeBrainDumpResult(data: unknown): BrainDumpResult {
  const record = (data ?? {}) as Record<string, unknown>
  const todos = Array.isArray(record.todos) ? record.todos : []

  return {
    summary: String(record.summary ?? ''),
    todos: todos
      .map((item) => {
        const todo = (item ?? {}) as Record<string, unknown>
        return {
          text: String(todo.text ?? '').trim(),
          importance: normalizeImportance(todo.importance),
          reason: String(todo.reason ?? '').trim(),
        }
      })
      .filter((item) => item.text)
      .slice(0, 8),
  }
}

function normalizeTodoPriorityResult(data: unknown): TodoPriorityResult {
  const record = (data ?? {}) as Record<string, unknown>
  const priorities = Array.isArray(record.priorities) ? record.priorities : []

  return {
    priorities: priorities
      .map((item) => {
        const todo = (item ?? {}) as Record<string, unknown>
        return {
          text: String(todo.text ?? '').trim(),
          importance: normalizeImportance(todo.importance),
          reason: String(todo.reason ?? '').trim(),
        }
      })
      .filter((item) => item.text)
      .slice(0, 20),
  }
}

export async function requestBrainDumpTodos(args: {
  text: string
}): Promise<BrainDumpResult> {
  const payload = { text: args.text, mode: 'brain_dump' }

  try {
    const supabaseResult = await invokeSupabaseReflection(payload)
    if (supabaseResult) return normalizeBrainDumpResult(supabaseResult)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Brain dump request failed.'
    )
  }

  try {
    return normalizeBrainDumpResult(await invokeLocalReflection(payload))
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Todo brain dump is unavailable right now.'
    )
  }
}

export async function requestTodoPriorities(args: {
  todos: string[]
}): Promise<TodoPriorityResult> {
  const payload = { text: '', todos: args.todos, mode: 'prioritize_todos' }

  try {
    const supabaseResult = await invokeSupabaseReflection(payload)
    if (supabaseResult) return normalizeTodoPriorityResult(supabaseResult)
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Todo prioritization failed.'
    )
  }

  try {
    return normalizeTodoPriorityResult(await invokeLocalReflection(payload))
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Importance sorting is unavailable right now.'
    )
  }
}
