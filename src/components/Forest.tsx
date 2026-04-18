import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import type { GardenPlant } from '../types'
import { Deer } from './Deer'

interface Props {
  level: number
  inventory?: string[]
  garden?: GardenPlant[]
  activeWateringPlantIds?: string[]
  wateringRunId?: number
  petHappiness?: number
  petMood?: 'cheerful' | 'curious' | 'sleepy' | 'playful'
  petName?: string
  className?: string
  height?: number
  showLabel?: boolean
  showPet?: boolean
}

function seed(s: number) {
  const x = Math.sin(s) * 10000
  return x - Math.floor(x)
}

const WATERING_MOVE_FIRST_MS = 1100
const WATERING_MOVE_BETWEEN_MS = 900
const WATERING_PAUSE_MS = 500
const WATERING_RETURN_MS = 950
const WATERING_CAN_REACH_PX = 24

/** A soft 2D garden scene. Shop purchases become plants here, and each plant shows its growth stage. */
export function Forest({
  level,
  inventory = [],
  garden = [],
  activeWateringPlantIds = [],
  wateringRunId = 0,
  petHappiness = 60,
  petMood = 'curious',
  petName = 'Mochi',
  className,
  height = 240,
  showLabel = true,
  showPet = true,
}: Props) {
  const backgroundTrees = useMemo(() => {
    const count = Math.min(14, 4 + level)
    return Array.from({ length: count }, (_, i) => {
      const r1 = seed(i * 14.7 + level)
      const r2 = seed(i * 33.1 + level * 2)
      return {
        x: 4 + r1 * 92,
        scale: 0.72 + r2 * 0.42,
        delay: i * 0.04,
        tint: i % 2 === 0 ? '#8bb08d' : '#77a179',
      }
    })
  }, [level])

  const plantedTrees = useMemo(
    () =>
      garden.map((plant, i) => ({
        ...plant,
        index: i,
        left: [14, 34, 56, 76, 24, 46, 68, 18, 40, 62, 82][i % 11],
        row: Math.floor(i / 4),
        offset: ((i * 7) % 3) - 1,
      })),
    [garden]
  )

  const wateringTargets = useMemo(() => {
    if (activeWateringPlantIds.length === 0) return null
    return activeWateringPlantIds
      .map((id) => plantedTrees.find((plant) => plant.id === id))
      .filter((plant): plant is NonNullable<typeof plant> => Boolean(plant))
      .map((plant) => ({
        ...plant,
        deerLeft: `${plant.left + plant.offset}%`,
        deerY: 12.8 + plant.row * 1.6 + (plant.index % 2) * 0.4,
      }))
  }, [activeWateringPlantIds, plantedTrees])

  const [revealedGrowthPlantIds, setRevealedGrowthPlantIds] = useState<string[]>([])

  const wateringSequence = useMemo(() => {
    if (!wateringTargets || wateringTargets.length === 0) return null

    let elapsed = 0
    const left = ['62%']
    const bottom = ['13%']
    const deerOffsetX = [0]
    const canRotate = [0]
    const canY = [0]
    const timeline = [0]
    const revealMoments: Array<{ id: string; at: number }> = []

    wateringTargets.forEach((target, index) => {
      elapsed += index === 0 ? WATERING_MOVE_FIRST_MS : WATERING_MOVE_BETWEEN_MS
      left.push(target.deerLeft)
      bottom.push(`${target.deerY}%`)
      deerOffsetX.push(-WATERING_CAN_REACH_PX)
      canRotate.push(0)
      canY.push(0)
      timeline.push(elapsed)
      revealMoments.push({ id: target.id, at: elapsed + 120 })

      elapsed += WATERING_PAUSE_MS
      left.push(target.deerLeft)
      bottom.push(`${target.deerY}%`)
      deerOffsetX.push(-WATERING_CAN_REACH_PX)
      canRotate.push(16)
      canY.push(-5)
      timeline.push(elapsed)
    })

    elapsed += WATERING_RETURN_MS
    left.push('62%')
    bottom.push('13%')
    deerOffsetX.push(0)
    canRotate.push(0)
    canY.push(0)
    timeline.push(elapsed)

    return {
      deerAnimate: {
        left,
        bottom,
        x: deerOffsetX,
      },
      deerTransition: {
        duration: elapsed / 1000,
        times: timeline.map((point) => point / elapsed),
        ease: 'easeInOut' as const,
      },
      canAnimate: {
        rotate: canRotate,
        y: canY,
      },
      canTransition: {
        duration: elapsed / 1000,
        times: timeline.map((point) => point / elapsed),
        ease: 'easeInOut' as const,
      },
      revealMoments,
    }
  }, [wateringTargets])

  useEffect(() => {
    if (!wateringSequence) {
      setRevealedGrowthPlantIds([])
      return
    }

    setRevealedGrowthPlantIds([])
    const timers = wateringSequence.revealMoments.map(({ id, at }) =>
      window.setTimeout(() => {
        setRevealedGrowthPlantIds((current) => (current.includes(id) ? current : [...current, id]))
      }, at)
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [wateringRunId, wateringSequence])

  const deerAnimate = wateringSequence?.deerAnimate ?? {
    left: ['62%', '69%', '58%', '62%'],
    bottom: ['13%', '13.6%', '12.7%', '13%'],
  }

  const deerTransition = wateringSequence?.deerTransition ?? {
    duration: petHappiness >= 70 ? 9.5 : 13,
    repeat: Infinity,
    ease: 'easeInOut' as const,
  }

  const decorations = useMemo(
    () => inventory.filter((id) => id.startsWith('deco_')).slice(0, 4),
    [inventory]
  )

  return (
    <div
      className={`relative w-full overflow-hidden rounded-xl ${className ?? ''}`}
      style={{ height }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #fff7e6 0%, #f7f0dd 34%, #e6f0de 70%, #d7e8cb 100%)',
        }}
      />

      <div
        className="absolute right-8 top-6 h-16 w-16 rounded-full"
        style={{
          background:
            'radial-gradient(circle at 35% 35%, #fffdf7 0%, #ffe8b0 42%, rgba(255,232,176,0) 74%)',
          boxShadow: '0 0 50px 10px rgba(255,232,176,0.34)',
        }}
      />

      <div className="absolute inset-x-0 bottom-[34%] h-[26%] bg-gradient-to-t from-[#bfd6b6]/65 to-transparent" />

      <svg
        className="absolute inset-x-0 bottom-[28%] h-[18%] w-full"
        viewBox="0 0 400 80"
        preserveAspectRatio="none"
      >
        <path d="M0 80 L58 38 L128 60 L208 20 L296 52 L362 30 L400 44 L400 80 Z" fill="#bfd4bc" />
        <path d="M0 80 L64 54 L140 64 L214 42 L298 58 L358 48 L400 58 L400 80 Z" fill="#cfe0ca" opacity="0.82" />
      </svg>

      {backgroundTrees.map((tree, i) => (
        <motion.div
          key={`bg-tree-${i}`}
          className="absolute"
          style={{
            left: `${tree.x}%`,
            bottom: '28%',
            width: 66 * tree.scale,
            height: 104 * tree.scale,
            transform: 'translateX(-50%)',
            zIndex: 3,
          }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: tree.delay, ease: 'easeOut' }}
        >
          <OrganicTree tint={tree.tint} />
        </motion.div>
      ))}

      <div className="absolute inset-x-0 bottom-[16%] z-[5] h-[24%] bg-[#cde4bf]" />
      <div className="absolute inset-x-0 bottom-[9%] z-[6] h-[12%] bg-[#b7d59d]" />
      <div className="absolute inset-x-0 bottom-0 z-[7] h-[12%] bg-[#96bf7e]" />

      <div className="absolute inset-x-[7%] bottom-[12%] z-[8] h-[2px] bg-[#8a6b46]/40" />
      <div className="absolute inset-x-[7%] bottom-[20%] z-[8] h-[2px] bg-[#8a6b46]/24" />

      <div className="absolute inset-x-[6%] bottom-[8%] z-[9] flex h-[24%] items-end justify-between">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`fence-${i}`} className="relative h-full w-10">
            <div className="absolute bottom-0 left-1/2 h-full w-2 -translate-x-1/2 rounded-full bg-[#c9a67b]" />
            <div className="absolute left-0 top-[28%] h-2 w-full rounded-full bg-[#d8b78a]" />
            <div className="absolute left-0 top-[56%] h-2 w-full rounded-full bg-[#d8b78a]" />
          </div>
        ))}
      </div>

      {decorations.map((decor, i) => (
        <motion.div
          key={`decor-${decor}-${i}`}
          className="absolute z-[10]"
          style={{
            left: `${10 + i * 23}%`,
            bottom: `${8 + (i % 2) * 4}%`,
            transform: 'translateX(-50%)',
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: i * 0.08 }}
        >
          <Decoration id={decor} />
        </motion.div>
      ))}

      {plantedTrees.map((plant, i) => (
        (() => {
          const isWateringTarget = activeWateringPlantIds.includes(plant.id)
          const isGrowthRevealed = revealedGrowthPlantIds.includes(plant.id)
          const displayStage =
            isWateringTarget && !isGrowthRevealed ? (Math.max(0, plant.stage - 1) as 0 | 1 | 2 | 3) : plant.stage

          return (
            <motion.div
              key={plant.id}
              className="absolute z-[12]"
              style={{
                left: `${plant.left + plant.offset}%`,
                bottom: `${12 + plant.row * 10 + (i % 2) * 2}%`,
                width: 72 + displayStage * 12,
                height: 90 + displayStage * 16,
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, y: 12, scale: 0.92 }}
              animate={{
                opacity: 1,
                y: 0,
                scale: isWateringTarget && isGrowthRevealed ? [1, 1.08, 1] : 1,
              }}
              transition={{
                duration: isWateringTarget && isGrowthRevealed ? 0.45 : 0.6,
                delay: isWateringTarget ? 0 : i * 0.05,
              }}
            >
              <GardenPlantSprite plant={{ ...plant, stage: displayStage }} />
            </motion.div>
          )
        })()
      ))}

      {showPet && (
        <motion.div
          key={`deer-run-${wateringRunId}-${activeWateringPlantIds.join('-') || 'idle'}`}
          className="absolute z-[13]"
          initial={{ left: '62%', bottom: '13%' }}
          animate={deerAnimate}
          transition={deerTransition}
        >
          <div className="relative">
            <motion.div
              className="absolute left-[14%] top-[60%] z-[3]"
              animate={
                wateringSequence
                  ? wateringSequence.canAnimate
                  : {
                      rotate: petHappiness >= 70 ? [0, 10, -8, 0] : [0, 5, -4, 0],
                      y: [0, -1, 0],
                    }
              }
              transition={
                wateringSequence
                  ? wateringSequence.canTransition
                  : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }
              }
            >
              <WateringCan />
            </motion.div>
            <div
              className="absolute left-1/2 top-[78%] h-8 w-24 -translate-x-1/2 rounded-full blur-md"
              style={{ background: 'rgba(64, 96, 53, 0.16)' }}
            />
            <Deer size={120} mood={petMood} />
          </div>
        </motion.div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[14] h-[14%] bg-gradient-to-t from-[#8ab16e] to-transparent" />

      {showLabel && (
        <div className="absolute left-4 top-4 rounded-md border border-slate-300 bg-white/88 px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-ink-muted backdrop-blur">
          Garden · level {level}
        </div>
      )}

      {showLabel && (
        <div className="absolute right-4 top-4 rounded-md border border-slate-300 bg-white/88 px-3 py-1 text-[11px] font-medium tracking-[0.02em] text-ink-muted backdrop-blur">
          {garden.length} planted
        </div>
      )}

      {showLabel && showPet && (
        <div className="absolute bottom-4 right-4 z-[20] rounded-md border border-slate-300 bg-white/92 px-3 py-1.5 text-xs font-medium text-ink shadow-soft backdrop-blur">
          {petName} is helping around the garden
        </div>
      )}
    </div>
  )
}

