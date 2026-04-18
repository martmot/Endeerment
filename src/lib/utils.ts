import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function greetingFor(date = new Date()) {
  const h = date.getHours()
  if (h < 5) return 'Still awake'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'A gentle night'
}

export function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function daysBetween(aIso: string | null, bIso: string) {
  if (!aIso) return Infinity
  const a = new Date(aIso)
  const b = new Date(bIso)
  const ms = Math.abs(b.setHours(0, 0, 0, 0) - a.setHours(0, 0, 0, 0))
  return Math.floor(ms / 86400000)
}

export function uid() {
  return (
    Math.random().toString(36).slice(2, 10) +
    Date.now().toString(36).slice(-4)
  )
}
