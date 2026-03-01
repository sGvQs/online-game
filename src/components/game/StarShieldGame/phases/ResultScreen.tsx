'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { GameResult, GameStats } from '@/hooks/useStarShield'
import { ProtectedStar } from './playing/ProtectedStar'
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
    { title: string; subtitle: string; color: string; message: string }
> = {
    CLEARED: {
        title: 'CLEARED',
        subtitle: 'Mission Complete',
        color: '#818cf8',
        message: 'これで大丈夫。きみのおかげだ。へへ。',
    },
    FAILED_CONTACT: {
        title: 'FAILED',
        subtitle: 'Asteroid Contact',
        color: '#ef4444',
        message: 'まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。',
    },
    FAILED_TIMEOUT: {
        title: 'FAILED',
        subtitle: "Time's Up",
        color: '#f97316',
        message: 'まあ、こういう日もあるよ。でも、きみがいなかったらもっと大変だった。',
    },
}

export function ResultScreen({ result, stats, difficulty, onBackToTitle }: ResultScreenProps) {
    const config = RESULT_CONFIG[result]
    const accuracy =
        stats.spawnedCount > 0 ? Math.round((stats.destroyedCount / stats.spawnedCount) * 100) : 0
    const minutes = Math.floor(stats.durationSeconds / 60)
    const seconds = stats.durationSeconds % 60
    const diffMeta = DIFFICULTY_META[difficulty]
    const earnedPoints = result === 'CLEARED' ? diffMeta.rate : null

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />
            <AuroraGlow width={700} height={350} opacity={0.2} blur={50} />

            <motion.div
                className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <div className="text-center">
                    <h1
                        className="text-6xl font-black tracking-[0.15em] uppercase"
                        style={{
                            fontFamily: FONTS.CHERRY_BOMB,
                            color: config.color,
                            textShadow: `0 0 40px ${config.color}80`,
                        }}
                    >
                        {config.title}
                    </h1>
                    <p
                        className="text-sm tracking-[0.4em] uppercase mt-2"
                        style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_5 }}
                    >
                        {config.subtitle}
                    </p>
                    {earnedPoints && (
                        <motion.p
                            className="mt-4 text-2xl font-black tracking-wider"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            style={{
                                fontFamily: FONTS.CHERRY_BOMB,
                                color: diffMeta.text,
                                background: diffMeta.bg,
                                border: `2px solid ${diffMeta.border}`,
                                boxShadow: diffMeta.glow,
                                padding: '0.5rem 1.25rem',
                                borderRadius: '1rem',
                                display: 'inline-block',
                            }}
                        >
                            {earnedPoints} 獲得！
                        </motion.p>
                    )}
                </div>

                <motion.div
                    className="rounded-2xl p-5"
                    style={{ background: COLORS.BRAND_05, border: `1px solid ${COLORS.BRAND_18}` }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative w-12 h-12 shrink-0">
                            <Image src={ICONS.DINO} alt="" fill className="object-contain" />
                        </div>
                        <p
                            className="text-sm leading-relaxed flex-1"
                            style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.SLATE_7 }}
                        >
                            {config.message}
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    className="rounded-2xl p-5"
                    style={{ background: COLORS.PURPLE_05, border: `1px solid ${COLORS.PURPLE_18}` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <p
                        className="text-[10px] tracking-[0.4em] uppercase mb-4"
                        style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.PURPLE_6 }}
                    >
                        Stats
                    </p>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="text-center">
                            <div
                                className="text-2xl font-bold tabular-nums"
                                style={{ fontFamily: FONTS.CHERRY_BOMB, color: config.color }}
                            >
                                {stats.destroyedCount}/{stats.spawnedCount}
                            </div>
                            <div
                                className="text-[10px] tracking-widest mt-1"
                                style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_35 }}
                            >
                                DESTROYED
                            </div>
                        </div>
                        <div className="text-center">
                            <div
                                className="text-2xl font-bold tabular-nums"
                                style={{ fontFamily: FONTS.CHERRY_BOMB, color: config.color }}
                            >
                                {accuracy}%
                            </div>
                            <div
                                className="text-[10px] tracking-widest mt-1"
                                style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_35 }}
                            >
                                ACCURACY
                            </div>
                        </div>
                        <div className="text-center">
                            <div
                                className="text-2xl font-bold tabular-nums"
                                style={{ fontFamily: FONTS.CHERRY_BOMB, color: config.color }}
                            >
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </div>
                            <div
                                className="text-[10px] tracking-widest mt-1"
                                style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_35 }}
                            >
                                TIME
                            </div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.9, duration: 0.5 }}
                    className="flex justify-center"
                >
                    <button
                        onClick={onBackToTitle}
                        className="py-3 px-6 rounded-2xl border-2 border-green-500 bg-green-600/90 text-green-50 hover:bg-green-500 hover:border-green-400 hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(34,197,94,0.5)] cursor-pointer"
                        style={{ fontFamily: FONTS.CHERRY_BOMB, fontSize: '1rem' }}
                    >
                        ▶ BACK TO TITLE
                    </button>
                </motion.div>
            </motion.div>
        </div>
    )
}
