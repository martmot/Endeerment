import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '../types'
import { clearAll, read, remove, write } from '../lib/storage'
import {
  clearSupabaseRelationStatus,
  hasKnownUnavailableSupabaseRelations,
  isMissingSupabaseRelationError,
  markSupabaseRelationsUnavailable,
  supabase,
  supabaseEnabled,
} from '../lib/supabase'
import { uid } from '../lib/utils'

interface AuthContextValue {
  profile: Profile | null
  loading: boolean
  authMode: 'demo' | 'supabase'
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, displayName?: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (patch: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const LEGACY_KEY = 'profile'
const PROFILE_STATE_KEY = 'profile_state'
const PROFILE_TABLE = 'profiles'
const GOOGLE_PROVIDER_DISABLED = 'Unsupported provider: provider is not enabled'
const configuredAppUrl = (import.meta.env.VITE_APP_URL as string | undefined)?.trim()

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '')
}

function getOAuthRedirectUrl() {
  const configuredOrigin = configuredAppUrl ? trimTrailingSlash(configuredAppUrl) : null
  const runtimeOrigin =
    typeof window !== 'undefined' ? trimTrailingSlash(window.location.origin) : null

  // In production we prefer an explicit public app URL when available so OAuth never
  // accidentally points at a stale local origin from older config.
  const baseUrl =
    !import.meta.env.DEV && configuredOrigin ? configuredOrigin : runtimeOrigin ?? configuredOrigin

  if (!baseUrl) {
    throw new Error('Missing app URL for Google sign-in.')
  }

  return baseUrl
}

function profileKey(userId: string) {
  return `profile:${userId}`
}

function makeProfile(args: {
  id: string
  email: string
  displayName?: string
  createdAt?: string
}): Profile {
  const source = args.displayName?.trim() || args.email.trim().split('@')[0] || 'Quiet Friend'
  const fallbackName = source.replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

  return {
    id: args.id,
    email: args.email,
    display_name: args.displayName?.trim() || fallbackName,
    points: 30,
    forest_level: 1,
    streak: 0,
    last_check_in: null,
    last_daily_gift_at: null,
    onboarded: false,
    inventory: [],
    garden: [],
    created_at: args.createdAt ?? new Date().toISOString(),
  }
}

function mergeProfile(base: Profile, patch: Partial<Profile>) {
  const resolvedDisplayName =
    typeof patch.display_name === 'string' && patch.display_name.trim()
      ? patch.display_name.trim()
      : base.display_name?.trim() ||
        makeProfile({ id: base.id, email: patch.email ?? base.email }).display_name

  return {
    ...base,
    ...patch,
    id: base.id,
    email: patch.email ?? base.email,
    display_name: resolvedDisplayName,
    last_daily_gift_at: patch.last_daily_gift_at ?? base.last_daily_gift_at ?? null,
    inventory: patch.inventory ?? base.inventory ?? [],
    garden: patch.garden ?? base.garden ?? [],
  }
}

function isMissingProfileTableError(error: unknown) {
  return isMissingSupabaseRelationError(error, [PROFILE_TABLE])
}

function getStoredProfile(user: User): Profile {
  const savedMetadata = (user.user_metadata?.[PROFILE_STATE_KEY] as Profile | undefined) ?? null
  const savedLocal =
    read<Profile | null>(profileKey(user.id), null) ?? read<Profile | null>(LEGACY_KEY, null)
  const saved = savedMetadata ?? savedLocal
  const derivedDisplayName =
    (typeof user.user_metadata.display_name === 'string' && user.user_metadata.display_name.trim()) ||
    (typeof user.user_metadata.full_name === 'string' && user.user_metadata.full_name.trim()) ||
    (typeof user.user_metadata.name === 'string' && user.user_metadata.name.trim()) ||
    saved?.display_name ||
    undefined

  return mergeProfile(
    saved ??
      makeProfile({
        id: user.id,
        email: user.email ?? '',
        displayName: derivedDisplayName,
        createdAt: user.created_at,
      }),
    {
      email: user.email ?? saved?.email ?? '',
      display_name: derivedDisplayName,
    }
  )
}

async function upsertProfile(next: Profile) {
  if (!supabase) return
  const { error } = await supabase.from(PROFILE_TABLE).upsert(next)
  if (error) throw error
}

