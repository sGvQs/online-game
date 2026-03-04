'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import type { DialogueLine } from '@/constants/starShieldGame/dialogues'
import { getRomaji } from '@/utils/starShieldGame'
import { StarVisual } from '@/components/game/common/starShield/starVisual'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { typistView } from './styles'
import { ICONS, AURORA_GRADIENT_TYPIST } from '@/constants/starShieldGame/constants'
import { DEFAULT_BULLET_COLOR, TECHNIQUES } from '@/constants/starShieldGame/techniques'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'

const TYPIST_STAR_POSITION = {
    left: '50%',
    bottom: '-25%',
    width: '40vmax',
    height: '40vmax',
    transform: 'translate(-50%, 50%)',
} as const

function TypistBullet({ bulletColor, onComplete }: { bulletColor: string; onComplete: () => void }) {
    const styles = typistView()
    return (
        <motion.div
            className={styles.bullet()}
            style={{
                ['--bullet-color' as string]: bulletColor,
                ['--bullet-shadow' as string]: `${bulletColor}cc`,
            }}
            initial={{ x: -6, y: '-50%' }}
            animate={{ x: '100vw', y: '-50%' }}
            transition={{ duration: 0.4, ease: 'linear' }}
            onAnimationComplete={onComplete}
        />
    )
}

interface TypistViewProps {
    dialogue: { line: DialogueLine; charIndex: number }
    score: { spawned: number; destroyed: number }
    starHp: number
    maxStarHp: number
    typistFireCount: number
    selectedNormalAttack?: TechniqueId | null
}

function TypingDisplay({ line, charIndex }: { line: DialogueLine; charIndex: number }) {
    const romaji = getRomaji(line.text)
    const done = romaji.slice(0, charIndex)
    const current = romaji[charIndex] ?? ''
    const rest = romaji.slice(charIndex + 1)
    const styles = typistView()
    return (
        <div className="flex flex-col items-center gap-6">
            <motion.div
                key={line.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={styles.dialogueCard()}
            >
                <div className="text-brand-500/60 text-xs tracking-widest mb-2">DIALOGUE</div>
                <div className="text-white text-2xl font-bold tracking-wider">{line.text}</div>
            </motion.div>
            <div className="font-mono text-3xl tracking-[0.25em] select-none">
                <span className="text-white/20">{done}</span>
                <span className="text-brand-500 drop-shadow-[0_0_8px_rgba(129,140,248,0.9)] animate-pulse">{current}</span>
                <span className="text-white/50">{rest}</span>
            </div>
            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-brand-500/60 rounded-full"
                    animate={{ width: `${romaji.length > 0 ? (charIndex / romaji.length) * 100 : 0}%` }}
                    transition={{ duration: 0.1 }}
                />
            </div>
        </div>
    )
}

export function TypistView({ dialogue, score, starHp, maxStarHp, typistFireCount, selectedNormalAttack }: TypistViewProps) {
    const inputRef = useRef<HTMLInputElement>(null)
    const prevStarHpRef = useRef(maxStarHp)
    const prevTypistFireCountRef = useRef(typistFireCount)
    const [damageWidth, setDamageWidth] = useState(0)
    const [bullets, setBullets] = useState<{ id: string; color: string }[]>([])

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        const prev = prevStarHpRef.current
        if (starHp < prev && maxStarHp > 0) {
            const lost = ((prev - starHp) / maxStarHp) * 100
            setDamageWidth((w) => w + lost)
        }
        prevStarHpRef.current = starHp
    }, [starHp, maxStarHp])

    const bulletColor =
        selectedNormalAttack && selectedNormalAttack in TECHNIQUES
            ? TECHNIQUES[selectedNormalAttack].color
            : DEFAULT_BULLET_COLOR

    useEffect(() => {
        if (typistFireCount > prevTypistFireCountRef.current) {
            const delta = typistFireCount - prevTypistFireCountRef.current
            setBullets((b) => [...b, ...Array.from({ length: delta }, () => ({ id: crypto.randomUUID(), color: bulletColor }))])
        }
        prevTypistFireCountRef.current = typistFireCount
    }, [typistFireCount, bulletColor])

    return (
        <div
            className="absolute inset-0 overflow-hidden flex flex-col items-center justify-start pt-16"
            onClick={() => inputRef.current?.focus()}
        >
            <input ref={inputRef} className="absolute opacity-0 w-0 h-0 pointer-events-none" readOnly aria-hidden="true" />
            <AuroraGlow width={500} height={300} opacity={0.2} blur={48} gradient={AURORA_GRADIENT_TYPIST} />
            <StarVisual position={TYPIST_STAR_POSITION} />

            <div className="w-full shrink-0 flex flex-col items-center gap-2 py-4 z-20 mt-10">
                <span className={typistView().scoreLabel()}>いんせきをかはいしたかず</span>
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image src={ICONS.METOR} alt="" fill className="object-contain" />
                    </div>
                    <span className="text-white/60 text-2xl">×</span>
                    <span className={typistView().scoreValue()}>{score.destroyed}</span>
                </div>
            </div>

            <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center px-6 z-10">
                <div className="relative w-16 h-16 md:w-20 md:h-20 shrink-0 mb-4">
                    <motion.div
                        className="absolute inset-0 select-none"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                    >
                        <Image src={ICONS.DINO} alt="" fill className="object-contain" />
                    </motion.div>
                    <AnimatePresence>
                        {bullets.map(({ id, color }) => (
                            <TypistBullet key={id} bulletColor={color} onComplete={() => setBullets((b) => b.filter((x) => x.id !== id))} />
                        ))}
                    </AnimatePresence>
                </div>
                <div className="w-full max-w-xl">
                    <TypingDisplay line={dialogue.line} charIndex={dialogue.charIndex} />
                </div>
            </div>

            <div className="w-full shrink-0 flex flex-col items-center gap-2 py-4 z-20">
                <span className={typistView().hpLabel()}>ほしのたいりょく</span>
                <div className="relative w-64 md:w-80 h-3 rounded-full bg-stone-600/80 overflow-hidden">
                    <div
                        className={typistView().hpBar()}
                        style={{ ['--hp-pct' as string]: `${Math.max(0, (starHp / maxStarHp) * 100)}%` }}
                    />
                    {damageWidth > 0 && (
                        <motion.div
                            key={`dmg-${damageWidth}`}
                            className={typistView().damageFlash()}
                            style={{ ['--hp-pct' as string]: `${Math.max(0, (starHp / maxStarHp) * 100)}%` }}
                            initial={{ width: `${damageWidth}%` }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            onAnimationComplete={() => setDamageWidth(0)}
                        />
                    )}
                </div>
            </div>

            <div className="shrink-0 pb-8 text-brand-500/50 text-xs tracking-widest">TYPIST MODE — type the romaji to fire</div>
        </div>
    )
}
