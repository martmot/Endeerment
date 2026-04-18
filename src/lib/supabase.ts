import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
const RELATION_STATUS_STORAGE_KEY = 'endeerment:supabase:relation-status'
const RELATION_STATUS_TTL_MS = 12 * 60 * 60 * 1000

type RelationStatusRecord = Record<
  string,
  {
    unavailable: boolean
    checkedAt: number
  }
>

export const supabaseEnabled = Boolean(url && anonKey)

export const supabase: SupabaseClient | null = supabaseEnabled
  ? createClient(url!, anonKey!)
  : null

export function isMissingSupabaseRelationError(
  error: unknown,
  relationNames: string[]
) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as {
    code?: string
    message?: string
    details?: string
    hint?: string
  }

  const haystack = [
    maybeError.code,
    maybeError.message,
    maybeError.details,
    maybeError.hint,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return (
    haystack.includes('pgrst205') ||
    haystack.includes('42p01') ||
    haystack.includes('404') ||
    haystack.includes('not found') ||
    haystack.includes('does not exist') ||
    relationNames.some((name) => haystack.includes(name.toLowerCase()))
  )
}

export function isSupabasePermissionError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const maybeError = error as {
    code?: string
    message?: string
    details?: string
    hint?: string
    status?: number
    statusCode?: number
  }

  const haystack = [
    maybeError.code,
    maybeError.message,
    maybeError.details,
    maybeError.hint,
    String(maybeError.status ?? ''),
    String(maybeError.statusCode ?? ''),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return (
    haystack.includes('42501') ||
    haystack.includes('403') ||
    haystack.includes('permission denied') ||
    haystack.includes('row-level security') ||
    haystack.includes('violates row-level security')
  )
}

function readRelationStatus(): RelationStatusRecord {
  if (typeof localStorage === 'undefined') return {}

  try {
    const raw = localStorage.getItem(RELATION_STATUS_STORAGE_KEY)
    if (!raw) return {}
    return JSON.parse(raw) as RelationStatusRecord
  } catch {
    return {}
  }
}

function writeRelationStatus(status: RelationStatusRecord) {
  if (typeof localStorage === 'undefined') return

  try {
    localStorage.setItem(RELATION_STATUS_STORAGE_KEY, JSON.stringify(status))
  } catch {
    // Ignore private mode or quota issues.
  }
}

export function hasKnownUnavailableSupabaseRelations(relationNames: string[]) {
  const status = readRelationStatus()
  const now = Date.now()

  return relationNames.some((name) => {
    const entry = status[name]
    if (!entry?.unavailable) return false
    return now - entry.checkedAt < RELATION_STATUS_TTL_MS
  })
}

export function markSupabaseRelationsUnavailable(relationNames: string[]) {
  const status = readRelationStatus()
  const checkedAt = Date.now()

  relationNames.forEach((name) => {
    status[name] = { unavailable: true, checkedAt }
  })

  writeRelationStatus(status)
}

export function clearSupabaseRelationStatus(relationNames: string[]) {
  const status = readRelationStatus()
  let changed = false

  relationNames.forEach((name) => {
    if (!status[name]) return
    delete status[name]
    changed = true
  })

  if (changed) writeRelationStatus(status)
}

/**
 * Data model (when Supabase is wired up):
 *
 * profiles
 *   id uuid pk (= auth.users.id)
 *   display_name text
 *   email text
 *   points int default 0
 *   forest_level int default 1
 *   streak int default 0
 *   last_check_in timestamptz
 *   onboarded bool default false
 *   inventory text[] default '{}'
 *   created_at timestamptz default now()
 *
 * check_ins
 *   id uuid pk default gen_random_uuid()
 *   user_id uuid references profiles(id) on delete cascade
 *   text text
 *   mood text
 *   ai_summary text
 *   ai_reflection text
 *   ai_suggestions text[]
 *   created_at timestamptz default now()
 *
 * friendships
 *   user_id uuid
 *   friend_id uuid
 *   created_at timestamptz
 *   pk (user_id, friend_id)
 */
