import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { CheckIn, PetState, Reflection, TodoItem } from '../types'
import { read, remove, write } from '../lib/storage'
import { daysBetween, uid } from '../lib/utils'
import { useAuth } from './AuthContext'
import {
  clearSupabaseRelationStatus,
  hasKnownUnavailableSupabaseRelations,
  isMissingSupabaseRelationError,
  markSupabaseRelationsUnavailable,
  supabase,
  supabaseEnabled,
} from '../lib/supabase'

interface UserDataContextValue {
  checkIns: CheckIn[]
  todos: TodoItem[]
  pet: PetState
  canClaimDailyGift: boolean
  dailyGiftAmount: number
  addCheckIn: (args: { text: string; reflection: Reflection }) => CheckIn
  claimDailyGift: () => { success: boolean; pointsAwarded: number }
  addTodo: (
    text: string,
    sourceCheckInId?: string | null,
    options?: {
      importance?: TodoItem['importance']
      importanceReason?: string | null
      aiRankedAt?: string | null
    }
  ) => TodoItem | null
  toggleTodo: (id: string) => void
  deleteTodo: (id: string) => void
  updateTodoImportance: (
    id: string,
    importance: TodoItem['importance'],
    importanceReason?: string | null,
    aiRankedAt?: string | null
  ) => void
  deleteCheckIn: (id: string) => void
  interactWithPet: (action: 'pet' | 'feed' | 'walk' | 'rest') => boolean
  helpGardenWithPet: () => {
    success: boolean
    plantsGrown: number
    grownPlantIds: string[]
    reason?: 'too_tired'
  }
  renamePet: (name: string) => void
}

const Ctx = createContext<UserDataContextValue | null>(null)

const DEFAULT_PET: PetState = {
  name: 'Sorrel',
  happiness: 62,
  bond: 20,
  level: 1,
  xp: 0,
  mood: 'curious',
  last_interaction: null,
  last_action_at: null,
  last_decay_at: null,
}

const PET_ACTION_COOLDOWN_MS = 20 * 60 * 1000
const PET_XP_PER_LEVEL = 12
const APP_STATE_KEY = 'app_state'
const APP_STATE_TABLE = 'app_state'

function calculateDailyGift(profilePoints: number, streak: number, happiness: number, bond: number) {
  return (
    6 +
    Math.min(streak, 7) +
    Math.floor(happiness / 25) +
    Math.floor(bond / 25) +
    Math.floor(profilePoints / 150)
  )
}

function normalizeTodo(todo: TodoItem): TodoItem {
  return {
    ...todo,
    importance: todo.importance ?? 'medium',
    importance_reason: todo.importance_reason ?? null,
    ai_ranked_at: todo.ai_ranked_at ?? null,
  }
}

function decayPetState(current: PetState, nowIso: string) {
  const reference = current.last_decay_at ?? current.last_interaction
  if (!reference) return current

  const daysAway = daysBetween(reference, nowIso)
  if (!Number.isFinite(daysAway) || daysAway <= 0) return current

  const nextHappiness = Math.max(0, current.happiness - daysAway * 4)
  const nextBond = Math.max(0, current.bond - daysAway * 2)
  const nextMood = daysAway >= 4 ? 'sleepy' : daysAway >= 2 ? 'curious' : current.mood

  return {
    ...current,
    happiness: nextHappiness,
    bond: nextBond,
    mood: nextMood,
    last_decay_at: nowIso,
  }
}

function applyPetProgress(current: PetState, xpGain: number) {
  const totalXp = current.xp + xpGain
  return {
    ...current,
    level: Math.floor(totalXp / PET_XP_PER_LEVEL) + 1,
    xp: totalXp,
  }
}

function isMissingAppStateTableError(error: unknown) {
  return isMissingSupabaseRelationError(error, [APP_STATE_TABLE])
}

function normalizePetState(petState: unknown): PetState {
  return {
    ...DEFAULT_PET,
    ...(petState as Partial<PetState> | null),
  }
}

