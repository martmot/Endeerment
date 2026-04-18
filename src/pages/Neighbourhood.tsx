import { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Eye, Sprout, Trees, Trophy } from 'lucide-react'
import { Forest } from '../components/Forest'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useSocial } from '../contexts/SocialContext'
import { formatDate } from '../lib/utils'

export function Neighbourhood() {
  const { socialEnabled, loading, friends, error } = useSocial()
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedFriendId = searchParams.get('friend')

  const selectedFriend = useMemo(
    () => friends.find((friend) => friend.user_id === selectedFriendId) ?? friends[0] ?? null,
    [friends, selectedFriendId]
  )

  useEffect(() => {
    if (!selectedFriend) return
    if (selectedFriend.user_id === selectedFriendId) return
    setSearchParams({ friend: selectedFriend.user_id }, { replace: true })
  }, [selectedFriend, selectedFriendId, setSearchParams])

  const totalPlants = friends.reduce((sum, friend) => sum + friend.garden.length, 0)
  const averageStreak = friends.length
    ? Math.round(friends.reduce((sum, friend) => sum + friend.streak, 0) / friends.length)
    : 0
  const highestLevel = friends.length
    ? Math.max(...friends.map((friend) => friend.forest_level))
    : 0

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">Shared clearings</div>
        <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Neighbourhood
        </h1>
        <p className="mt-1.5 max-w-2xl text-ink-muted">
          See how your friends are tending their spaces, glance at a few stats, and visit their gardens when you want a little company.
        </p>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <MiniStat
          icon={<Trees size={16} />}
          label="Connected gardens"
          value={`${friends.length}`}
          detail="Friends you can visit."
        />
        <MiniStat
          icon={<Sprout size={16} />}
          label="Plants nearby"
          value={`${totalPlants}`}
          detail="Across your social circle."
        />
        <MiniStat
          icon={<Trophy size={16} />}
          label="Average streak"
          value={`${averageStreak} days`}
          detail={friends.length === 0 ? 'No streak data yet.' : `Highest forest level is ${highestLevel}.`}
        />
      </div>

      {!socialEnabled ? (
        <Card>
          <CardBody className="pt-6 text-sm text-amber-900">
            {error ?? 'Neighbourhood is not available right now.'}
          </CardBody>
        </Card>
      ) : loading ? (
        <Card>
          <CardBody className="pt-6 text-sm text-ink-muted">Loading neighbourhood…</CardBody>
        </Card>
      ) : friends.length === 0 ? (
        <Card>
          <CardBody className="pt-6 text-sm text-ink-muted">
            Your neighbourhood is empty right now. Add a friend by email first and their garden will show up here.
          </CardBody>
        </Card>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Nearby friends</CardTitle>
              <CardSub className="mt-1">Choose someone to visit.</CardSub>
            </CardHeader>
            <CardBody className="space-y-3">
              {friends.map((friend) => {
                const active = friend.user_id === selectedFriend?.user_id
                return (
                  <button
                    key={friend.user_id}
                    type="button"
                    onClick={() => setSearchParams({ friend: friend.user_id })}
                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                      active
                        ? 'border-sage-400 bg-[linear-gradient(180deg,#f4fbf2,#eaf4e8)] shadow-soft'
                        : 'border-slate-300 bg-white/85 hover:border-sage-300 hover:bg-paper-50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{friend.display_name}</div>
                        <div className="mt-1 text-xs text-ink-muted">{friend.email}</div>
                      </div>
                      {active && (
                        <span className="rounded-full bg-sage-100 px-2.5 py-1 text-[11px] font-medium text-sage-800">
                          Viewing
                        </span>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-ink-muted">
                      <span className="rounded-xl border border-slate-300 bg-white/70 px-2.5 py-2">
                        Lvl {friend.forest_level}
                      </span>
                      <span className="rounded-xl border border-slate-300 bg-white/70 px-2.5 py-2">
                        {friend.streak} day streak
                      </span>
                      <span className="rounded-xl border border-slate-300 bg-white/70 px-2.5 py-2">
                        {friend.garden.length} plants
                      </span>
                    </div>
                  </button>
                )
              })}
            </CardBody>
          </Card>

          {selectedFriend && (
            <Card className="overflow-hidden p-0">
              <div className="relative">
                <Forest
                  level={selectedFriend.forest_level}
                  inventory={[]}
                  garden={selectedFriend.garden}
                  petHappiness={72}
                  petMood="curious"
                  petName={`${selectedFriend.display_name}'s deer`}
                  height={340}
                  className="rounded-xl"
                />
                <div className="absolute inset-x-0 bottom-0 h-16 rounded-b-xl bg-gradient-to-t from-white/28 to-transparent" />
                <div className="absolute left-4 top-4 rounded-2xl border border-slate-300 bg-white/92 px-4 py-3 shadow-soft">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                    Visiting garden
                  </div>
                  <div className="mt-1 font-display text-2xl tracking-tight text-ink">
                    {selectedFriend.display_name}
                  </div>
                  <div className="mt-1 text-sm text-ink-muted">{selectedFriend.email}</div>
                </div>
              </div>

              <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <GardenStat label="Forest level" value={`${selectedFriend.forest_level}`} />
                    <GardenStat label="Points" value={`${selectedFriend.points}`} />
                    <GardenStat label="Streak" value={`${selectedFriend.streak} days`} />
                  </div>

                  <div className="rounded-2xl border border-slate-300 bg-paper-50 px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Eye size={16} />
                      Garden snapshot
                    </div>
                    <div className="mt-2 text-sm text-ink-muted">
                      {selectedFriend.garden.length === 0
                        ? 'This clearing is still getting started.'
                        : `${selectedFriend.display_name} has ${selectedFriend.garden.length} planted spot${selectedFriend.garden.length === 1 ? '' : 's'} growing here.`}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <CardTitle className="text-base">Recent details</CardTitle>
                  <div className="rounded-2xl border border-slate-300 bg-white/88 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                      Last check-in
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">
                      {selectedFriend.last_check_in
                        ? formatDate(selectedFriend.last_check_in)
                        : 'No check-in shared yet'}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-300 bg-white/88 px-4 py-3">
                    <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                      Garden size
                    </div>
                    <div className="mt-1 text-sm font-medium text-ink">
                      {selectedFriend.garden.filter((plant) => plant.stage >= 3).length} fully grown
                      {' '}
                      out of
                      {' '}
                      {selectedFriend.garden.length}
                    </div>
                  </div>
                  <Button
                    variant="soft"
                    className="w-full justify-center"
                    onClick={() => setSearchParams({ friend: selectedFriend.user_id })}
                  >
                    Keep exploring this garden
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode
  label: string
  value: string
  detail: string
}) {
  return (
    <Card>
      <CardBody className="pt-6">
        <div className="text-sage-700">{icon}</div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
        <div className="mt-1 font-display text-3xl tracking-tight text-ink">{value}</div>
        <div className="mt-1.5 text-sm text-ink-muted">{detail}</div>
      </CardBody>
    </Card>
  )
}

function GardenStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-300 bg-white/88 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
      <div className="mt-1 font-display text-2xl tracking-tight text-ink">{value}</div>
    </div>
  )
}