function GardenPlantSprite({ plant }: { plant: GardenPlant }) {
  if (plant.stage === 0) return <Seedling />
  if (plant.stage === 1) return <Sprout />
  if (plant.stage === 2) return <Sapling kind={plant.shop_item_id} />
  return <OwnedTree id={plant.shop_item_id} />
}

function OrganicTree({ tint }: { tint: string }) {
  return (
    <svg viewBox="0 0 100 160" preserveAspectRatio="none" width="100%" height="100%">
      <rect x="46" y="128" width="8" height="30" rx="2" fill="#5a3e25" opacity="0.9" />
      <path
        d="M50 8 C70 18 86 40 82 64 C98 58 96 94 76 96 C88 114 66 128 50 118 C34 128 12 114 24 96 C4 94 2 58 18 64 C14 40 30 18 50 8 Z"
        fill={tint}
      />
      <path
        d="M50 18 C66 28 78 46 76 66 C90 62 86 90 72 92 C80 104 64 116 50 110 C36 116 20 104 28 92 C14 90 10 62 24 66 C22 46 34 28 50 18 Z"
        fill="#ffffff"
        opacity="0.08"
      />
    </svg>
  )
}

function Seedling() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <ellipse cx="40" cy="110" rx="18" ry="7" fill="#7a5a39" opacity="0.22" />
      <path d="M28 108 Q40 94 52 108 Z" fill="#8c643f" />
      <path d="M40 100 Q40 82 42 72" stroke="#5f914f" strokeWidth="4" strokeLinecap="round" />
      <path d="M40 84 Q26 76 20 60 Q36 60 44 78 Z" fill="#79ad63" />
      <path d="M42 78 Q56 68 62 54 Q46 54 38 72 Z" fill="#90c46f" />
    </svg>
  )
}