export function UserDataProvider({ children }: { children: React.ReactNode }) {
  const { profile, updateProfile } = useAuth()
  const remoteHydratedRef = useRef(false)
  const lastSyncedStateRef = useRef('')
  const syncTimeoutRef = useRef<number | null>(null)

  const [checkIns, setCheckIns] = useState<CheckIn[]>(() =>
    supabaseEnabled ? [] : read<CheckIn[]>('checkIns', [])
  )
  const [todos, setTodos] = useState<TodoItem[]>(() =>
    supabaseEnabled ? [] : read<TodoItem[]>('todos', []).map(normalizeTodo)
  )
  const [pet, setPet] = useState<PetState>(() =>
    supabaseEnabled ? DEFAULT_PET : read<PetState>('pet', DEFAULT_PET)
  )

  useEffect(() => {
    if (!supabaseEnabled) write('checkIns', checkIns)
  }, [checkIns])

  useEffect(() => {
    if (!supabaseEnabled) write('todos', todos)
  }, [todos])

  useEffect(() => {
    if (!supabaseEnabled) write('pet', pet)
  }, [pet])

  useEffect(() => {
    if (!supabaseEnabled || !supabase || !profile?.id) {
      remoteHydratedRef.current = !supabaseEnabled
      return
    }

    let active = true

    ;(async () => {
      const localCheckIns = read<CheckIn[]>('checkIns', [])
      const localTodos = read<TodoItem[]>('todos', []).map(normalizeTodo)
      const localPet = read<PetState>('pet', DEFAULT_PET)

      let metadataState: Record<string, unknown> = {}
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (!authError && authData.user) {
        const metadata = (authData.user.user_metadata ?? {}) as Record<string, unknown>
        metadataState = ((metadata[APP_STATE_KEY] as Record<string, unknown> | undefined) ?? {})
      }

      const metadataCheckIns = Array.isArray(metadataState.checkIns)
        ? (metadataState.checkIns as CheckIn[])
        : []
      const metadataTodos = Array.isArray(metadataState.todos)
        ? (metadataState.todos as TodoItem[]).map(normalizeTodo)
        : []
      const metadataPet = normalizePetState(metadataState.pet)

      if (hasKnownUnavailableSupabaseRelations([APP_STATE_TABLE])) {
        const nextCheckIns = localCheckIns.length > 0 ? localCheckIns : metadataCheckIns
        const nextTodos = localTodos.length > 0 ? localTodos : metadataTodos
        const nextPet =
          JSON.stringify(localPet) !== JSON.stringify(DEFAULT_PET) ? localPet : metadataPet

        setCheckIns(nextCheckIns)
        setTodos(nextTodos)
        setPet(nextPet)
        lastSyncedStateRef.current = JSON.stringify({
          checkIns: nextCheckIns,
          todos: nextTodos,
          pet: nextPet,
        })
        remoteHydratedRef.current = true
        return
      }

      try {
        const { data, error } = await supabase
          .from(APP_STATE_TABLE)
          .select('check_ins, todos, pet')
          .eq('user_id', profile.id)
          .maybeSingle()

        if (error) throw error
        if (!active) return

        const nextCheckIns = Array.isArray(data?.check_ins)
          ? (data.check_ins as CheckIn[])
          : localCheckIns.length > 0
            ? localCheckIns
            : metadataCheckIns
        const nextTodos = Array.isArray(data?.todos)
          ? (data.todos as TodoItem[]).map(normalizeTodo)
          : localTodos.length > 0
            ? localTodos
            : metadataTodos
        const nextPet =
          data?.pet && typeof data.pet === 'object'
            ? normalizePetState(data.pet)
            : JSON.stringify(localPet) !== JSON.stringify(DEFAULT_PET)
              ? localPet
              : metadataPet

        setCheckIns(nextCheckIns)
        setTodos(nextTodos)
        setPet(nextPet)
        lastSyncedStateRef.current = JSON.stringify({
          checkIns: nextCheckIns,
          todos: nextTodos,
          pet: nextPet,
        })

        if (!data) {
          await supabase.from(APP_STATE_TABLE).upsert({
            user_id: profile.id,
            check_ins: nextCheckIns,
            todos: nextTodos,
            pet: nextPet,
          })
        }

        clearSupabaseRelationStatus([APP_STATE_TABLE])
        remove('checkIns')
        remove('todos')
        remove('pet')
        remoteHydratedRef.current = true
      } catch (error) {
        if (!active) return
        if (!isMissingAppStateTableError(error)) throw error
        markSupabaseRelationsUnavailable([APP_STATE_TABLE])

        const nextCheckIns = localCheckIns.length > 0 ? localCheckIns : metadataCheckIns
        const nextTodos = localTodos.length > 0 ? localTodos : metadataTodos
        const nextPet =
          JSON.stringify(localPet) !== JSON.stringify(DEFAULT_PET) ? localPet : metadataPet

        setCheckIns(nextCheckIns)
        setTodos(nextTodos)
        setPet(nextPet)
        lastSyncedStateRef.current = JSON.stringify({
          checkIns: nextCheckIns,
          todos: nextTodos,
          pet: nextPet,
        })
        remoteHydratedRef.current = true
      }
    })()

    return () => {
      active = false
    }
  }, [profile?.id])

  useEffect(() => {
    if (!supabaseEnabled || !supabase || !profile?.id || !remoteHydratedRef.current) return
    if (hasKnownUnavailableSupabaseRelations([APP_STATE_TABLE])) return

    const nextState = JSON.stringify({ checkIns, todos, pet })
    if (nextState === lastSyncedStateRef.current) return

    if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current)

    syncTimeoutRef.current = window.setTimeout(() => {
      const client = supabase
      if (!client) return

      void client
        .from(APP_STATE_TABLE)
        .upsert({
          user_id: profile.id,
          check_ins: checkIns,
          todos,
          pet,
        })
        .then(({ error }) => {
          if (!error) {
            clearSupabaseRelationStatus([APP_STATE_TABLE])
            lastSyncedStateRef.current = nextState
            return
          }

          if (isMissingAppStateTableError(error)) {
            markSupabaseRelationsUnavailable([APP_STATE_TABLE])
            lastSyncedStateRef.current = nextState
          }
        })
    }, 900)

    return () => {
      if (syncTimeoutRef.current) window.clearTimeout(syncTimeoutRef.current)
    }
  }, [checkIns, todos, pet, profile?.id])

  useEffect(() => {
    const now = new Date().toISOString()
    setPet((current) => {
      const next = decayPetState(current, now)
      return JSON.stringify(next) === JSON.stringify(current) ? current : next
    })
  }, [])

  const value = useMemo<UserDataContextValue>(
    () => ({
      checkIns,
      todos: [...todos].sort((a, b) => {
        if (a.completed_at && !b.completed_at) return 1
        if (!a.completed_at && b.completed_at) return -1
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }),
      pet,
      canClaimDailyGift: Boolean(
        profile && daysBetween(profile.last_daily_gift_at, new Date().toISOString()) > 0
      ),
      dailyGiftAmount: profile
        ? calculateDailyGift(profile.points, profile.streak, pet.happiness, pet.bond)
        : 0,
      addCheckIn({ text, reflection }) {
        const now = new Date().toISOString()
        const entry: CheckIn = {
          id: uid(),
          created_at: now,
          text,
          ai_summary: reflection.summary,
          ai_reflection: reflection.reflection,
          ai_suggestions: reflection.suggestions,
        }
        setCheckIns((prev) => [entry, ...prev].slice(0, 200))

        if (profile) {
          const gap = daysBetween(profile.last_check_in, now)
          const nextStreak = gap === 1 ? profile.streak + 1 : gap === 0 ? profile.streak : 1
          const pointsEarned = 10 + Math.min(nextStreak, 10)
          const nextLevel =
            profile.forest_level + (checkIns.length > 0 && (checkIns.length + 1) % 5 === 0 ? 1 : 0)
          void updateProfile({
            last_check_in: now,
            streak: nextStreak,
            points: profile.points + pointsEarned,
            forest_level: nextLevel,
          })
        }

        setPet((current) => ({
          ...current,
          happiness: Math.min(100, current.happiness + 5),
          bond: Math.min(100, current.bond + 2),
          last_interaction: now,
        }))

        return entry
      },
      claimDailyGift() {
        if (!profile) return { success: false, pointsAwarded: 0 }

        const now = new Date().toISOString()
        if (daysBetween(profile.last_daily_gift_at, now) === 0) {
          return { success: false, pointsAwarded: 0 }
        }

        const pointsAwarded = calculateDailyGift(
          profile.points,
          profile.streak,
          pet.happiness,
          pet.bond
        )
        void updateProfile({
          points: profile.points + pointsAwarded,
          last_daily_gift_at: now,
        })

        setPet((current) => ({
          ...current,
          happiness: Math.min(100, current.happiness + 4),
          bond: Math.min(100, current.bond + 2),
          last_interaction: now,
        }))

        return { success: true, pointsAwarded }
      },
      addTodo(text, sourceCheckInId = null, options) {
        const trimmed = text.trim()
        if (!trimmed) return null

        const existing = todos.find(
          (todo) => todo.text.toLowerCase() === trimmed.toLowerCase() && !todo.completed_at
        )
        if (existing) return existing

        const next: TodoItem = {
          id: uid(),
          text: trimmed,
          created_at: new Date().toISOString(),
          completed_at: null,
          source_check_in_id: sourceCheckInId,
          importance: options?.importance ?? 'medium',
          importance_reason: options?.importanceReason ?? null,
          ai_ranked_at: options?.aiRankedAt ?? null,
        }

        setTodos((prev) => [next, ...prev])
        return next
      },
      toggleTodo(id) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed_at: todo.completed_at ? null : new Date().toISOString(),
                }
              : todo
          )
        )
      },
      deleteTodo(id) {
        setTodos((prev) => prev.filter((todo) => todo.id !== id))
      },
      updateTodoImportance(
        id,
        importance,
        importanceReason = null,
        aiRankedAt = new Date().toISOString()
      ) {
        setTodos((prev) =>
          prev.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  importance,
                  importance_reason: importanceReason,
                  ai_ranked_at: aiRankedAt,
                }
              : todo
          )
        )
      },
      deleteCheckIn(id) {
        setCheckIns((prev) => prev.filter((entry) => entry.id !== id))
        setTodos((prev) => prev.filter((todo) => todo.source_check_in_id !== id))
      },
      interactWithPet(action) {
        const now = new Date().toISOString()
        let interacted = false

        setPet((current) => {
          const decayed = decayPetState(current, now)

          if (
            decayed.last_action_at &&
            new Date(now).getTime() - new Date(decayed.last_action_at).getTime() <
              PET_ACTION_COOLDOWN_MS
          ) {
            return decayed
          }

          if (action === 'walk' && decayed.happiness <= 0) {
            return decayed
          }

          const deltas = {
            pet: { happiness: 4, bond: 3, mood: 'cheerful' as const, xp: 2 },
            feed: { happiness: 6, bond: 2, mood: 'playful' as const, xp: 3 },
            walk: { happiness: 3, bond: 5, mood: 'curious' as const, xp: 4 },
            rest: { happiness: 2, bond: 1, mood: 'sleepy' as const, xp: 1 },
          }[action]

          interacted = true
          return applyPetProgress(
            {
              ...decayed,
              happiness: Math.min(100, decayed.happiness + deltas.happiness),
              bond: Math.min(100, decayed.bond + deltas.bond),
              mood: deltas.mood,
              last_interaction: now,
              last_action_at: now,
              last_decay_at: now,
            },
            deltas.xp
          )
        })

        if (interacted && profile) {
          void updateProfile({ points: profile.points + 1 })
        }

        return interacted
      },
      helpGardenWithPet() {
        const now = new Date().toISOString()
        let happinessSnapshot = pet.happiness
        let blocked = false

        setPet((current) => {
          const decayed = decayPetState(current, now)
          happinessSnapshot = decayed.happiness

          if (decayed.happiness <= 0) {
            blocked = true
            return decayed
          }

          return applyPetProgress(
            {
              ...decayed,
              happiness: Math.max(0, decayed.happiness - 12),
              bond: Math.min(100, decayed.bond + 3),
              mood: 'playful',
              last_interaction: now,
              last_action_at: now,
              last_decay_at: now,
            },
            3
          )
        })

        if (blocked) {
          return { success: false, plantsGrown: 0, grownPlantIds: [], reason: 'too_tired' as const }
        }

        if (!profile) return { success: false, plantsGrown: 0, grownPlantIds: [] }

        const garden = [...profile.garden]
        const growable = garden
          .map((plant, index) => ({ plant, index }))
          .filter(({ plant }) => plant.stage < 3)
          .sort(
            (a, b) =>
              new Date(a.plant.planted_at).getTime() - new Date(b.plant.planted_at).getTime()
          )

        const plantsToGrow = Math.min(
          growable.length,
          happinessSnapshot >= 80 ? 3 : happinessSnapshot >= 55 ? 2 : 1
        )
        const selectedPlants = growable.slice(0, plantsToGrow)
        const grownPlantIds = selectedPlants.map(({ plant }) => plant.id)

        if (plantsToGrow > 0) {
          const nextGarden = garden.map((plant, index) => {
            const selected = selectedPlants.find((entry) => entry.index === index)
            if (!selected) return plant
            return {
              ...plant,
              stage: Math.min(3, plant.stage + 1) as 0 | 1 | 2 | 3,
              last_grew_at: now,
            }
          })

          void updateProfile({ garden: nextGarden })
        }

        return { success: true, plantsGrown: plantsToGrow, grownPlantIds }
      },
      renamePet(name) {
        const trimmed = name.trim()
        if (!trimmed) return
        setPet((current) => ({ ...current, name: trimmed }))
      },
    }),
    [checkIns, todos, pet, profile, updateProfile]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useUserData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUserData must be used within UserDataProvider')
  return ctx
}
