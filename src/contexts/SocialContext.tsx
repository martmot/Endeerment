import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  FriendRequestRecord,
  FriendRequestWithProfile,
  Profile,
  PublicProfile,
} from '../types'
import {
  clearSupabaseRelationStatus,
  hasKnownUnavailableSupabaseRelations,
  isMissingSupabaseRelationError,
  isSupabasePermissionError,
  markSupabaseRelationsUnavailable,
  supabase,
  supabaseEnabled,
} from '../lib/supabase'
import { useAuth } from './AuthContext'

interface SocialContextValue {
  socialEnabled: boolean
  loading: boolean
  error: string | null
  friends: PublicProfile[]
  incomingRequests: FriendRequestWithProfile[]
  outgoingRequests: FriendRequestWithProfile[]
  refresh: () => Promise<void>
  sendFriendRequest: (email: string) => Promise<{ ok: boolean; message: string }>
  acceptFriendRequest: (requestId: string) => Promise<void>
  declineFriendRequest: (requestId: string) => Promise<void>
  cancelFriendRequest: (requestId: string) => Promise<void>
}

const Ctx = createContext<SocialContextValue | null>(null)
const SOCIAL_RELATIONS = ['profiles_public', 'friend_requests', 'friendships']

function toPublicProfile(profile: Profile): PublicProfile {
  const now = new Date().toISOString()
  return {
    user_id: profile.id,
    email: profile.email.trim().toLowerCase(),
    display_name: profile.display_name,
    points: profile.points,
    forest_level: profile.forest_level,
    streak: profile.streak,
    last_check_in: profile.last_check_in,
    garden: profile.garden,
    created_at: profile.created_at,
    updated_at: now,
  }
}

