import { useState } from 'react'
import { LogOut, Save } from 'lucide-react'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useAuth } from '../contexts/AuthContext'
import { formatDate } from '../lib/utils'

export function Account() {
  const { profile, updateProfile, signOut } = useAuth()
  const [name, setName] = useState(profile?.display_name ?? '')
  const [saved, setSaved] = useState(false)
  if (!profile) return null

  function save(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    updateProfile({ display_name: name.trim() })
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">You</div>
        <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Your account
        </h1>
        <p className="mt-1.5 max-w-xl text-ink-muted">
          Small details. Change any of this, any time.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardSub className="mt-1">How Endeerment greets you.</CardSub>
          </CardHeader>
          <CardBody>
            <form onSubmit={save} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                  Display name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                  Email
                </label>
                <Input value={profile.email} disabled readOnly />
              </div>
              <div className="flex items-center gap-2">
                <Button type="submit">
                  <Save size={14} /> {saved ? 'Saved' : 'Save changes'}
                </Button>
                {saved && (
                  <span className="text-xs text-forest-200">Looks good.</span>
                )}
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your forest so far</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            <Row label="Joined" value={formatDate(profile.created_at)} />
            <Row
              label="Last check-in"
              value={profile.last_check_in ? formatDate(profile.last_check_in) : 'not yet'}
            />
            <Row label="Streak" value={`${profile.streak} days`} />
            <Row label="Forest level" value={`lvl ${profile.forest_level}`} />
            <Row label="Points" value={`${profile.points} acorns`} />
            <Row label="Items owned" value={`${profile.inventory.length}`} />
          </CardBody>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Sign out</CardTitle>
            <CardSub className="mt-1">
              You can sign out any time. Your saved progress will stay attached to your account.
            </CardSub>
          </CardHeader>
          <CardBody>
            <Button variant="outline" onClick={signOut}>
              <LogOut size={14} /> Sign out
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/5 pb-2 last:border-b-0 last:pb-0">
      <span className="text-sm text-ink-muted">{label}</span>
      <span className="text-sm text-ink">{value}</span>
    </div>
  )
}
