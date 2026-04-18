import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Leaf, Mail, ShieldCheck } from 'lucide-react'
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
    <div className="relative grid min-h-screen grid-cols-1 overflow-hidden bg-forest-gradient md:grid-cols-2">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-white/90" />
      </div>

      <div className="relative flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 inline-flex items-center gap-2.5 text-ink-soft hover:text-ink">
            <div className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-300 bg-white">
              <Leaf size={16} className="text-forest-950" />
            </div>
            <span className="font-display text-base tracking-tight">Endeerment</span>
          </Link>

          <div className="rounded-xl border border-slate-300 bg-white/88 p-2 backdrop-blur">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('sign-in')
                  setError(null)
                  setMessage(null)
                }}
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  mode === 'sign-in'
                    ? 'bg-white text-forest-950 shadow-soft'
                    : 'text-ink-muted hover:bg-slate-100'
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
                className={`rounded-lg px-4 py-3 text-sm font-medium transition ${
                  mode === 'sign-up'
                    ? 'bg-white text-forest-950 shadow-soft'
                    : 'text-ink-muted hover:bg-slate-100'
                }`}
              >
                Create account
              </button>
            </div>
          </div>

          <h1 className="mt-7 font-display text-3xl leading-tight tracking-tight md:text-4xl">
            {mode === 'sign-in' ? 'Welcome back.' : 'Let’s make your forest real.'}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {usingSupabase
              ? mode === 'sign-in'
                ? 'Sign in with your email and password, or continue with Google if it is available for your account.'
                : 'Create an account to keep your forest, deer, and journal in sync.'
              : 'Sign in locally to keep using your forest on this device.'}
          </p>

          {!supabaseEnabled && (
            <div className="mt-5 rounded-lg border border-amber-200/40 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex items-start gap-3">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <div>
                  Full account sync is not available right now, so this device will keep your progress locally.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-7 space-y-3">
            {usingSupabase && (
              <>
                <Button type="button" size="lg" variant="outline" className="w-full" disabled={submitting} onClick={onGoogleSignIn}>
                  <span className="text-base font-semibold text-[#4285F4]">G</span>
                  Continue with Google
                </Button>
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-ink/10" />
                  <span className="text-xs uppercase tracking-[0.14em] text-ink-faint">or</span>
                  <div className="h-px flex-1 bg-ink/10" />
                </div>
              </>
            )}

            {mode === 'sign-up' && (
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs uppercase tracking-[0.14em] text-ink-muted">
                  Display name <span className="normal-case text-ink-faint">(optional)</span>
                </label>
                <Input
                  id="name"
                  placeholder="First name, nickname, anything"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs uppercase tracking-[0.14em] text-ink-muted">
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
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs uppercase tracking-[0.14em] text-ink-muted">
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
              />
            </div>

            {mode === 'sign-up' && (
              <div className="space-y-1.5">
                <label htmlFor="confirm-password" className="text-xs uppercase tracking-[0.14em] text-ink-muted">
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
                />
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                {message}
              </div>
            )}

            <Button type="submit" size="lg" className="mt-2 w-full" disabled={submitting}>
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

          <div className="mt-6 flex items-start gap-3 rounded-lg border border-slate-300 bg-white/88 p-4 text-sm text-ink-muted">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-forest-200" />
            <p>
              {usingSupabase
                ? 'Your account keeps your forest connected across sign-ins.'
                : 'This device is keeping your progress for now.'}
            </p>
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

      <div className="relative hidden items-center justify-center md:flex">
        <div
          className="absolute inset-8 overflow-hidden rounded-2xl border border-slate-300/40"
          style={{
            background:
              'radial-gradient(circle at 50% 26%, rgba(251,236,196,0.24) 0%, rgba(251,236,196,0) 24%), radial-gradient(circle at 50% 82%, rgba(127,174,135,0.18) 0%, rgba(127,174,135,0) 28%), linear-gradient(180deg, rgba(22,49,38,0.96) 0%, rgba(8,22,16,0.98) 100%)',
          }}
        >
          <div className="absolute inset-x-12 top-10 h-36 rounded-full bg-amber-100/10 blur-3xl" />
          <div className="absolute bottom-10 left-1/2 h-20 w-72 -translate-x-1/2 rounded-full bg-sage-200/20 blur-2xl" />
          <div className="absolute inset-x-12 bottom-14 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          className="relative flex flex-col items-center"
        >
          <div className="pointer-events-none absolute top-8 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(255,239,199,0.7)_0%,rgba(255,239,199,0.14)_46%,rgba(255,239,199,0)_72%)] blur-md" />
          <div className="relative rounded-full border border-white/10 bg-white/[0.03] p-10 shadow-[0_22px_60px_-28px_rgba(0,0,0,0.65)] backdrop-blur-[2px]">
            <Deer size={290} mood="curious" />
          </div>
          <div className="relative mt-6 max-w-sm text-center">
            <p className="font-display text-2xl tracking-tight text-white/90">
              Your deer is already here.
            </p>
            <p className="mt-2 text-sm leading-6 text-white/70">
              Waiting, patient as a clearing at dusk.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