async function profileFromUser(user: User) {
  const stored = getStoredProfile(user)
  const key = profileKey(user.id)

  if (!supabaseEnabled || !supabase) {
    write(key, stored)
    write(LEGACY_KEY, stored)
    return stored
  }

  if (hasKnownUnavailableSupabaseRelations([PROFILE_TABLE])) {
    write(key, stored)
    write(LEGACY_KEY, stored)
    return stored
  }

  try {
    const { data, error } = await supabase
      .from(PROFILE_TABLE)
      .select(
        'id, email, display_name, points, forest_level, streak, last_check_in, last_daily_gift_at, onboarded, inventory, garden, created_at'
      )
      .eq('id', user.id)
      .maybeSingle()

    if (error) throw error

    const next = mergeProfile((data as Profile | null) ?? stored, {
      email: user.email ?? stored.email,
    })

    if (!data || JSON.stringify(data) !== JSON.stringify(next)) {
      await upsertProfile(next)
    }

    clearSupabaseRelationStatus([PROFILE_TABLE])
    remove(key)
    remove(LEGACY_KEY)
    return next
  } catch (error) {
    if (isMissingProfileTableError(error)) {
      markSupabaseRelationsUnavailable([PROFILE_TABLE])
      write(key, stored)
      write(LEGACY_KEY, stored)
      return stored
    }
    throw error
  }
}

async function profileFromSession(session: Session | null) {
  if (!session?.user) return null
  return profileFromUser(session.user)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function bootstrap() {
      if (!supabaseEnabled || !supabase) {
        const saved = read<Profile | null>(LEGACY_KEY, null)
        if (!alive) return
        setProfile(saved)
        setLoading(false)
        return
      }

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!alive) return
      setProfile(await profileFromSession(session))
      setLoading(false)

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, nextSession) => {
        if (event === 'USER_UPDATED') return
        void profileFromSession(nextSession).then((nextProfile) => {
          if (!alive) return
          setProfile(nextProfile)
        })
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    let cleanup: (() => void) | undefined
    void bootstrap().then((nextCleanup) => {
      cleanup = nextCleanup
    })

    return () => {
      alive = false
      cleanup?.()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      loading,
      authMode: supabaseEnabled ? 'supabase' : 'demo',
      async signIn(email, password) {
        if (supabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })
          if (error) throw error
          setProfile(await profileFromSession(data.session))
          return
        }

        const existing = read<Profile | null>(LEGACY_KEY, null)
        const next =
          existing && existing.email === email.trim()
            ? existing
            : makeProfile({ id: uid(), email: email.trim() })
        write(LEGACY_KEY, next)
        setProfile(next)
      },
      async signUp(email, password, displayName) {
        if (supabaseEnabled && supabase) {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              data: {
                display_name: displayName?.trim() || undefined,
              },
            },
          })
          if (error) throw error
          setProfile(await profileFromSession(data.session))
          return
        }

        const next = makeProfile({
          id: uid(),
          email: email.trim(),
          displayName,
        })
        write(LEGACY_KEY, next)
        setProfile(next)
      },
      async signInWithGoogle() {
        if (!supabaseEnabled || !supabase) {
          throw new Error('Google sign-in is not available right now.')
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: getOAuthRedirectUrl(),
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account',
            },
          },
        })

        if (error) {
          if (error.message.includes(GOOGLE_PROVIDER_DISABLED)) {
            throw new Error('Google sign-in is not available for this app yet.')
          }
          throw error
        }
      },
      async signOut() {
        if (supabaseEnabled && supabase) {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
        } else {
          clearAll()
        }
        setProfile(null)
      },
      async updateProfile(patch) {
        let nextProfile: Profile | null = null

        setProfile((current) => {
          if (!current) return current
          nextProfile = mergeProfile(current, patch)
          if (!supabaseEnabled && nextProfile) {
            write(LEGACY_KEY, nextProfile)
            write(profileKey(nextProfile.id), nextProfile)
          }
          return nextProfile
        })

        if (!nextProfile || !supabaseEnabled || !supabase) return
        const persistedProfile = nextProfile as Profile

        try {
          await upsertProfile(persistedProfile)
          clearSupabaseRelationStatus([PROFILE_TABLE])
        } catch (error) {
          if (isMissingProfileTableError(error)) {
            markSupabaseRelationsUnavailable([PROFILE_TABLE])
            write(profileKey(persistedProfile.id), persistedProfile)
            write(LEGACY_KEY, persistedProfile)
            return
          }
          throw error
        }
      },
    }),
    [profile, loading]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
