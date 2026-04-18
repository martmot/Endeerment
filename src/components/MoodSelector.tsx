import type { Mood } from '../types'
import { MOODS } from '../lib/mock-data'

export function MoodSelector({
  value,
  onChange,
}: {
  value: Mood | null
  onChange: (mood: Mood) => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {MOODS.map((mood) => {
        const active = value === mood.value

        return (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={`rounded-lg border px-4 py-4 text-left transition ${
              active
                ? 'border-transparent bg-white text-forest-950 shadow-soft'
                : 'border-white/10 bg-white/5 text-forest-100/80 hover:bg-white/10'
            }`}
          >
            <div className="text-2xl">{mood.emoji}</div>
            <div className="mt-2 text-sm font-medium">{mood.label}</div>
          </button>
        )
      })}
    </div>
  )
}
