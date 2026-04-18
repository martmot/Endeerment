import { motion } from 'framer-motion'

export function DeerLoader({
  label = 'Gathering a gentle thought…',
  fullScreen = false,
}: {
  label?: string
  fullScreen?: boolean
}) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center gap-6 ${
        fullScreen ? 'min-h-screen px-6' : 'py-8'
      }`}
    >
      {fullScreen && (
        <div className="pointer-events-none absolute inset-0 bg-forest-gradient">
          <div className="absolute left-1/2 top-20 h-56 w-56 -translate-x-1/2 rounded-full bg-amber-200/25 blur-3xl" />
        </div>
      )}
      <div className="relative h-20 w-80 overflow-hidden">
        {/* ground line */}
        <div className="absolute bottom-3 left-0 right-0 h-px bg-gradient-to-r from-transparent via-ink/20 to-transparent" />

        {/* grass tufts */}
        {[18, 60, 108, 160, 210, 252, 300].map((x, i) => (
          <div
            key={i}
            className="absolute bottom-3 h-1.5 w-3 rounded-full bg-sage-300/70"
            style={{ left: x }}
          />
        ))}

        {/* jumping minimal deer */}
        <motion.svg
          width="52"
          height="52"
          viewBox="0 0 60 60"
          className="absolute bottom-3 left-0"
          initial={{ x: -20 }}
          animate={{
            x: [-20, 320],
            y: [0, -22, 0, -18, 0, -20, 0],
          }}
          transition={{
            x: { duration: 2.8, repeat: Infinity, ease: 'linear' },
            y: { duration: 0.7, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <g
            stroke="#1a2e22"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          >
            <path d="M10 38 Q14 22 32 20 Q48 20 50 30 Q48 38 34 38 Z" />
            <line x1="14" y1="38" x2="14" y2="52" />
            <line x1="24" y1="38" x2="26" y2="52" />
            <line x1="40" y1="38" x2="40" y2="52" />
            <line x1="46" y1="38" x2="48" y2="52" />
            <path d="M10 30 Q6 20 10 12" />
            <path d="M8 22 L6 16 M8 22 L12 16" />
            <circle cx="8" cy="24" r="0.8" fill="#1a2e22" />
          </g>
        </motion.svg>
      </div>

      <motion.p
        className="relative font-display italic text-lg text-ink-muted"
        animate={{ opacity: [0.55, 1, 0.55] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {label}
      </motion.p>
    </div>
  )
}
