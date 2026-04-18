import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

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
    haystack.includes('not found') ||
    haystack.includes('does not exist') ||
    relationNames.some((name) => haystack.includes(name.toLowerCase()))
  )
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
