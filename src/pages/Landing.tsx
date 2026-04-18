import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Leaf, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Deer } from '../components/Deer'
import { Forest } from '../components/Forest'
import { useAuth } from '../contexts/AuthContext'

export function Landing() {
  const { profile } = useAuth()
  return (
    <div className="relative min-h-screen overflow-hidden bg-forest-gradient">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-px bg-white/90" />
        <div className="absolute left-0 top-0 h-full w-px bg-white/70" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6 md:py-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white shadow-soft">
            <Leaf size={18} className="text-forest-950" />
          </div>
          <span className="font-display text-lg tracking-tight">Endeerment</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link to={profile ? '/app' : '/auth'}>
            <Button size="sm">
              {profile ? 'Open app' : 'Start gently'}
              <ArrowRight size={14} />
            </Button>
          </Link>
        </nav>
      </header>

      <section className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-10 pb-16 md:grid-cols-[1.1fr_1fr] md:pt-20 md:pb-24">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="on-forest-surface inline-flex items-center gap-2 rounded-md px-3.5 py-1.5 text-xs on-forest-text"
          >
            <Sparkles size={12} className="text-amber-glow" />
            <span>A wellness companion — not a clinician</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 font-display text-5xl leading-[1.05] tracking-tight md:text-7xl"
          >
            A quiet place
            <br />
            <span className="bg-gradient-to-r from-forest-200 via-forest-100 to-amber-glow bg-clip-text text-transparent">
              to check in with yourself.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="on-forest-text-soft mt-6 max-w-xl text-base leading-relaxed md:text-lg"
          >
            Write a few honest lines. Grow a small forest — and a deer companion who is patient, never in a rush, and always glad you came.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link to={profile ? '/app' : '/auth'}>
              <Button size="lg">
                {profile ? 'Continue your forest' : 'Begin a check-in'}
                <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">
                <Heart size={16} /> I'm new here
              </Button>
            </Link>
          </motion.div>

          <div className="on-forest-text-muted mt-10 flex items-center gap-5 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-forest-300" /> No judgment
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-glow" /> No diagnoses
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-plum-soft" /> Your words stay yours
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
          className="relative isolate"
        >
          <div className="relative rounded-2xl border border-slate-300 bg-white/70 p-2 shadow-card">
            <Forest level={5} height={380} className="rounded-xl" showLabel={false} showPet={false} />
            <div className="absolute inset-x-0 bottom-0 z-10 flex justify-center pb-4">
              <Deer size={210} mood="curious" />
            </div>
          </div>
          <div className="on-forest-surface absolute -right-4 top-8 z-20 hidden rounded-lg px-4 py-3 text-sm md:block">
            <div className="on-forest-text-muted text-[10px] uppercase tracking-[0.2em]">streak</div>
            <div className="on-forest-text font-display text-2xl">7 days</div>
          </div>
          <div className="on-forest-surface absolute -left-4 bottom-20 z-20 hidden rounded-lg px-4 py-3 text-sm md:block">
            <div className="on-forest-text-muted text-[10px] uppercase tracking-[0.2em]">mood</div>
            <div className="on-forest-text font-display text-2xl">reflective 🌿</div>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="glass relative overflow-hidden rounded-xl p-6"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-slate-50">
                {f.icon}
              </div>
              <h3 className="font-display text-xl tracking-tight">{f.title}</h3>
              <p className="on-forest-text-soft mt-1.5 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="on-forest-text-faint relative z-10 mx-auto flex max-w-6xl items-center justify-between border-t border-ink/10 px-6 py-6 text-xs">
        <span>© Endeerment. Be gentle with yourself today.</span>
        <span>Not medical advice.</span>
      </footer>
    </div>
  )
}

const FEATURES = [
  {
    title: 'Write, briefly',
    desc: 'A textarea, a few honest lines, and a quiet pause. That is the whole ritual. Three minutes, a few times a week.',
    icon: <Leaf size={18} className="text-forest-600" />,
  },
  {
    title: 'A gentle reflection',
    desc: 'We send your words to a private AI that answers warmly — never clinically, never judgmentally.',
    icon: <Sparkles size={18} className="text-amber-glow" />,
  },
  {
    title: 'Your forest, your deer',
    desc: 'Each check-in plants something. The deer grows closer. The forest fills in, slowly.',
    icon: <Heart size={18} className="text-plum-soft" />,
  },
]
