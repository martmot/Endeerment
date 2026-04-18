import { motion } from 'framer-motion'
import { Check, Star } from 'lucide-react'
import { AppMark } from '../components/AppMark'
import { Card, CardBody, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { MAX_GARDEN_PLANTS } from '../lib/garden'
import { SHOP } from '../lib/mock-data'
import { useAuth } from '../contexts/AuthContext'
import { uid } from '../lib/utils'

export function Shop() {
  const { profile, updateProfile } = useAuth()
  if (!profile) return null
  const currentProfile = profile

  const owned = new Set(currentProfile.inventory)

  function buy(id: string, cost: number, kind: 'seed' | 'tree' | 'decoration') {
    const isUnique = kind === 'decoration'
    const gardenFull = currentProfile.garden.length >= MAX_GARDEN_PLANTS
    if ((isUnique && owned.has(id)) || currentProfile.points < cost || (!isUnique && gardenFull)) return

    const nextInventory = isUnique ? [...currentProfile.inventory, id] : currentProfile.inventory
    const nextGarden =
      kind === 'decoration'
        ? currentProfile.garden
        : [
            ...currentProfile.garden,
            {
              id: uid(),
              shop_item_id: id,
              stage: (kind === 'tree' ? 2 : 0) as 0 | 1 | 2 | 3,
              planted_at: new Date().toISOString(),
              last_grew_at: null,
            },
          ]

    updateProfile({
      points: currentProfile.points - cost,
      inventory: nextInventory,
      garden: nextGarden,
    })
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Tend to your clearing
          </div>
          <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Shop
          </h1>
          <p className="mt-1.5 max-w-xl text-ink-muted">
            Buy seeds and trees for your garden, then grow them from home.
          </p>
        </div>
        <div className="rounded-2xl border border-ink/10 bg-white/80 px-4 py-3 text-sm">
          <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">
            Your acorns
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 font-display text-2xl">
            <Star size={16} className="text-amber-glow" />
            {currentProfile.points}
          </div>
        </div>
      </header>

      <div className="rounded-2xl border border-ink/10 bg-white/75 px-4 py-3 text-sm text-ink-muted">
        Garden capacity: {currentProfile.garden.length}/{MAX_GARDEN_PLANTS} plants
      </div>

      {(['seed', 'tree', 'decoration'] as const).map((kind) => (
        <section key={kind} className="space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-xl tracking-tight capitalize text-ink">
              {kind === 'seed' ? 'Seeds' : kind === 'tree' ? 'Trees' : 'Decorations'}
            </h2>
            <span className="text-xs text-ink-muted">
              {SHOP.filter((i) => i.kind === kind).length} items
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SHOP.filter((i) => i.kind === kind).map((item, i) => {
              const have = item.kind === 'decoration' && owned.has(item.id)
              const plantedCount = currentProfile.garden.filter((plant) => plant.shop_item_id === item.id).length
              const affordable = currentProfile.points >= item.cost
              const gardenFull = item.kind !== 'decoration' && currentProfile.garden.length >= MAX_GARDEN_PLANTS
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Card className="h-full">
                    <CardBody>
                      <div className="flex items-start gap-3">
                        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl border border-sage-200 bg-white/85 p-2 shadow-soft">
                          <AppMark className="h-full w-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-lg">{item.name}</CardTitle>
                            {have && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-forest-300/20 px-2 py-0.5 text-[10.5px] text-forest-200">
                                <Check size={10} /> owned
                              </span>
                            )}
                          </div>
                          <CardSub className="mt-1 line-clamp-2">{item.description}</CardSub>
                          {item.kind !== 'decoration' && plantedCount > 0 && (
                            <div className="mt-2 text-xs font-medium text-sage-600">
                              {plantedCount} planted in your garden
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Star size={14} className="text-amber-glow" />
                          <span className="font-medium">{item.cost}</span>
                          <span className="text-ink-muted">acorns</span>
                        </div>
                        <Button
                          size="sm"
                          variant={have ? 'soft' : 'primary'}
                          disabled={have || !affordable || gardenFull}
                          onClick={() => buy(item.id, item.cost, item.kind)}
                        >
                          {have
                            ? 'In your garden'
                            : gardenFull
                              ? 'Garden full'
                            : !affordable
                              ? 'Not enough'
                              : item.kind === 'seed'
                                ? 'Buy seed'
                                : item.kind === 'tree'
                                  ? 'Buy tree'
                                  : 'Add decor'}
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
