export interface Profile {
  id: string
  email: string
  display_name: string
  points: number
  forest_level: number
  streak: number
  last_check_in: string | null
  last_daily_gift_at: string | null
  onboarded: boolean
  inventory: string[]
  garden: GardenPlant[]
  created_at: string
}

export interface PublicProfile {
  user_id: string
  email: string
  display_name: string
  points: number
  forest_level: number
  streak: number
  last_check_in: string | null
  garden: GardenPlant[]
  created_at: string
  updated_at: string
}

export type FriendRequestStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export interface FriendRequestRecord {
  id: string
  sender_id: string
  receiver_id: string
  sender_email: string
  receiver_email: string
  status: FriendRequestStatus
  created_at: string
  responded_at: string | null
}

export interface FriendRequestWithProfile extends FriendRequestRecord {
  other_profile: PublicProfile
}

export interface GardenPlant {
  id: string
  shop_item_id: string
  stage: 0 | 1 | 2 | 3
  planted_at: string
  last_grew_at: string | null
}

export interface Reflection {
  summary: string
  reflection: string
  suggestions: string[]
}

export type Mood = 'calm' | 'hopeful' | 'tired' | 'anxious' | 'heavy' | 'joyful'

export interface CheckIn {
  id: string
  created_at: string
  text: string
  mood?: Mood
  ai_summary: string
  ai_reflection: string
  ai_suggestions: string[]
}

export interface TodoItem {
  id: string
  text: string
  created_at: string
  completed_at: string | null
  source_check_in_id: string | null
  importance: 'high' | 'medium' | 'low'
  importance_reason: string | null
  ai_ranked_at: string | null
}

export interface BrainDumpTodoSuggestion {
  text: string
  importance: 'high' | 'medium' | 'low'
  reason: string
}

export interface BrainDumpResult {
  summary: string
  todos: BrainDumpTodoSuggestion[]
}

export interface TodoPriorityResult {
  priorities: BrainDumpTodoSuggestion[]
}

export interface PetState {
  name: string
  happiness: number
  bond: number
  level: number
  xp: number
  mood: 'cheerful' | 'curious' | 'sleepy' | 'playful'
  last_interaction: string | null
  last_action_at: string | null
  last_decay_at: string | null
}

export interface ShopItem {
  id: string
  name: string
  description: string
  cost: number
  kind: 'seed' | 'tree' | 'decoration'
}
