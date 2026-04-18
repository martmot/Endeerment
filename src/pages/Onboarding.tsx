import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Leaf, PawPrint, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Deer } from '../components/Deer'
import { useAuth } from '../contexts/AuthContext'

const STEPS = [
  {
    icon: <Leaf size={20} className="text-forest-200" />,
    title: 'Small, honest check-ins.',
    body: 'Two or three sentences. How you feel, what you noticed. That’s all. No streaks to stress about — they’re just a gentle nudge.',
  },
  {
    icon: <Sparkles size={20} className="text-amber-glow" />,
    title: 'A warm reflection, not a diagnosis.',
    body: 'An AI companion reads what you wrote and responds gently — never clinically, never judgmentally. You’re welcome to ignore it.',
  },
  {
    icon: <PawPrint size={20} className="text-plum-soft" />,
    title: 'A deer, a forest, slow growth.',
    body: 'Each check-in plants something small. Your deer grows closer with time. Nothing can die or wilt here — only grow.',
  },
]

export function Onboarding() {
  const { updateProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)

  function finish(skipped = false) {
    updateProfile({ onboarded: true })
    navigate('/app', { replace: true })
    void skipped
  }

  const last = step === STEPS.length - 1

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-forest-gradient px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-white/90" />
      </div>

      <div className="relative z-10 grid w-full max-w-4xl grid-cols-1 items-center gap-10 md:grid-cols-[1fr_1.1fr]">
        <div className="relative order-2 flex justify-center md:order-1">
          <Deer size={260} mood="curious" />
        </div>

        <div className="order-1 md:order-2">
          <div className="mb-5 flex items-center gap-1.5">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-sm transition-all ${
                  i === step ? 'w-8 bg-forest-200' : i < step ? 'w-4 bg-forest-300/70' : 'w-4 bg-white/10'
                }`}
              />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35 }}
              className="space-y-4"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-md border border-slate-300 bg-white">
                {STEPS[step].icon}
              </div>
              <h1 className="font-display text-4xl leading-tight tracking-tight md:text-5xl">
                {STEPS[step].title}
              </h1>
              <p className="max-w-md leading-relaxed text-ink-muted">{STEPS[step].body}</p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center gap-2">
            <Button
              size="lg"
              onClick={() => (last ? finish() : setStep(step + 1))}
            >
              {last ? 'Open my forest' : 'Next'} <ArrowRight size={16} />
            </Button>
            {!last && (
              <Button variant="ghost" onClick={() => finish(true)}>
                Skip
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
