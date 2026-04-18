import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Apple, Hand, Moon, Mountain, PencilLine, Sparkles } from 'lucide-react'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Forest } from '../components/Forest'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../contexts/UserDataContext'
import { formatDate } from '../lib/utils'

const ACTION_COOLDOWN_MS = 20 * 60 * 1000

const ACTION_COPY = {
  pet: { label: 'Pet', detail: '+bond', icon: <Hand size={16} /> },
  feed: { label: 'Offer an apple', detail: '+happiness', icon: <Apple size={16} /> },
  walk: { label: 'Walk the ridge', detail: '+bond +xp', icon: <Mountain size={16} /> },
  rest: { label: 'Rest together', detail: '+calm', icon: <Moon size={16} /> },
} as const

type PetAction = keyof typeof ACTION_COPY

export function Pet() {
  const { profile } = useAuth()
  const { pet, interactWithPet, renamePet } = useUserData()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(pet.name)
  const [activeAction, setActiveAction] = useState<PetAction | null>(null)
  const [cooldownUntil, setCooldownUntil] = useState<number>(0)
  const [clock, setClock] = useState(Date.now())

  useEffect(() => {
    setName(pet.name)
  }, [pet.name])

  useEffect(() => {
    if (!pet.last_action_at) {
      setCooldownUntil(0)
      return
    }

    setCooldownUntil(new Date(pet.last_action_at).getTime() + ACTION_COOLDOWN_MS)
  }, [pet.last_action_at])

  useEffect(() => {
    if (Date.now() >= cooldownUntil) return

    const id = window.setInterval(() => {
      setClock(Date.now())
    }, 1000)

    return () => window.clearInterval(id)
  }, [cooldownUntil])

  const now = clock
  const coolingDown = now < cooldownUntil
  const cooldownRemaining = Math.max(0, cooldownUntil - now)
  const cooldownMinutes = Math.floor(cooldownRemaining / 60000)
  const cooldownSeconds = Math.floor((cooldownRemaining % 60000) / 1000)
  const nextLevelAt = Math.ceil(pet.xp / 12) * 12 || 12
  const levelProgress = ((pet.xp % 12) / 12) * 100
  const moodLabel = pet.mood.charAt(0).toUpperCase() + pet.mood.slice(1)
  const garden = useMemo(
    () =>
      profile
        ? [...profile.garden].sort(
            (a, b) => new Date(b.planted_at).getTime() - new Date(a.planted_at).getTime()
          )
        : [],
    [profile]
  )

  function triggerAction(action: PetAction) {
    const allowed = interactWithPet(action)
    if (!allowed) return

    setActiveAction(action)
    window.setTimeout(() => setActiveAction(null), action === 'walk' ? 2200 : 1400)
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">Your companion</div>
        <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          {pet.name}
        </h1>
        <p className="mt-1.5 max-w-xl text-ink-muted">
          A deer who grows close in small, consistent ways. If you stay away too long, the bond softens and needs a little care again.
        </p>
      </header>

      <div className="bento">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 md:col-span-7"
        >
          <Card className="p-0">
            <div className="relative overflow-hidden rounded-xl">
              <Forest
                level={profile?.forest_level ?? 1}
                inventory={profile?.inventory ?? []}
                garden={garden}
                petHappiness={pet.happiness}
                petMood={pet.mood}
                petName={pet.name}
                height={360}
                className="rounded-xl"
                showLabel={false}
              />
              <AnimatePresence>
                {activeAction && (
                  <motion.div
                    key={activeAction}
                    initial={{ opacity: 0, y: 0, scale: 0.96 }}
                    animate={{ opacity: 1, y: -18, scale: 1 }}
                    exit={{ opacity: 0, y: -28, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute left-1/2 top-20 z-20 -translate-x-1/2 rounded-md border border-slate-300 bg-white/94 px-4 py-2 text-sm font-medium text-ink shadow-soft"
                  >
                    {ACTION_COPY[activeAction].detail}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-xl bg-gradient-to-t from-white/28 to-transparent" />
            </div>
          </Card>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoTile
              label="Companion mood"
              value={moodLabel}
              detail={`${pet.name} is staying close and moving at your pace today.`}
            />
            <InfoTile
              label="Quiet care"
              value={garden.length === 0 ? 'Just the two of you' : `${garden.length} plants nearby`}
              detail="The deer scene matches your home clearing now, without stacked overlays."
            />
            <InfoTile
              label="Bond snapshot"
              value={`Lv. ${pet.level}`}
              detail={`${Math.max(0, nextLevelAt - pet.xp)} xp until the next level.`}
            />
          </div>

          <div className="mt-3 grid grid-cols-3 gap-2">
            <HabitatStat label="Bond" value={`${pet.bond}%`} accent="text-[#b7792f]" />
            <HabitatStat label="Happiness" value={`${pet.happiness}%`} accent="text-[#6d8f67]" />
            <HabitatStat label="Level" value={`Lv. ${pet.level}`} accent="text-ink" />
          </div>
        </motion.div>

        <div className="col-span-12 space-y-4 md:col-span-5">
          <Card>
            <CardHeader>
              <CardTitle>How {pet.name} is doing</CardTitle>
              <CardSub className="mt-1">
                {pet.last_interaction
                  ? `Last together — ${formatDate(pet.last_interaction)}`
                  : "You haven't spent time together yet."}
              </CardSub>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">Bond level</div>
                    <div className="mt-1 font-display text-3xl text-ink">Lv. {pet.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs uppercase tracking-[0.14em] text-ink-muted">Next rise</div>
                    <div className="mt-1 text-sm font-medium text-ink">
                      {pet.xp} / {nextLevelAt}
                    </div>
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-ink/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(12, levelProgress || (pet.level > 1 ? 100 : 0))}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-sage-300 to-sage-500"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-ink-muted">
                  <span>Steady attention makes the biggest difference.</span>
                  <span>{Math.max(0, nextLevelAt - pet.xp)} xp to go</span>
                </div>
              </div>
              <Stat label="Happiness" value={pet.happiness} tone="amber" />
              <Stat label="Bond" value={pet.bond} tone="green" />
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Small things to do</CardTitle>
              <CardSub className="mt-1">
                Each interaction gives a little progress. Then your deer needs twenty quiet minutes before the next one.
              </CardSub>
            </CardHeader>
            <CardBody className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(Object.keys(ACTION_COPY) as PetAction[]).map((action) => (
                <ActionButton
                  key={action}
                  onClick={() => triggerAction(action)}
                  icon={ACTION_COPY[action].icon}
                  disabled={coolingDown || (action === 'walk' && pet.happiness <= 0)}
                  active={activeAction === action}
                  detail={ACTION_COPY[action].detail}
                >
                  {ACTION_COPY[action].label}
                </ActionButton>
              ))}
            </CardBody>
            {coolingDown && (
              <div className="px-6 pb-5 text-xs text-ink-muted">
                {pet.name} is resting. You can interact again in {cooldownMinutes}m {cooldownSeconds}s.
              </div>
            )}
            {!coolingDown && pet.happiness <= 0 && (
              <div className="px-6 pb-5 text-xs text-ink-muted">
                {pet.name} is too drained to go anywhere right now. Rest or feed them first.
              </div>
            )}
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>A name for your companion</CardTitle>
              <CardSub className="mt-1">You can rename them any time.</CardSub>
            </CardHeader>
            <CardBody>
              {editing ? (
                <form
                  className="flex items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    renamePet(name)
                    setEditing(false)
                  }}
                >
                  <Input
                    autoFocus
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={24}
                  />
                  <Button type="submit" size="sm">
                    Save
                  </Button>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="font-display text-xl text-ink">{pet.name}</div>
                  <Button variant="soft" size="sm" onClick={() => setEditing(true)}>
                    <PencilLine size={14} /> Rename
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function HabitatStat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: string
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper-50 px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-[0.18em] text-ink/45">{label}</div>
      <div className={`mt-1 font-display text-xl tracking-tight ${accent}`}>{value}</div>
    </div>
  )
}

function InfoTile({
  label,
  value,
  detail,
}: {
  label: string
  value: string
  detail: string
}) {
  return (
    <div className="rounded-xl border border-slate-300 bg-white/88 px-4 py-3 shadow-soft">
      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-xl tracking-tight text-ink">{value}</div>
      <div className="mt-1.5 text-sm text-ink-muted">{detail}</div>
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone: 'amber' | 'green' }) {
  const color = tone === 'amber' ? '#fcd58e' : '#7fae87'
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="tabular-nums font-medium text-ink">{value}</span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-ink/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, ${color}55, ${color})`,
            boxShadow: `0 0 16px ${color}55`,
          }}
        />
      </div>
    </div>
  )
}

function ActionButton({
  children,
  onClick,
  icon,
  disabled,
  active,
  detail,
}: {
  children: React.ReactNode
  onClick: () => void
  icon: React.ReactNode
  disabled: boolean
  active: boolean
  detail: string
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={disabled ? {} : { scale: 0.96 }}
      whileHover={disabled ? {} : { y: -1 }}
      animate={active ? { scale: [1, 1.03, 1], y: [0, -2, 0] } : undefined}
      transition={{ duration: 0.32, ease: 'easeOut' }}
      disabled={disabled}
      className={`flex min-h-[92px] flex-col items-start justify-center gap-1.5 rounded-lg border px-3.5 py-3.5 text-left text-sm font-medium transition ${
        disabled
          ? 'cursor-not-allowed border-ink/8 bg-paper-100 text-ink-muted opacity-75'
          : active
            ? 'border-sage-300 bg-[linear-gradient(180deg,#eff7ed,#e4f0df)] text-ink shadow-soft'
            : 'border-ink/12 bg-[linear-gradient(180deg,#fffaf4,#f7f0e6)] text-ink hover:bg-paper-100'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className={active ? 'text-sage-600' : 'text-sage-500'}>{icon}</span>
        <span>{children}</span>
      </span>
      <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
        <Sparkles size={12} />
        {detail}
      </span>
    </motion.button>
  )
}