function byNewest<T extends { created_at: string }>(items: T[]) {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

function byGardenSize(a: PublicProfile, b: PublicProfile) {
  const gardenDiff = b.garden.length - a.garden.length
  if (gardenDiff !== 0) return gardenDiff
  return a.display_name.localeCompare(b.display_name)
}

function getFriendIdsFromRequests(requests: FriendRequestRecord[], currentUserId: string) {
  return requests
    .filter(
      (row) =>
        row.status === 'accepted' &&
        (row.sender_id === currentUserId || row.receiver_id === currentUserId)
    )
    .map((row) => (row.sender_id === currentUserId ? row.receiver_id : row.sender_id))
}

function isMissingRelationError(err: unknown) {
  return isMissingSupabaseRelationError(err, SOCIAL_RELATIONS)
}

function isSocialSetupError(err: unknown) {
  return isMissingRelationError(err) || isSupabasePermissionError(err)
}

function socialSetupMessage() {
  return 'Friends are not set up in Supabase yet. Run the social graph migration for this project.'
}

export function SocialProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth()
  const [friends, setFriends] = useState<PublicProfile[]>([])
  const [incomingRequests, setIncomingRequests] = useState<FriendRequestWithProfile[]>([])
  const [outgoingRequests, setOutgoingRequests] = useState<FriendRequestWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const lastSyncedProfileRef = useRef('')
  const profileRef = useRef(profile)
  const [schemaReady, setSchemaReady] = useState(!supabaseEnabled)
  const [schemaChecked, setSchemaChecked] = useState(!supabaseEnabled)

  useEffect(() => {
    profileRef.current = profile
  }, [profile])

  const markSchemaMissing = useCallback(() => {
    setSchemaReady(false)
    setSchemaChecked(true)
    setError(socialSetupMessage())
    setFriends([])
    setIncomingRequests([])
    setOutgoingRequests([])
  }, [])

  const ensureSocialSchema = useCallback(async () => {
    if (!supabaseEnabled || !supabase) return false
    if (schemaReady) return true
    if (schemaChecked) return false
    if (hasKnownUnavailableSupabaseRelations(SOCIAL_RELATIONS)) {
      markSchemaMissing()
      return false
    }

    const { error: probeError } = await supabase
      .from('profiles_public')
      .select('user_id', { count: 'exact', head: true })

    if (probeError) {
      if (isSocialSetupError(probeError)) {
        markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
        markSchemaMissing()
        return false
      }
      throw probeError
    }

    clearSupabaseRelationStatus(SOCIAL_RELATIONS)
    setSchemaReady(true)
    setSchemaChecked(true)
    return true
  }, [markSchemaMissing, schemaChecked, schemaReady])

  const syncProfile = useCallback(async () => {
    const currentProfile = profileRef.current
    if (!currentProfile || !supabaseEnabled || !supabase) return
    if (!(await ensureSocialSchema())) return

    const nextSnapshot = JSON.stringify(toPublicProfile(currentProfile))
    if (nextSnapshot === lastSyncedProfileRef.current) return

    const { error: syncError } = await supabase
      .from('profiles_public')
      .upsert(toPublicProfile(currentProfile))

    if (syncError) {
      if (isSocialSetupError(syncError)) {
        markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
        markSchemaMissing()
        return
      }
      throw syncError
    }

    clearSupabaseRelationStatus(SOCIAL_RELATIONS)
    lastSyncedProfileRef.current = nextSnapshot
  }, [ensureSocialSchema, markSchemaMissing])

  const refresh = useCallback(async () => {
    const currentProfile = profileRef.current
    if (!currentProfile || !supabaseEnabled || !supabase) {
      setFriends([])
      setIncomingRequests([])
      setOutgoingRequests([])
      setError(null)
      return
    }

    if (!(await ensureSocialSchema())) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      await syncProfile()

      const [{ data: friendshipRows, error: friendshipError }, { data: requestRows, error: requestError }] =
        await Promise.all([
          supabase
            .from('friendships')
            .select('friend_id, created_at')
            .eq('user_id', currentProfile.id),
          supabase
            .from('friend_requests')
            .select(
              'id, sender_id, receiver_id, sender_email, receiver_email, status, created_at, responded_at'
            )
            .or(`sender_id.eq.${currentProfile.id},receiver_id.eq.${currentProfile.id}`),
        ])

      if (friendshipError) throw friendshipError
      if (requestError) throw requestError

      const requestRecords = (requestRows ?? []) as FriendRequestRecord[]
      const friendIds = Array.from(
        new Set([
          ...(friendshipRows ?? []).map((row) => row.friend_id as string).filter(Boolean),
          ...getFriendIdsFromRequests(requestRecords, currentProfile.id),
        ])
      )
      const relatedProfileIds = Array.from(
        new Set(
          [
            ...friendIds,
            ...requestRecords.map((row) => row.sender_id),
            ...requestRecords.map((row) => row.receiver_id),
          ].filter((id) => id && id !== currentProfile.id)
        )
      )

      const profileMap = new Map<string, PublicProfile>()
      if (relatedProfileIds.length > 0) {
        const { data: publicProfiles, error: publicProfilesError } = await supabase
          .from('profiles_public')
          .select(
            'user_id, email, display_name, points, forest_level, streak, last_check_in, garden, created_at, updated_at'
          )
          .in('user_id', relatedProfileIds)

        if (publicProfilesError) throw publicProfilesError
        ;(publicProfiles ?? []).forEach((row) => {
          profileMap.set(row.user_id as string, row as PublicProfile)
        })
      }

      const nextFriends = friendIds
        .map((id) => profileMap.get(id))
        .filter((entry): entry is PublicProfile => Boolean(entry))
        .sort(byGardenSize)

      const nextIncoming = requestRecords
        .filter((row) => row.status === 'pending' && row.receiver_id === currentProfile.id)
        .map((row) => ({
          ...row,
          other_profile: profileMap.get(row.sender_id) ?? {
            user_id: row.sender_id,
            email: row.sender_email,
            display_name: row.sender_email.split('@')[0],
            points: 0,
            forest_level: 1,
            streak: 0,
            last_check_in: null,
            garden: [],
            created_at: row.created_at,
            updated_at: row.created_at,
          },
        }))

      const nextOutgoing = requestRecords
        .filter((row) => row.status === 'pending' && row.sender_id === currentProfile.id)
        .map((row) => ({
          ...row,
          other_profile: profileMap.get(row.receiver_id) ?? {
            user_id: row.receiver_id,
            email: row.receiver_email,
            display_name: row.receiver_email.split('@')[0],
            points: 0,
            forest_level: 1,
            streak: 0,
            last_check_in: null,
            garden: [],
            created_at: row.created_at,
            updated_at: row.created_at,
          },
        }))

      setFriends(nextFriends)
      setIncomingRequests(byNewest(nextIncoming))
      setOutgoingRequests(byNewest(nextOutgoing))
    } catch (err) {
      if (isSocialSetupError(err)) {
        markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
        markSchemaMissing()
        return
      }
      setError(err instanceof Error ? err.message : 'Unable to load friends right now.')
      setFriends([])
      setIncomingRequests([])
      setOutgoingRequests([])
    } finally {
      setLoading(false)
    }
  }, [ensureSocialSchema, markSchemaMissing, syncProfile])

  useEffect(() => {
    if (!profile?.id) {
      setFriends([])
      setIncomingRequests([])
      setOutgoingRequests([])
      setError(null)
      return
    }

    void refresh()
  }, [profile?.id, refresh])

  useEffect(() => {
    if (!profile || !supabaseEnabled || !supabase) return

    const timeoutId = window.setTimeout(() => {
      void syncProfile().catch((err) => {
        if (isSocialSetupError(err)) {
          markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
          markSchemaMissing()
          return
        }
        setError(err instanceof Error ? err.message : 'Unable to sync your profile.')
      })
    }, 500)

    return () => window.clearTimeout(timeoutId)
  }, [
    markSchemaMissing,
    profile?.id,
    profile?.email,
    profile?.display_name,
    profile?.points,
    profile?.forest_level,
    profile?.streak,
    profile?.last_check_in,
    profile?.garden,
    syncProfile,
  ])

  const sendFriendRequest = useCallback(
    async (email: string) => {
      const currentProfile = profileRef.current
      if (!currentProfile) {
        return { ok: false, message: 'You need to be signed in first.' }
      }

      if (!supabaseEnabled || !supabase) {
        return { ok: false, message: 'Friends are not available right now.' }
      }

      if (!(await ensureSocialSchema())) {
        return { ok: false, message: socialSetupMessage() }
      }

      const normalizedEmail = email.trim().toLowerCase()
      if (!normalizedEmail) return { ok: false, message: 'Enter an email address first.' }
      if (normalizedEmail === currentProfile.email.trim().toLowerCase()) {
        return { ok: false, message: 'You cannot send a friend request to yourself.' }
      }

      try {
        await syncProfile()

        const { data: recipient, error: recipientError } = await supabase
          .from('profiles_public')
          .select(
            'user_id, email, display_name, points, forest_level, streak, last_check_in, garden, created_at, updated_at'
          )
          .eq('email', normalizedEmail)
          .maybeSingle()

        if (recipientError) throw recipientError
        if (!recipient) {
          return {
            ok: false,
            message: 'No Endeerment account was found for that email yet.',
          }
        }

        const recipientId = recipient.user_id as string

        const { data: existingFriendship, error: friendshipError } = await supabase
          .from('friendships')
          .select('user_id')
          .eq('user_id', currentProfile.id)
          .eq('friend_id', recipientId)
          .maybeSingle()

        if (friendshipError) throw friendshipError
        if (existingFriendship) {
          return { ok: false, message: 'You are already friends with this person.' }
        }

        const { data: existingRequests, error: existingRequestsError } = await supabase
          .from('friend_requests')
          .select(
            'id, sender_id, receiver_id, sender_email, receiver_email, status, created_at, responded_at'
          )
          .in('sender_id', [currentProfile.id, recipientId])
          .in('receiver_id', [currentProfile.id, recipientId])

        if (existingRequestsError) throw existingRequestsError

        const pendingRequest = (existingRequests ?? []).find((row) => row.status === 'pending')
        if (pendingRequest) {
          if (pendingRequest.sender_id === recipientId) {
            return {
              ok: false,
              message: 'This person already sent you a request. You can accept it below.',
            }
          }
          return { ok: false, message: 'You already have a pending request with this person.' }
        }

        const { error: insertError } = await supabase.from('friend_requests').insert({
          sender_id: currentProfile.id,
          receiver_id: recipientId,
          sender_email: currentProfile.email.trim().toLowerCase(),
          receiver_email: normalizedEmail,
          status: 'pending',
        })

        if (insertError) throw insertError

        await refresh()
        return { ok: true, message: `Friend request sent to ${normalizedEmail}.` }
      } catch (err) {
        if (isSocialSetupError(err)) {
          markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
          markSchemaMissing()
          return { ok: false, message: socialSetupMessage() }
        }
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Unable to send the request right now.',
        }
      }
    },
    [ensureSocialSchema, markSchemaMissing, refresh, syncProfile]
  )

  const updateRequestStatus = useCallback(
    async (requestId: string, status: 'accepted' | 'declined' | 'cancelled') => {
      const currentProfile = profileRef.current
      if (!currentProfile || !supabaseEnabled || !supabase) return
      if (!(await ensureSocialSchema())) return

      const targetRequest =
        incomingRequests.find((request) => request.id === requestId) ??
        outgoingRequests.find((request) => request.id === requestId)

      const { error: updateError } = await supabase
        .from('friend_requests')
        .update({
          status,
          responded_at: new Date().toISOString(),
        })
        .eq('id', requestId)

      if (updateError) {
        if (isSocialSetupError(updateError)) {
          markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
          markSchemaMissing()
          return
        }
        throw updateError
      }

      if (status === 'accepted' && targetRequest) {
        const friendId =
          targetRequest.sender_id === currentProfile.id
            ? targetRequest.receiver_id
            : targetRequest.sender_id

        const { error: friendshipInsertError } = await supabase
          .from('friendships')
          .upsert({ user_id: currentProfile.id, friend_id: friendId })

        if (friendshipInsertError) {
          if (isSocialSetupError(friendshipInsertError)) {
            markSupabaseRelationsUnavailable(SOCIAL_RELATIONS)
            markSchemaMissing()
            return
          }
          throw friendshipInsertError
        }
      }

      await refresh()
    },
    [ensureSocialSchema, incomingRequests, markSchemaMissing, outgoingRequests, refresh]
  )

  const value = useMemo<SocialContextValue>(
    () => ({
      socialEnabled: supabaseEnabled && schemaReady,
      loading,
      error,
      friends,
      incomingRequests,
      outgoingRequests,
      refresh,
      sendFriendRequest,
      acceptFriendRequest: (requestId) => updateRequestStatus(requestId, 'accepted'),
      declineFriendRequest: (requestId) => updateRequestStatus(requestId, 'declined'),
      cancelFriendRequest: (requestId) => updateRequestStatus(requestId, 'cancelled'),
    }),
    [
      error,
      friends,
      incomingRequests,
      loading,
      outgoingRequests,
      refresh,
      schemaReady,
      sendFriendRequest,
      updateRequestStatus,
    ]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useSocial() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useSocial must be used within SocialProvider')
  return ctx
}
