import type { Mood, ShopItem } from '../types'

export const SHOP: ShopItem[] = [
  { id: 'seed_oak', name: 'Oak seed', description: 'A sturdy companion. Grows slow, lasts long.', cost: 20, kind: 'seed', emoji: '🌰' },
  { id: 'seed_willow', name: 'Willow seed', description: 'Bends with the weather. Soft & generous.', cost: 25, kind: 'seed', emoji: '🌱' },
  { id: 'seed_pine', name: 'Pine seed', description: 'Steady across seasons.', cost: 30, kind: 'seed', emoji: '🌲' },
  { id: 'tree_cherry', name: 'Cherry tree', description: 'A sudden burst of pink in your clearing.', cost: 120, kind: 'tree', emoji: '🌸' },
  { id: 'tree_maple', name: 'Maple tree', description: 'Warm reds in the evening light.', cost: 160, kind: 'tree', emoji: '🍁' },
  { id: 'deco_lantern', name: 'Paper lantern', description: 'A soft light for the quieter nights.', cost: 45, kind: 'decoration', emoji: '🏮' },
  { id: 'deco_stone', name: 'Mossy stone', description: 'Good for sitting next to the deer.', cost: 35, kind: 'decoration', emoji: '🪨' },
  { id: 'deco_mushroom', name: 'Tiny mushroom ring', description: 'Fairy-built. Very small. Very charming.', cost: 60, kind: 'decoration', emoji: '🍄' },
]

const MOOD_META: Record<Mood, { label: string; emoji: string; hue: string }> = {
  calm: { label: 'Calm', emoji: '🍃', hue: '#7FAE87' },
  hopeful: { label: 'Hopeful', emoji: '🌤️', hue: '#F3B562' },
  tired: { label: 'Tired', emoji: '🌙', hue: '#A7A0D8' },
  anxious: { label: 'Anxious', emoji: '💨', hue: '#F08A8A' },
  heavy: { label: 'Heavy', emoji: '🌧️', hue: '#6F8FAF' },
  joyful: { label: 'Joyful', emoji: '✨', hue: '#E6C15A' },
}

export function moodMeta(mood: Mood) {
  return MOOD_META[mood]
}

export const MOODS = Object.entries(MOOD_META).map(([value, meta]) => ({
  value: value as Mood,
  ...meta,
}))
