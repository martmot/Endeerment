import { motion } from 'framer-motion'
import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle2, Circle, Flame, Gift, Leaf, Sparkles, Star, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useUserData } from '../contexts/UserDataContext'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Forest } from '../components/Forest'
import { ReflectionCard } from '../components/ReflectionCard'
import { MAX_GARDEN_PLANTS } from '../lib/garden'
import { daysBetween, formatDate, greetingFor } from '../lib/utils'
import { SHOP, moodMeta } from '../lib/mock-data'

const WATERING_MOVE_FIRST_MS = 1100
const WATERING_MOVE_BETWEEN_MS = 900
const WATERING_PAUSE_MS = 500
const WATERING_RETURN_MS = 950

export function Dashboard() {
  const { profile, updateProfile } = useAuth()
  const {
    checkIns,
    pet,
    todos,
    toggleTodo,
    addTodo,
    helpGardenWithPet,
    deleteTodo,
    deleteCheckIn,
    canClaimDailyGift,
    dailyGiftAmount,
    claimDailyGift,
  } = useUserData()
  if (!profile) return null
  const currentProfile = profile

  const latest = checkIns[0]
  const wroteToday = daysBetween(currentProfile.last_check_in, new Date().toISOString()) === 0
  const firstName = (currentProfile.display_name || currentProfile.email || 'friend').split(' ')[0]
  const garden = [...currentProfile.garden].sort((a, b) => new Date(b.planted_at).getTime() - new Date(a.planted_at).getTime())
  const [gardenMessage, setGardenMessage] = useState<string | null>(null)
  const [wateringPlantIds, setWateringPlantIds] = useState<string[]>([])
  const [wateringRunId, setWateringRunId] = useState(0)

  function deletePlant(plantId: string) {
    void updateProfile({
      garden: currentProfile.garden.filter((plant) => plant.id !== plantId),
    })
    setGardenMessage('Plant removed from your garden.')
  }

  function plantName(shopItemId: string) {
    return SHOP.find((item) => item.id === shopItemId)?.name ?? 'Garden plant'
  }

  function stageLabel(stage: number) {
    return ['Seed', 'Sprout', 'Sapling', 'Tree'][stage] ?? 'Tree'
  }

  function fetchWater() {
    const result = helpGardenWithPet()
    if (!result.success) {
      setGardenMessage(
        result.reason === 'too_tired'
          ? `${pet.name} is too worn out to fetch water right now. Help them rest and feel better first.`
          : null
      )
      return
    }
    setWateringPlantIds(result.grownPlantIds)
    setWateringRunId((prev) => prev + 1)
    const wateringDuration =
      result.grownPlantIds.length === 0
        ? WATERING_RETURN_MS
        : WATERING_MOVE_FIRST_MS +
          Math.max(0, result.grownPlantIds.length - 1) * (WATERING_MOVE_BETWEEN_MS + WATERING_PAUSE_MS) +
          WATERING_PAUSE_MS +
          WATERING_RETURN_MS
    window.setTimeout(() => setWateringPlantIds([]), wateringDuration + 250)
    if (result.plantsGrown === 0) {
      setGardenMessage(`${pet.name} watered the garden, but everything is already fully grown.`)
      return
    }
    setGardenMessage(
      `${pet.name} fetched water and helped ${result.plantsGrown} plant${result.plantsGrown === 1 ? '' : 's'} grow.`
    )
  }

  return (
    <div className="space-y-6">
      {/* greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="on-forest-kicker text-xs uppercase tracking-[0.16em]">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
          <h1 className="on-forest-text mt-1 font-display text-4xl leading-tight tracking-tight md:text-5xl">
            {greetingFor()},{' '}
            <motion.span
              initial={{ opacity: 0.88, y: 0 }}
              animate={{
                opacity: [0.9, 1, 0.92],
                y: [0, -1.5, 0],
                textShadow: [
                  '0 0 0 rgba(185,130,55,0)',
                  '0 6px 18px rgba(185,130,55,0.18)',
                  '0 0 0 rgba(185,130,55,0)',
                ],
              }}
              transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-block text-inherit"
            >
              {firstName}
            </motion.span>
            .
          </h1>
          <p className="on-forest-text-soft mt-1.5 max-w-xl">
            No pressure. Just a small window to notice how you're feeling.
          </p>
        </div>
        <Link to="check-in">
          <Button size="lg">
            New check-in <ArrowRight size={16} />
          </Button>
        </Link>
      </div>

      {/* bento */}
      <div className="bento">
        {/* Forest — big */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-12 md:col-span-8"
        >
          <Card className="overflow-hidden p-0">
            <div className="relative">
              <Forest
                level={currentProfile.forest_level}
                inventory={currentProfile.inventory}
                garden={garden}
                activeWateringPlantIds={wateringPlantIds}
                wateringRunId={wateringRunId}
                petHappiness={pet.happiness}
                petMood={pet.mood}
                petName={pet.name}
                height={320}
                className="rounded-xl"
              />
              <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-xl bg-gradient-to-t from-white/28 to-transparent" />
              <div className="absolute bottom-3 left-4 rounded-lg border border-slate-300 bg-white/92 px-3 py-2 shadow-soft backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                  Home garden
                </div>
                <div className="mt-0.5 text-sm font-medium text-ink">
                  {garden.length === 0
                    ? 'Buy a seed or tree from the shop to start your garden.'
                    : `${garden.length} planted and ready to keep growing.`}
                </div>
              </div>
            </div>
            <div className="border-t border-ink/10 bg-white/88 px-4 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">
                    Garden care
                  </div>
                  <div className="mt-1 text-sm text-ink">
                    Happier deer help more. Let {pet.name} fetch water to boost plant growth.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={fetchWater} disabled={pet.happiness <= 0}>
                    Fetch water
                  </Button>
                  <Link to="shop">
                    <Button variant="soft" size="sm">
                      Go to shop
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-md border border-slate-300 bg-paper-50 px-3 py-1 text-ink-muted">
                  Deer happiness: {pet.happiness}/100
                </span>
                <span className="rounded-md border border-slate-300 bg-paper-50 px-3 py-1 text-ink-muted">
                  Garden space: {garden.length}/{MAX_GARDEN_PLANTS}
                </span>
              </div>
              {gardenMessage && (
                <div className="mt-3 rounded-2xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800">
                  {gardenMessage}
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {garden.length === 0 ? (
                  <div className="rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3 text-sm text-ink-muted">
                    Nothing planted yet. Pick up a seed in the shop and it will appear here.
                  </div>
                ) : (
                  garden.map((plant) => (
                    <div
                      key={plant.id}
                      className="rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-ink">{plantName(plant.shop_item_id)}</div>
                          <div className="mt-1 text-xs text-ink-muted">
                            Stage: {stageLabel(plant.stage)}
                          </div>
                        </div>
                        <div className="text-xs font-medium text-sage-700">
                          {plant.stage >= 3 ? 'Fully grown' : 'Needs water'}
                        </div>
                      </div>
                      <div className="mt-3 flex justify-end">
                        <Button size="sm" variant="outline" onClick={() => deletePlant(plant.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Streak + Points stacked */}
        <div className="col-span-12 grid grid-cols-2 gap-3 md:col-span-4 md:grid-cols-1">
          <StatCard
            label="Streak"
            value={`${currentProfile.streak}`}
            suffix={currentProfile.streak === 1 ? 'day' : 'days'}
            icon={<Flame size={16} className="text-amber-glow" />}
            accent="amber"
            note={wroteToday ? 'Already counted today' : 'Write today to keep it going'}
          />
          <StatCard
            label="Points"
            value={`${currentProfile.points}`}
            suffix="acorns"
            icon={<Star size={16} className="text-forest-200" />}
            accent="green"
            note={canClaimDailyGift ? `Daily gift ready: +${dailyGiftAmount}` : 'Come back tomorrow for more'}
          />
        </div>

        {/* Check-in CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="col-span-12 md:col-span-5"
        >
          <Card className="border-forest-300/20">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  'radial-gradient(80% 100% at 0% 0%, rgba(127,174,135,0.22), transparent 70%)',
              }}
            />
            <CardHeader className="relative">
              <div className="flex items-center gap-2">
                <Leaf size={16} className="text-forest-200" />
                <CardTitle>{wroteToday ? 'Write another check-in' : "Write today's check-in"}</CardTitle>
              </div>
              <CardSub className="mt-1">
                {wroteToday
                  ? 'You already showed up today. Add another one if there is more you want to say.'
                  : "Two or three sentences is plenty. Name it, don't fix it."}
              </CardSub>
            </CardHeader>
            <CardBody className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="on-paper-muted max-w-md text-sm">
                {wroteToday
                  ? 'A second thought, a tiny update, or one honest line is enough.'
                  : 'A thought, a moment, a memory. Whatever feels like the most honest thing right now.'}
              </p>
              <Link to="check-in" className="shrink-0">
                <Button className="min-w-[11.5rem]">
                  {wroteToday ? 'Write another one' : 'Begin'} <ArrowRight size={14} />
                </Button>
              </Link>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent reflection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="col-span-12 md:col-span-3"
        >
          <Card className="border-amber-200/60">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Gift size={16} className="text-amber-500" />
                <CardTitle>Daily gift</CardTitle>
              </div>
              <CardSub className="mt-1">
                Built from your streak, deer happiness, and bond.
              </CardSub>
            </CardHeader>
            <CardBody className="space-y-3">
              <div className="rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-white px-4 py-3">
                <div className="text-[11px] uppercase tracking-[0.16em] text-amber-700">Today&apos;s gift</div>
                <div className="mt-1 flex items-end gap-2">
                  <div className="font-display text-3xl leading-none text-ink">+{dailyGiftAmount}</div>
                  <div className="pb-1 text-sm text-ink-muted">acorns</div>
                </div>
              </div>
              <div className="text-sm text-ink-muted">
                The longer your streak and the happier your deer, the better the gift feels.
              </div>
              <Button
                className="w-full"
                variant={canClaimDailyGift ? 'primary' : 'soft'}
                onClick={() => claimDailyGift()}
                disabled={!canClaimDailyGift}
              >
                {canClaimDailyGift ? 'Claim daily gift' : 'Gift already claimed'}
              </Button>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent reflection */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 md:col-span-4"
        >
          {latest ? (
            <ReflectionCard
              title={`From ${formatDate(latest.created_at)}`}
              reflection={{
                summary: latest.ai_summary,
                reflection: latest.ai_reflection,
                suggestions: latest.ai_suggestions,
              }}
              addedSuggestions={todos.map((todo) => todo.text)}
              onAddSuggestion={(suggestion) => addTodo(suggestion, latest.id)}
            />
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-glow" />
                  <CardTitle>Your first reflection is waiting</CardTitle>
                </div>
                <CardSub className="mt-1">
                  When you write your first check-in, it'll appear here.
                </CardSub>
              </CardHeader>
              <CardBody>
                <Link to="check-in">
                  <Button variant="soft">Write your first</Button>
                </Link>
              </CardBody>
            </Card>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.21 }}
          className="col-span-12"
        >
          <Card>
            <CardHeader>
              <CardTitle>Your to-dos</CardTitle>
              <CardSub className="mt-1">
                Saved suggestions and next steps, sorted by newest first.
              </CardSub>
            </CardHeader>
            <CardBody className="space-y-2.5">
              {todos.length === 0 ? (
                <div className="rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3 text-sm text-ink-muted">
                  Nothing saved yet. Add a suggestion from a reflection and it will show up here.
                </div>
              ) : (
                todos.map((todo) => {
                  const completed = Boolean(todo.completed_at)

                  return (
                    <div
                      key={todo.id}
                      className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3"
                    >
                      <span className="mt-0.5 text-sage-500">
                        {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className={`text-sm ${completed ? 'text-ink-muted line-through' : 'text-ink'}`}>
                          {todo.text}
                        </div>
                        <div className="mt-1 text-xs text-ink-muted">
                          Added {formatDate(todo.created_at)}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" variant="soft" onClick={() => toggleTodo(todo.id)}>
                          {completed ? 'Reopen' : 'Done'}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => deleteTodo(todo.id)}>
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent history list */}
        {checkIns.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="col-span-12"
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent check-ins</CardTitle>
                <CardSub className="mt-1">The last few days, gently remembered.</CardSub>
              </CardHeader>
              <CardBody className="space-y-2.5">
                {checkIns.slice(1, 6).map((c) => {
                  const mm = c.mood ? moodMeta(c.mood) : null
                  return (
                    <div
                      key={c.id}
                      className="flex items-start gap-3 rounded-2xl border border-ink/10 bg-paper-50 px-4 py-3"
                    >
                      {mm ? (
                        <div
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-full text-lg"
                          style={{ background: `${mm.hue}22`, color: mm.hue }}
                        >
                          {mm.emoji}
                        </div>
                      ) : (
                        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-sage-50 text-sage-500">
                          <Leaf size={16} />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="on-paper-muted flex items-center gap-2 text-xs">
                          <span>{formatDate(c.created_at)}</span>
                          {c.mood && (
                            <>
                              <span>·</span>
                              <span className="capitalize">{c.mood}</span>
                            </>
                          )}
                        </div>
                        <p className="on-paper-strong mt-0.5 line-clamp-1 text-sm">
                          {c.text || c.ai_summary}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => deleteCheckIn(c.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )
                })}
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  suffix,
  icon,
  accent,
  note,
}: {
  label: string
  value: string
  suffix: string
  icon: ReactNode
  accent: 'amber' | 'green'
  note: string
}) {
  return (
    <Card className="p-0">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            accent === 'amber'
              ? 'radial-gradient(90% 100% at 0% 0%, rgba(252,213,142,0.18), transparent 70%)'
              : 'radial-gradient(90% 100% at 0% 0%, rgba(127,174,135,0.2), transparent 70%)',
        }}
      />
      <CardBody className="relative px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="on-paper-muted text-[11px] uppercase tracking-[0.16em]">{label}</span>
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink/5">
            {icon}
          </span>
        </div>
        <div className="mt-2 flex items-end gap-1.5">
          <div className="on-paper-strong font-display text-2xl leading-none">{value}</div>
          <div className="on-paper-muted pb-0.5 text-xs">{suffix}</div>
        </div>
        <div className="mt-2 text-xs text-ink-muted">{note}</div>
      </CardBody>
    </Card>
  )
}
