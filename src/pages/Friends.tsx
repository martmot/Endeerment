import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Clock3, MailPlus, Trees, UserCheck, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card, CardBody, CardHeader, CardSub, CardTitle } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
import { useSocial } from '../contexts/SocialContext'
import { formatDate } from '../lib/utils'

export function Friends() {
  const {
    socialEnabled,
    loading,
    error,
    friends,
    incomingRequests,
    outgoingRequests,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    cancelFriendRequest,
  } = useSocial()
  const [email, setEmail] = useState('')
  const [statusMessage, setStatusMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    const result = await sendFriendRequest(email)
    setStatusMessage(result.message)
    if (result.ok) setEmail('')
    setSubmitting(false)
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-[0.16em] text-ink-muted">Social garden</div>
          <h1 className="mt-1 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Friends
          </h1>
          <p className="mt-1.5 max-w-2xl text-ink-muted">
            Add people by email, send requests, and keep your garden connected in a gentle, low-pressure way.
          </p>
        </div>
        <Link to="../neighbourhood">
          <Button variant="soft">
            <Trees size={16} /> Open neighbourhood
          </Button>
        </Link>
      </header>

      <div className="grid gap-3 md:grid-cols-3">
        <StatTile
          icon={<Users size={16} />}
          label="Friends"
          value={`${friends.length}`}
          detail="People whose gardens you can visit."
        />
        <StatTile
          icon={<UserCheck size={16} />}
          label="Incoming requests"
          value={`${incomingRequests.length}`}
          detail="Requests waiting on you."
        />
        <StatTile
          icon={<Clock3 size={16} />}
          label="Pending invites"
          value={`${outgoingRequests.length}`}
          detail="Requests you already sent."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a friend by email</CardTitle>
          <CardSub className="mt-1">
            The other person will receive a request and can accept it from their own account.
          </CardSub>
        </CardHeader>
        <CardBody>
          {socialEnabled ? (
            <>
              <form className="flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
                <Input
                  type="email"
                  placeholder="friend@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
                <Button type="submit" disabled={submitting || !email.trim()}>
                  <MailPlus size={16} />
                  {submitting ? 'Sending…' : 'Send request'}
                </Button>
              </form>
              {(statusMessage || error) && (
                <div className="mt-4 rounded-2xl border border-slate-300 bg-paper-50 px-4 py-3 text-sm text-ink-muted">
                  {statusMessage ?? error}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              {error ?? 'Friends are not available right now.'}
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your friends</CardTitle>
            <CardSub className="mt-1">
              Visit a friend&apos;s garden from the neighbourhood tab any time.
            </CardSub>
          </CardHeader>
          <CardBody className="space-y-3">
            {loading ? (
              <EmptyMessage>Loading your social garden…</EmptyMessage>
            ) : friends.length === 0 ? (
              <EmptyMessage>No friends yet. Send your first request above.</EmptyMessage>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.user_id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white/85 px-4 py-3"
                >
                  <div>
                    <div className="text-sm font-semibold text-ink">{friend.display_name}</div>
                    <div className="mt-1 text-xs text-ink-muted">{friend.email}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink-muted">
                      <span className="rounded-full border border-slate-300 bg-paper-50 px-2.5 py-1">
                        Level {friend.forest_level}
                      </span>
                      <span className="rounded-full border border-slate-300 bg-paper-50 px-2.5 py-1">
                        {friend.garden.length} plants
                      </span>
                      <span className="rounded-full border border-slate-300 bg-paper-50 px-2.5 py-1">
                        {friend.points} acorns
                      </span>
                    </div>
                  </div>
                  <Link to={`../neighbourhood?friend=${friend.user_id}`}>
                    <Button variant="soft" size="sm">
                      Visit garden
                    </Button>
                  </Link>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Incoming requests</CardTitle>
              <CardSub className="mt-1">Accept or decline people who want to connect.</CardSub>
            </CardHeader>
            <CardBody className="space-y-3">
              {incomingRequests.length === 0 ? (
                <EmptyMessage>No incoming requests right now.</EmptyMessage>
              ) : (
                incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-2xl border border-slate-300 bg-white/85 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">
                          {request.other_profile.display_name}
                        </div>
                        <div className="mt-1 text-xs text-ink-muted">
                          {request.other_profile.email}
                        </div>
                        <div className="mt-2 text-xs text-ink-muted">
                          Sent {formatDate(request.created_at)}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void acceptFriendRequest(request.id)}>
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void declineFriendRequest(request.id)}
                        >
                          Decline
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sent requests</CardTitle>
              <CardSub className="mt-1">These are still waiting for the other person.</CardSub>
            </CardHeader>
            <CardBody className="space-y-3">
              {outgoingRequests.length === 0 ? (
                <EmptyMessage>No pending invites.</EmptyMessage>
              ) : (
                outgoingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-300 bg-white/85 px-4 py-3"
                  >
                    <div>
                      <div className="text-sm font-semibold text-ink">
                        {request.other_profile.display_name}
                      </div>
                      <div className="mt-1 text-xs text-ink-muted">
                        {request.other_profile.email}
                      </div>
                      <div className="mt-2 text-xs text-ink-muted">
                        Requested {formatDate(request.created_at)}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => void cancelFriendRequest(request.id)}
                    >
                      Cancel
                    </Button>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  )
}

function StatTile({
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
        <div className="flex items-center gap-2 text-sage-700">{icon}</div>
        <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-ink-muted">{label}</div>
        <div className="mt-1 font-display text-3xl tracking-tight text-ink">{value}</div>
        <div className="mt-1.5 text-sm text-ink-muted">{detail}</div>
      </CardBody>
    </Card>
  )
}

function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-paper-50 px-4 py-6 text-sm text-ink-muted">
      {children}
    </div>
  )
}
