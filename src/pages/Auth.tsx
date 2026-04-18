import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Leaf, Mail, ShieldCheck, Sparkles, Trees, Wind } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseEnabled } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Deer } from '../components/Deer'

type Mode = 'sign-in' | 'sign-up'

function getMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

export function Auth() {
  const { signIn, signUp, signInWithGoogle, authMode, profile, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = useMemo(() => {
    const next = location.state as { from?: { pathname?: string } } | null
    return next?.from?.pathname ?? '/app'
  }, [location.state])

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [verificationEmail, setVerificationEmail] = useState<string | null>(null)

  const usingSupabase = authMode === 'supabase'

  useEffect(() => {
    if (loading || !profile) return
    navigate(profile.onboarded ? redirectTo : '/onboarding', { replace: true })
  }, [loading, navigate, profile, redirectTo])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError('Please enter your email.')
      return
    }

    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    if (mode === 'sign-up' && password !== confirmPassword) {
      setError('Your passwords do not match yet.')
      return
    }

    setSubmitting(true)

    try {
      if (mode === 'sign-up') {
        await signUp(email.trim(), password, displayName.trim() || undefined)

        if (usingSupabase) {
          setVerificationEmail(email.trim())
          setMode('sign-in')
          setPassword('')
          setConfirmPassword('')
          setMessage(null)
        } else {
          navigate('/onboarding', { replace: true })
        }
      } else {
        await signIn(email.trim(), password)
        navigate(redirectTo, { replace: true })
      }
    } catch (err) {
      setError(getMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function onGoogleSignIn() {
    setError(null)
    setMessage(null)
    setSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (err) {
      setError(getMessage(err))
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f2e8] text-ink">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(90%_90%_at_0%_0%,rgba(249,224,181,0.55),transparent_52%),radial-gradient(70%_80%_at_100%_0%,rgba(127,174,135,0.22),transparent_42%),linear-gradient(180deg,#f8f4ea_0%,#f2ede3_48%,#e6efe6_100%)]" />
        <div className="absolute left-[-6%] top-[-8%] h-64 w-64 rounded-full bg-amber-200/35 blur-3xl" />
        <div className="absolute bottom-[-12%] right-[-4%] h-80 w-80 rounded-full bg-sage-200/45 blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-white/80" />
      </div>

      <div className="relative grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.85fr)]">
      <div className="relative flex items-center justify-center px-5 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-xl"
        >
          <Link to="/" className="mb-6 inline-flex items-center gap-3 text-ink-soft transition hover:text-ink">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white/75 shadow-[0_12px_30px_-20px_rgba(22,49,38,0.35)] backdrop-blur">
              <Leaf size={16} className="text-forest-950" />
            </div>
            <div>
              <div className="font-display text-lg tracking-tight">Endeerment</div>
              <div className="text-xs uppercase tracking-[0.2em] text-ink-faint">Quiet care, kept close</div>
            </div>
          </Link>

          <div className="overflow-hidden rounded-[2rem] border border-[#efe5d3] bg-[linear-gradient(180deg,rgba(255,252,246,0.94),rgba(255,255,255,0.9))] shadow-[0_24px_80px_-40px_rgba(22,49,38,0.35)] backdrop-blur-xl">
            <div className="border-b border-[#eee4d5] px-5 pb-5 pt-5 sm:px-7 sm:pb-6 sm:pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/70 bg-amber-50/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5d20]">
                  <Sparkles size={12} />
                  Gentle login
                </div>
                <div className="hidden items-center gap-2 rounded-full border border-sage-200/70 bg-sage-50/70 px-3 py-1 text-xs text-sage-700 sm:inline-flex">
                  <ShieldCheck size={14} />
                  Calm, private, synced
                </div>
              </div>
              <h1 className="mt-5 max-w-lg font-display text-[2.35rem] leading-[0.98] tracking-tight text-[#13241b] sm:text-5xl">
                {mode === 'sign-in' ? 'Come back to your clearing.' : 'Start a softer kind of routine.'}
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#536256] sm:text-[15px]">
                {usingSupabase
                  ? mode === 'sign-in'
                    ? 'Pick up where you left off with your journal, garden, and deer companion.'
                    : 'Create an account to keep your quiet rituals, reflections, and little forest in sync.'
                  : 'Sign in locally to keep using your forest on this device.'}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-[#eee3d4] bg-[#f5efe4]/70 p-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-in')
                    setError(null)
                    setMessage(null)
                  }}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold tracking-tight transition ${
                    mode === 'sign-in'
                      ? 'bg-white text-forest-950 shadow-[0_10px_24px_-18px_rgba(22,49,38,0.4)]'
                      : 'text-ink-muted hover:bg-white/60'
                  }`}
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('sign-up')
                    setError(null)
                    setMessage(null)
                  }}
                  className={`rounded-2xl px-4 py-3 text-sm font-semibold tracking-tight transition ${
                    mode === 'sign-up'
                      ? 'bg-white text-forest-950 shadow-[0_10px_24px_-18px_rgba(22,49,38,0.4)]'
                      : 'text-ink-muted hover:bg-white/60'
                  }`}
                >
                  Create account
                </button>
              </div>
              <div className="mt-5 flex items-center gap-4 rounded-2xl border border-white/80 bg-white/55 px-4 py-3 text-sm text-[#455348] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#18362a,#0f241b)] text-paper-100 shadow-soft">
                  <Deer size={34} mood="curious" />
                </div>
                <p className="leading-5">Your deer keeps the welcome warmer on every screen size.</p>
              </div>
            </div>

            {!supabaseEnabled && (
              <div className="mx-5 mt-5 rounded-2xl border border-amber-200/60 bg-[linear-gradient(180deg,#fff8ea,#fff4dc)] p-4 text-sm text-amber-900 sm:mx-7">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <div>
                    Full account sync is not available right now, so this device will keep your progress locally.
                  </div>
                </div>
              </div>
            )}

            <div className="px-5 pb-5 pt-5 sm:px-7 sm:pb-7">
              <form onSubmit={onSubmit} className="space-y-4">
                {usingSupabase && (
                  <>
                    <Button
                      type="button"
                      size="lg"
                      variant="outline"
                      className="h-14 w-full justify-center rounded-2xl border-[#e7dccb] bg-white/80 text-[15px] shadow-[0_12px_32px_-24px_rgba(22,49,38,0.35)] hover:bg-white"
                      disabled={submitting}
                      onClick={onGoogleSignIn}
                    >
                      <span className="text-base font-semibold text-[#4285F4]">G</span>
                      Continue with Google
                    </Button>
                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-[#ddd2c3]" />
                      <span className="text-[11px] uppercase tracking-[0.2em] text-ink-faint">or use email</span>
                      <div className="h-px flex-1 bg-[#ddd2c3]" />
                    </div>
                  </>
                )}

                {mode === 'sign-up' && (
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                      Display name <span className="normal-case text-ink-faint">(optional)</span>
                    </label>
                    <Input
                      id="name"
                      placeholder="First name, nickname, anything"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="h-12 rounded-2xl border-[#e8decf] bg-white/85"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    Email
                  </label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@somewhere.quiet"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-2xl border-[#e8decf] bg-white/85"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                    Password
                  </label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                    placeholder={mode === 'sign-in' ? 'Your password' : 'At least 6 characters'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    minLength={6}
                    required
                    className="h-12 rounded-2xl border-[#e8decf] bg-white/85"
                  />
                </div>

                {mode === 'sign-up' && (
                  <div className="space-y-2">
                    <label htmlFor="confirm-password" className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
                      Confirm password
                    </label>
                    <Input
                      id="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                      className="h-12 rounded-2xl border-[#e8decf] bg-white/85"
                    />
                  </div>
                )}

                {error && (
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                    {message}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  className="mt-2 h-14 w-full rounded-2xl bg-[#153126] text-paper-100 shadow-[0_16px_40px_-24px_rgba(21,49,38,0.85)] hover:bg-[#1d4032]"
                  disabled={submitting}
                >
                  {submitting
                    ? mode === 'sign-in'
                      ? 'Signing you in...'
                      : 'Creating your account...'
                    : mode === 'sign-in'
                      ? 'Sign in'
                      : 'Create account'}
                  <ArrowRight size={16} />
                </Button>
              </form>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#ece1d2] bg-white/72 p-4 text-sm text-[#516055]">
                  <div className="flex items-center gap-2 font-semibold text-[#1a2e22]">
                    <ShieldCheck size={16} className="text-sage-500" />
                    Synced progress
                  </div>
                  <p className="mt-2 leading-5">
                    {usingSupabase
                      ? 'Your forest, deer, and streak stay connected across sign-ins.'
                      : 'This device is keeping your progress for now.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#ece1d2] bg-white/72 p-4 text-sm text-[#516055]">
                  <div className="flex items-center gap-2 font-semibold text-[#1a2e22]">
                    <Wind size={16} className="text-amber-500" />
                    No pressure
                  </div>
                  <p className="mt-2 leading-5">
                    Slip in for thirty seconds or stay for a longer check-in. The page meets you where you are.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {verificationEmail && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-[#020806]/82 px-6 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.28 }}
            className="w-full max-w-md rounded-xl border border-slate-300 bg-white p-6 text-[#163126] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-[#163126] text-[#f7f1e6]">
              <Mail size={20} />
            </div>
            <h2 className="mt-5 font-display text-3xl tracking-tight text-[#10271d]">
              Check your email
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#29463a]">
              We created your account and sent a verification link to <span className="font-semibold text-[#10271d]">{verificationEmail}</span>.
              Open that email, confirm your address, then come back here and sign in.
            </p>
            <div className="mt-4 rounded-lg border border-[#163126]/12 bg-slate-50 p-4 text-sm text-[#355246] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              If you do not see it, check spam or promotions first. Delivery can take a minute sometimes.
            </div>
            <div className="mt-6 flex gap-3">
              <Button
                className="flex-1 bg-[#163126] text-[#f7f1e6] hover:bg-[#214235] active:bg-[#0f241b]"
                onClick={() => setVerificationEmail(null)}
              >
                I’ll check my email
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="relative hidden overflow-hidden lg:flex lg:items-stretch lg:justify-center">
        <div className="absolute inset-6 rounded-[2rem] border border-white/20 bg-[linear-gradient(180deg,#18372c_0%,#10271d_45%,#0a1812_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]" />
        <div className="absolute inset-x-12 top-12 h-40 rounded-full bg-amber-200/12 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-48 w-48 rounded-full bg-sage-300/12 blur-3xl" />
        <div className="absolute inset-x-6 bottom-6 h-40 rounded-b-[2rem] bg-[linear-gradient(180deg,rgba(109,154,112,0)_0%,rgba(109,154,112,0.14)_100%)]" />
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative flex w-full max-w-2xl flex-col justify-between px-12 py-14"
        >
          <div className="max-w-sm">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#dfe8e2]">
              <Trees size={12} />
              A slower corner of the internet
            </div>
            <h2 className="mt-5 font-display text-5xl leading-[0.98] tracking-tight text-[#f7f3eb]">
              Log in like you’re stepping into a warm cabin.
            </h2>
            <p className="mt-4 max-w-md text-[15px] leading-7 text-[#bfd0c5]">
              No dashboards yelling for attention. Just your notes, your small rituals, and a deer that never acts like you are late.
            </p>
          </div>

          <div className="relative mx-auto flex flex-1 items-center justify-center">
            <div className="absolute h-72 w-72 rounded-full bg-[radial-gradient(circle_at_50%_40%,rgba(255,240,204,0.8),rgba(255,240,204,0.12)_42%,rgba(255,240,204,0)_70%)] blur-md" />
            <div className="absolute bottom-[18%] h-28 w-80 rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(154,194,138,0.34),rgba(154,194,138,0)_72%)] blur-xl" />
            <Deer size={290} mood="curious" />
          </div>

          <div className="grid gap-3 text-sm text-[#d9e4dd] xl:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="font-semibold text-[#f7f3eb]">Check in fast</div>
              <p className="mt-2 leading-6 text-[#bdd0c4]">A minute is enough to leave a trace of how today feels.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="font-semibold text-[#f7f3eb]">Grow something tiny</div>
              <p className="mt-2 leading-6 text-[#bdd0c4]">Your forest gets fuller with every honest return.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <div className="font-semibold text-[#f7f3eb]">Keep it gentle</div>
              <p className="mt-2 leading-6 text-[#bdd0c4]">Nothing here is trying to turn your inner life into a productivity contest.</p>
            </div>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  )
}