function Sprout() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <ellipse cx="40" cy="110" rx="20" ry="8" fill="#7a5a39" opacity="0.22" />
      <path d="M24 108 Q40 88 56 108 Z" fill="#8c643f" />
      <rect x="38" y="66" width="4" height="34" rx="2" fill="#689858" />
      <path d="M40 78 Q22 66 16 42 Q36 42 46 68 Z" fill="#7fb86a" />
      <path d="M42 72 Q58 58 64 34 Q48 34 38 60 Z" fill="#97cc78" />
      <path d="M40 92 Q26 86 24 70 Q36 72 42 86 Z" fill="#6fa85d" />
    </svg>
  )
}

function Sapling({ kind }: { kind: string }) {
  const canopy =
    kind === 'seed_willow' ? '#8fb88d' : kind === 'seed_pine' ? '#447b57' : '#5a946d'

  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <ellipse cx="40" cy="110" rx="22" ry="7" fill="#7a5a39" opacity="0.2" />
      <rect x="37" y="54" width="6" height="50" rx="2" fill="#6a472c" />
      {kind === 'seed_pine' ? (
        <path d="M40 20 L62 56 L50 56 L68 86 L12 86 L30 56 L18 56 Z" fill={canopy} />
      ) : (
        <>
          <circle cx="40" cy="42" r="18" fill={canopy} />
          <circle cx="28" cy="50" r="12" fill={canopy} opacity="0.9" />
          <circle cx="52" cy="48" r="12" fill={canopy} opacity="0.95" />
        </>
      )}
    </svg>
  )
}

