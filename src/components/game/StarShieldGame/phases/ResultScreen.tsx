'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { GameResult, GameStats } from '@/types/starShieldGame'
import { ProtectedStar } from './playing/protectedStar'
import { AuroraGlow } from '../shared'
import { FONTS, COLORS, ICONS, DIFFICULTY_META, type Difficulty } from '../constants'

interface ResultScreenProps {
    result: GameResult
    stats: GameStats
    difficulty: Difficulty
    onBackToTitle: () => void
}

const RESULT_CONFIG: Record<
    GameResult,
    {
        title: string
        subtitle: string
        color: string
        glowColor: string
        message: string
        gradient: string
    }
> = {
    CLEARED: {
        title: 'CLEARED',
        subtitle: 'Mission Complete',
        color: '#818cf8',
        glowColor: 'rgba(129,140,248,0.5)',
        message: 'これで大丈夫。きみのおかげだ。へへ。',
        gradient: 'linear-gradient(135deg, #fff 0%, #c084fc 50%, #818cf8 100%)',
    },
    FAILED_CONTACT: {
        title: 'FAILED',
        subtitle: 'Asteroid Contact',
        color: '#ef4444',
        glowColor: 'rgba(239,68,68,0.5)',
        message: 'まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。',
        gradient: 'linear-gradient(135deg, #fca5a5 0%, #ef4444 60%, #b91c1c 100%)',
    },
    FAILED_TIMEOUT: {
        title: 'FAILED',
        subtitle: "Time's Up",
        color: '#f97316',
        glowColor: 'rgba(249,115,22,0.5)',
        message: 'まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。',
        gradient: 'linear-gradient(135deg, #fdba74 0%, #f97316 60%, #c2410c 100%)',
    },
}

const STAT_ITEMS = (
    destroyedCount: number,
    accuracy: number,
    fireCount: number,
    color: string,
) => [
    {
        label: '壊した数',
        value: String(destroyedCount),
        icon: ICONS.METOR,
        color,
    },
    {
        label: '正確性',
        value: `${accuracy}%`,
        icon: ICONS.TARGET_CIRCLE,
        color,
    },
    {
        label: '文字数',
        value: String(fireCount),
        icon: ICONS.TYPIST,
        color,
    },
]

