import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  size?: number
  mood?: 'cheerful' | 'curious' | 'sleepy' | 'playful'
  className?: string
  tone?: 'warm' | 'cool'
}

/**
 * Minimal, side-profile fawn.
 * Slender proportions, hand-drawn stroke weight, restrained palette.
 */
export function Deer({ size = 220, mood = 'curious', className, tone = 'warm' }: Props) {
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      setBlink(true)
      setTimeout(() => setBlink(false), 140)
    }, 3800 + Math.random() * 2400)
    return () => clearInterval(id)
  }, [])

  const sleepy = mood === 'sleepy'
  const playful = mood === 'playful'
  const cheerful = mood === 'cheerful'

  const coat = tone === 'warm' ? '#c89d78' : '#b8b3a8'
  const coatLight = tone === 'warm' ? '#e4c9a6' : '#d9d4c7'
  const coatDark = tone === 'warm' ? '#8a6848' : '#6f6a5c'
  const belly = tone === 'warm' ? '#f3e4ca' : '#e8e3d6'
  const hoof = '#2f2316'
  const eyeColor = '#1a1208'

  return (
    <motion.svg
      className={className}
      width={size}
      height={size * 0.82}
      viewBox="0 0 240 200"
      xmlns="http://www.w3.org/2000/svg"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
    >
      {/* ground shadow — animate scale, not rx */}
      <motion.g
        animate={{ scale: [1, 0.96, 1], opacity: [0.55, 0.42, 0.55] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '120px 186px' }}
      >
        <ellipse cx="120" cy="186" rx="70" ry="6" fill="rgba(26,46,34,0.18)" />
      </motion.g>

      {/* legs — slim */}
      <g stroke={coatDark} strokeWidth="5.4" strokeLinecap="round" fill="none">
        <line x1="88" y1="128" x2="84" y2="180" />
        <motion.line
          x1="102"
          y1="128"
          x2="104"
          y2="180"
          animate={playful ? { pathLength: [1, 1, 1], translateX: [0, 4, 0], translateY: [0, -6, 0] } : {}}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <line x1="158" y1="130" x2="158" y2="180" />
        <line x1="172" y1="130" x2="176" y2="180" />
      </g>
      {/* hoof tips */}
      <g fill={hoof}>
        <rect x="81" y="178" width="6" height="4" rx="1" />
        <rect x="101" y="178" width="6" height="4" rx="1" />
        <rect x="155" y="178" width="6" height="4" rx="1" />
        <rect x="173" y="178" width="6" height="4" rx="1" />
      </g>

      {/* body — slender, slightly arched */}
      <motion.g
        animate={{ scaleY: sleepy ? [1, 1.015, 1] : [1, 1.02, 1] }}
        transition={{ duration: sleepy ? 5 : 3.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '130px 118px' }}
      >
        {/* back body */}
        <path
          d="
            M 78 120
            Q 82 94 118 92
            Q 158 90 188 98
            Q 206 106 198 128
            Q 188 142 164 140
            Q 120 142 88 138
            Q 72 136 78 120 Z
          "
          fill={coat}
          stroke={coatDark}
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* belly highlight */}
        <path
          d="M 88 132 Q 120 142 180 134 Q 192 132 196 124 Q 180 142 132 142 Q 98 142 88 132 Z"
          fill={belly}
          opacity="0.9"
        />
        {/* back crease — hint of anatomy */}
        <path
          d="M 92 104 Q 130 96 186 104"
          stroke={coatLight}
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.7"
        />
        {/* tiny spots */}
        <g fill={coatLight}>
          <circle cx="128" cy="108" r="1.6" />
          <circle cx="144" cy="104" r="1.4" />
          <circle cx="160" cy="110" r="1.6" />
          <circle cx="150" cy="116" r="1.2" />
          <circle cx="170" cy="116" r="1.4" />
        </g>

        {/* tail */}
        <motion.g
          animate={{ rotate: [0, -18, 8, 0] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '196px 112px' }}
        >
          <ellipse cx="198" cy="112" rx="5" ry="9" fill={coat} stroke={coatDark} strokeWidth="1.2" />
          <ellipse cx="199" cy="108" rx="3" ry="5" fill={belly} />
        </motion.g>
      </motion.g>

      {/* neck + head group — gentle sway */}
      <motion.g
        animate={{ rotate: sleepy ? [0, 2, 0] : [0, 1.6, -1.2, 0] }}
        transition={{ duration: sleepy ? 6.5 : 5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformOrigin: '96px 98px' }}
      >
        {/* neck — slim */}
        <path
          d="M 84 114 Q 74 94 80 74 Q 88 62 102 62 Q 110 72 108 90 Q 100 108 90 118 Z"
          fill={coat}
          stroke={coatDark}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* head — small, rounded with snout */}
        <path
          d="
            M 58 74
            Q 54 58 68 52
            Q 86 46 100 56
            Q 108 64 104 76
            Q 100 86 86 88
            Q 74 88 60 84
            Q 56 80 58 74 Z
          "
          fill={coat}
          stroke={coatDark}
          strokeWidth="1.4"
          strokeLinejoin="round"
        />

        {/* muzzle — soft cream tip */}
        <path
          d="M 54 74 Q 48 68 56 62 Q 66 60 72 66 Q 72 74 64 78 Q 56 78 54 74 Z"
          fill={belly}
          stroke={coatDark}
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* nose */}
        <ellipse cx="58" cy="70" rx="2.4" ry="1.6" fill={eyeColor} />

        {/* eye */}
        {blink || sleepy ? (
          <path
            d="M 78 70 Q 84 68 90 70"
            stroke={eyeColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <g>
            <ellipse cx="84" cy="70" rx="2.2" ry="2.8" fill={eyeColor} />
            <circle cx="84.8" cy="68.8" r="0.8" fill="#fff" />
          </g>
        )}

        {cheerful && (
          <ellipse cx="90" cy="80" rx="3.2" ry="1.6" fill="#e69aaa" opacity="0.55" />
        )}

        {/* ear */}
        <motion.g
          animate={{ rotate: [0, -5, 0, 3, 0] }}
          transition={{ duration: 5.2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: '96px 56px' }}
        >
          <path
            d="M 92 60 Q 96 40 108 48 Q 110 58 100 64 Q 94 64 92 60 Z"
            fill={coat}
            stroke={coatDark}
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          <path
            d="M 96 58 Q 100 48 106 50 Q 108 56 102 60 Q 98 60 96 58 Z"
            fill="#e69aaa"
            opacity="0.55"
          />
        </motion.g>

        {/* antlers — spare, hand-drawn strokes */}
        <g stroke={coatDark} strokeWidth="2.4" strokeLinecap="round" fill="none">
          {/* right antler (viewer's right = further back one) */}
          <path d="M 92 48 Q 94 32 98 24" />
          <path d="M 96 34 Q 100 32 104 34" />
          <path d="M 94 26 Q 92 20 98 18" />
          {/* left antler */}
          <path d="M 78 50 Q 72 36 76 24" />
          <path d="M 74 36 Q 70 36 66 34" />
          <path d="M 76 26 Q 80 22 74 16" />
        </g>

        {/* sleep Z */}
        {sleepy && (
          <motion.text
            x="114"
            y="44"
            fontSize="16"
            fill={coatDark}
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            animate={{ y: [44, 32, 44], opacity: [0, 1, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            z
          </motion.text>
        )}
      </motion.g>
    </motion.svg>
  )
}