function OwnedTree({ id }: { id: string }) {
  switch (id) {
    case 'seed_oak':
    case 'tree_oak':
      return <OakTree />
    case 'seed_willow':
      return <WillowTree />
    case 'seed_pine':
      return <PineTree />
    case 'tree_cherry':
      return <CherryTree />
    case 'tree_maple':
      return <MapleTree />
    default:
      return <OakTree />
  }
}

function OakTree() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <rect x="36" y="86" width="8" height="34" rx="2" fill="#5a3e25" />
      <path d="M36 92 Q28 102 30 120" stroke="#5a3e25" strokeWidth="3" fill="none" />
      <ellipse cx="40" cy="54" rx="34" ry="36" fill="#4e8e6b" />
      <ellipse cx="26" cy="62" rx="20" ry="18" fill="#3f7a5a" />
      <ellipse cx="54" cy="60" rx="22" ry="22" fill="#5fa07c" />
      <ellipse cx="40" cy="40" rx="18" ry="16" fill="#6eb58a" />
    </svg>
  )
}

function WillowTree() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <rect x="36" y="70" width="8" height="50" rx="2" fill="#5a3e25" />
      <ellipse cx="40" cy="42" rx="28" ry="22" fill="#8cb58a" />
      <g stroke="#8cb58a" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.85">
        <path d="M18 50 Q14 74 20 96" />
        <path d="M26 56 Q22 80 28 104" />
        <path d="M40 60 Q40 88 42 108" />
        <path d="M54 56 Q58 80 54 102" />
        <path d="M62 50 Q66 74 60 94" />
        <path d="M32 58 Q30 82 34 100" />
        <path d="M48 58 Q52 84 50 104" />
      </g>
    </svg>
  )
}

function PineTree() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <rect x="36" y="100" width="8" height="20" rx="2" fill="#4a341f" />
      <path d="M40 10 L66 44 L50 44 L74 80 L56 80 L80 108 L0 108 L24 80 L6 80 L30 44 L14 44 Z" fill="#2c6a4e" />
      <path d="M40 22 L62 48 L50 48 L72 80 L60 80 L78 106 L40 106 Z" fill="#ffffff" opacity="0.08" />
    </svg>
  )
}

function CherryTree() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <rect x="36" y="84" width="8" height="36" rx="2" fill="#5a3e25" />
      <g>
        <circle cx="28" cy="56" r="20" fill="#f4cad5" />
        <circle cx="52" cy="54" r="22" fill="#f0b5c4" />
        <circle cx="40" cy="38" r="18" fill="#f8d4dc" />
        <circle cx="42" cy="66" r="16" fill="#ecaec0" />
      </g>
      <circle cx="20" cy="108" r="1.4" fill="#f0b5c4" />
      <circle cx="64" cy="112" r="1.4" fill="#f4cad5" />
      <circle cx="48" cy="114" r="1.2" fill="#ecaec0" />
    </svg>
  )
}