export function ResultScreen({ result, stats, difficulty, onBackToTitle }: ResultScreenProps) {
    const config = RESULT_CONFIG[result]
    const accuracy =
        stats.spawnedCount > 0 ? Math.round((stats.destroyedCount / stats.spawnedCount) * 100) : 0
    const diffMeta = DIFFICULTY_META[difficulty]
    const earnedPoints = result === 'CLEARED' ? diffMeta.rate : null
    const isCleared = result === 'CLEARED'

    const statItems = STAT_ITEMS(stats.destroyedCount, accuracy, stats.fireCount, config.color)

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />

            {/* background glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none"
                style={{ backgroundColor: isCleared ? 'rgba(129,140,248,0.12)' : 'rgba(239,68,68,0.08)' }}
            />
            <AuroraGlow
                width={800}
                height={400}
                opacity={isCleared ? 0.18 : 0.1}
                blur={60}
                gradient={
                    isCleared
                        ? 'radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)'
                        : result === 'FAILED_CONTACT'
                          ? 'radial-gradient(ellipse at 50% 60%, rgba(239,68,68,0.7) 0%, rgba(185,28,28,0.3) 40%, transparent 70%)'
                          : 'radial-gradient(ellipse at 50% 60%, rgba(249,115,22,0.7) 0%, rgba(194,65,12,0.3) 40%, transparent 70%)'
                }
            />

            <motion.div
                className="relative z-10 w-full max-w-lg mx-auto px-6 py-10 flex flex-col items-center gap-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* ===== HERO ===== */}
                <div className="flex flex-col items-center gap-5 w-full">
                    {/* icon */}
                    <motion.div
                        className="relative"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                    >
                        {isCleared ? (
                            <div className="relative w-24 h-24">
                                <div
                                    className="absolute inset-0 rounded-full blur-xl"
                                    style={{ backgroundColor: 'rgba(129,140,248,0.35)' }}
                                />
                                <Image src={ICONS.TARGET_CIRCLE} alt="" fill className="object-contain relative z-10 drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]" />
                            </div>
                        ) : (
                            <div className="relative w-24 h-24">
                                <div
                                    className="absolute inset-0 rounded-full blur-xl"
                                    style={{ backgroundColor: `${config.glowColor}` }}
                                />
                                <Image src={ICONS.FIRE} alt="" fill className="object-contain relative z-10" style={{ filter: `drop-shadow(0 0 20px ${config.color})` }} />
                            </div>
                        )}
                    </motion.div>

                    {/* title */}
                    <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
                    >
                        <h1
                            className="text-7xl font-black tracking-[0.12em] uppercase leading-none select-none"
                            style={{
                                fontFamily: FONTS.CHERRY_BOMB,
                                background: config.gradient,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                filter: `drop-shadow(0 0 30px ${config.glowColor})`,
                            }}
                        >
                            {config.title}
                        </h1>
                        <p
                            className="text-xs tracking-[0.5em] uppercase mt-3"
                            style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_35 }}
                        >
                            {config.subtitle}
                        </p>
                    </motion.div>

                    {/* earned points badge */}
                    {earnedPoints && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
                            className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl"
                            style={{
                                background: diffMeta.bg,
                                border: `2px solid ${diffMeta.border}`,
                                boxShadow: `${diffMeta.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`,
                            }}
                        >
                            <span className="text-xl leading-none">{diffMeta.emoji}</span>
                            <span
                                className="text-2xl font-black tracking-wider"
                                style={{ fontFamily: FONTS.CHERRY_BOMB, color: diffMeta.text }}
                            >
                                {earnedPoints}
                            </span>
                            <span
                                className="text-xs"
                                style={{ fontFamily: FONTS.DOT_GOTHIC, color: diffMeta.text, opacity: 0.7 }}
                            >
                                かくとく
                            </span>
                        </motion.div>
                    )}
                </div>

                {/* ===== DINO MESSAGE ===== */}
                <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.55 }}
                >
                    <div
                        className="rounded-2xl px-5 py-4 flex items-start gap-4"
                        style={{
                            background: 'rgba(30,41,59,0.55)',
                            border: `1px solid ${isCleared ? COLORS.BRAND_18 : 'rgba(239,68,68,0.18)'}`,
                            backdropFilter: 'blur(12px)',
                            boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)`,
                        }}
                    >
                        <div className="relative w-12 h-12 shrink-0 mt-0.5">
                            <Image src={ICONS.DINO} alt="" fill className="object-contain" />
                        </div>
                        {/* speech bubble tail */}
                        <div className="flex-1">
                            <p
                                className="text-sm leading-relaxed"
                                style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.SLATE_7 }}
                            >
                                {config.message}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* ===== STATS ===== */}
                <motion.div
                    className="w-full grid grid-cols-3 gap-3"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.55 }}
                >
                    {statItems.map(({ label, value, icon }, i) => (
                        <motion.div
                            key={label}
                            className="flex flex-col items-center gap-2 rounded-2xl py-4 px-3"
                            style={{
                                background: 'rgba(30,41,59,0.5)',
                                border: `1px solid rgba(255,255,255,0.07)`,
                                backdropFilter: 'blur(8px)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                            }}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.65 + i * 0.07, duration: 0.45 }}
                        >
                            {icon && (
                                <div className="relative w-5 h-5 opacity-50">
                                    <Image src={icon} alt="" fill className="object-contain" />
                                </div>
                            )}
                            <div
                                className="text-2xl font-black tabular-nums leading-none"
                                style={{
                                    fontFamily: FONTS.CHERRY_BOMB,
                                    color: config.color,
                                    textShadow: `0 0 12px ${config.glowColor}`,
                                }}
                            >
                                {value}
                            </div>
                            <div
                                className="text-[9px] tracking-[0.35em] uppercase"
                                style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_25 }}
                            >
                                {label}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ===== BUTTON ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                >
                    <button
                        onClick={onBackToTitle}
                        className="py-3 px-8 rounded-2xl border-2 border-green-500 bg-green-600/90 text-green-50 hover:bg-green-500 hover:border-green-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.45)] cursor-pointer"
                        style={{ fontFamily: FONTS.CHERRY_BOMB, fontSize: '1rem' }}
                    >
                        ▶ BACK TO TITLE
                    </button>
                </motion.div>
            </motion.div>
        </div>
    )
}