function MapleTree() {
  return (
    <svg viewBox="0 0 80 120" width="100%" height="100%">
      <rect x="36" y="82" width="8" height="38" rx="2" fill="#5a3e25" />
      <g>
        <circle cx="28" cy="56" r="20" fill="#d9772e" />
        <circle cx="52" cy="54" r="22" fill="#c75f29" />
        <circle cx="40" cy="36" r="18" fill="#e68b3f" />
        <circle cx="42" cy="66" r="16" fill="#b34f25" />
      </g>
      <circle cx="18" cy="110" r="1.6" fill="#c75f29" />
      <circle cx="62" cy="112" r="1.6" fill="#d9772e" />
    </svg>
  )
}

function Decoration({ id }: { id: string }) {
  switch (id) {
    case 'deco_lantern':
      return (
        <svg viewBox="0 0 40 70" width="36" height="60">
          <line x1="20" y1="20" x2="20" y2="60" stroke="#5a3e25" strokeWidth="2" />
          <path d="M8 16 Q8 6 20 6 Q32 6 32 16 L30 24 Q20 28 10 24 Z" fill="#f1d08a" />
          <path d="M10 24 Q20 28 30 24 L28 30 Q20 32 12 30 Z" fill="#b88237" />
          <rect x="17" y="6" width="6" height="3" rx="1" fill="#5a3e25" />
          <circle cx="20" cy="16" r="18" fill="#ffe8a8" opacity="0.35" />
        </svg>
      )
    case 'deco_stone':
      return (
        <svg viewBox="0 0 60 30" width="54" height="26">
          <ellipse cx="30" cy="24" rx="28" ry="6" fill="#6b7d6b" opacity="0.35" />
          <path d="M6 22 Q4 10 18 8 Q34 4 46 10 Q58 14 54 22 Q38 26 22 24 Q10 24 6 22 Z" fill="#8a9b8a" />
          <path d="M10 18 Q16 8 30 8 Q28 14 20 16 Q14 16 10 18 Z" fill="#a5b6a2" />
          <circle cx="14" cy="18" r="2" fill="#4e8e6b" />
          <circle cx="40" cy="16" r="2.4" fill="#5fa07c" />
          <circle cx="48" cy="20" r="1.6" fill="#4e8e6b" />
        </svg>
      )
    case 'deco_mushroom':
      return (
        <svg viewBox="0 0 60 30" width="54" height="26">
          <ellipse cx="30" cy="26" rx="26" ry="3.5" fill="#6b7d6b" opacity="0.3" />
          <Mushroom cx={12} h={16} />
          <Mushroom cx={28} h={22} big />
          <Mushroom cx={44} h={14} />
        </svg>
      )
    default:
      return null
  }
}

function Mushroom({ cx, h, big }: { cx: number; h: number; big?: boolean }) {
  const r = big ? 8 : 5
  const stemW = big ? 3 : 2
  return (
    <g>
      <rect x={cx - stemW / 2} y={26 - h + r - 2} width={stemW} height={h - r + 2} fill="#fdf7e7" />
      <path
        d={`M ${cx - r} ${26 - h + r} Q ${cx} ${26 - h - r * 0.3} ${cx + r} ${26 - h + r} Q ${cx + r - 1} ${26 - h + r + 2} ${cx - r + 1} ${26 - h + r + 2} Z`}
        fill="#c75f29"
      />
      <circle cx={cx - r / 2} cy={26 - h + r - 1} r={1} fill="#fdf7e7" />
      <circle cx={cx + r / 2} cy={26 - h + r - 2} r={1.2} fill="#fdf7e7" />
    </g>
  )
}

function WateringCan() {
  return (
    <svg viewBox="0 0 42 42" width="28" height="28">
      <path d="M10 18 Q10 10 18 10 H26 Q33 10 33 18 V25 Q33 31 27 31 H17 Q10 31 10 24 Z" fill="#8eb7c6" />
      <path d="M28 14 Q36 14 38 21" stroke="#6b92a2" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M11 19 Q4 18 4 12 Q4 7 9 7 Q13 7 15 10" stroke="#6b92a2" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="31" cy="25" r="1.7" fill="#8fd4ff" />
      <circle cx="35" cy="29" r="1.4" fill="#8fd4ff" />
    </svg>
  )
}
