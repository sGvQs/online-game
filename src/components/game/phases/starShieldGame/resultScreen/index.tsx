'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { GameResult, GameStats } from '@/types/starShieldGame'
import { ProtectedStar } from '../playing/protectedStar'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { resultScreen } from './styles'
import { Button } from '@/components/ui/button'
import { ICONS, DIFFICULTY_META, type Difficulty } from '@/constants/starShieldGame/constants'
import { useState, useEffect } from 'react'
import { animate } from 'framer-motion'
import { Typography } from '@/components/ui/typography'
import { getMonthlyRankingInfo } from '@/server/actions/game'

interface ResultScreenProps {
    result: GameResult
    stats: GameStats
    difficulty: Difficulty
    onBackToTitle: () => void
    beforeRanking: { points: number; rank: number }
    currentUserId: string
    isShooter: boolean
}

function PointGainAnimation({ before, gain }: { before: number; gain: number }) {
    const [displayPoints, setDisplayPoints] = useState(before)

    useEffect(() => {

        // カウントアップ開始
        const controls = animate(before, before + gain, {
            duration: 0.8,
            delay: 1.5,
            ease: 'easeOut',
            onUpdate: (v) => setDisplayPoints(Math.floor(v)),
        })

        return () => {
            controls.stop()
        }
    }, [before, gain])

    return (
        <div className="flex flex-col items-center gap-6 my-4">
            <div className="relative flex flex-col items-center">
                <div className="flex items-end gap-2">
                    <motion.div
                        key={displayPoints}
                        initial={{ scale: 1 }}
                        animate={{ scale: [1, 1.2, 1], rotate: [0, -2, 2, -2, 2, 0] }}
                        transition={{ duration: 0.25 }}
                        className="flex items-baseline gap-1"
                    >
                        <span className="text-6xl font-cherry-bomb-one text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                            {displayPoints.toLocaleString()}
                        </span>
                        <span className="text-2xl text-yellow-400/80">pt</span>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0, y: 10, rotate: -10 }}
                    animate={{ opacity: 1, scale: 1, y: -35, rotate: 12 }}
                    exit={{ opacity: 0, y: -20, scale: 0 }}
                    transition={{ delay: 1.5 }}
                    className="absolute right-0 top-6 bg-gradient-to-br from-yellow-300 to-orange-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.4)] border border-white/20 whitespace-nowrap"
                >
                    +{gain}pt
                </motion.div>



            </div>
        </div>
    )
}

function RankUpAnimation({ beforeRank, afterRank }: { beforeRank: number; afterRank: number }) {
    const [displayRank, setDisplayRank] = useState(beforeRank)
    const isRankUp = afterRank < beforeRank && afterRank > 0 && beforeRank > 0

    useEffect(() => {
        if (!isRankUp) return

        // ポイントアニメーションの完了（約2.3s）後にランクアップ
        const timer = setTimeout(() => {
            setDisplayRank(afterRank)
        }, 2800)

        return () => clearTimeout(timer)
    }, [isRankUp, afterRank, beforeRank])

    return (
        <div className="flex flex-col items-center mt-2">
            <motion.div
                key={displayRank}
                initial={{ scale: 1 }}
                animate={displayRank !== beforeRank ? {
                    scale: [1, 1.4, 1],
                    rotate: [0, -5, 5, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.3 }}
                className="relative flex items-center gap-2"
            >
                <div className="flex items-baseline gap-1">
                    <span className="text-6xl font-cherry-bomb-one text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
                        {displayRank > 0 ? displayRank : '--'}
                    </span>
                    <span className="text-2xl text-white/60">位</span>
                </div>

                {displayRank !== beforeRank && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0, y: 10, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, y: -35, rotate: 12 }}
                        className="absolute right-0 top-6 bg-gradient-to-br from-purple-300 to-purple-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-[0_4px_12px_rgba(249,115,22,0.4)] border border-white/20 whitespace-nowrap"
                    >
                        RANK UP!
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}

function StatResultRow({
    icon,
    label,
    value,
    suffix,
    delay = 0.3
}: {
    icon: string;
    label: string;
    value: number;
    suffix: string;
    delay?: number;
}) {
    const [displayValue, setDisplayValue] = useState(0)

    useEffect(() => {
        const controls = animate(0, value, {
            duration: 1.2,
            delay,
            ease: 'easeOut',
            onUpdate: (v) => setDisplayValue(Math.floor(v)),
        })
        return () => controls.stop()
    }, [value, delay])

    return (
        <div className="flex flex-col items-center gap-1">
            <motion.div
                key={displayValue}
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1], rotate: [0, -1, 1, -1, 1, 0] }}
                transition={{ duration: 0.15 }}
                className="flex items-baseline gap-8"
            >
                <div className="flex items-center gap-0">
                    <Image src={icon} alt="" width={40} height={40} className="object-contain" />
                    <span className="text-lg font-cherry-bomb-one text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {label}
                    </span>
                </div>
                <div className='flex gap-2 items-baseline min-w-[120px]'>
                    <span className="text-6xl font-cherry-bomb-one text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                        {displayValue.toLocaleString()}
                    </span>
                    <span className="text-2xl text-white/40 font-cherry-bomb-one">{suffix}</span>
                </div>
            </motion.div>
        </div>
    )
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

export function ResultScreen({
    result,
    stats,
    difficulty,
    onBackToTitle,
    beforeRanking,
    currentUserId,
    isShooter,
}: ResultScreenProps) {
    const [afterRanking, setAfterRanking] = useState<{ points: number; rank: number } | null>(null)

    useEffect(() => {
        if (result === 'CLEARED') {
            // 少し待ってから最新の順位を取得（DB更新完了を待つ）
            const timer = setTimeout(() => {
                getMonthlyRankingInfo(currentUserId).then(setAfterRanking)
            }, 1000)
            return () => clearTimeout(timer)
        }
    }, [result, currentUserId])
    const config = RESULT_CONFIG[result]
    const accuracy =
        stats.spawnedCount > 0 ? Math.round((stats.destroyedCount / stats.spawnedCount) * 100) : 0
    const diffMeta = DIFFICULTY_META[difficulty]
    const earnedPoints = result === 'CLEARED' ? diffMeta.rate : null
    const isCleared = result === 'CLEARED'

    const statItems = STAT_ITEMS(stats.destroyedCount, accuracy, stats.fireCount, config.color)
    const styles = resultScreen()

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />

            {/* background glow */}
            <div
                className={styles.bgGlow()}
                style={{ ['--result-bg-glow' as string]: isCleared ? 'rgba(129,140,248,0.12)' : 'rgba(239,68,68,0.08)' }}
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
                    {/* title */}
                    <motion.div
                        className="text-center"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15, duration: 0.6, ease: 'easeOut' }}
                        style={{
                            ['--result-title-color' as string]: config.color,
                            ['--result-title-glow' as string]: config.glowColor,
                        }}
                    >
                        <h1 className={styles.title()}>{config.title}</h1>
                        <p className={styles.subtitle()}>{config.subtitle}</p>
                    </motion.div>

                    {result === 'CLEARED' && (
                        <div className="flex flex-col items-center gap-8">
                            {/* 順位・ポイント */}
                            <div className='flex gap-16 justify-center items-baseline'>
                                <RankUpAnimation
                                    beforeRank={beforeRanking.rank}
                                    afterRank={afterRanking?.rank ?? beforeRanking.rank}
                                />
                                <PointGainAnimation
                                    before={beforeRanking.points}
                                    gain={parseInt(earnedPoints?.replace('+', '') || '0')}
                                />
                            </div>
                            {/* 壊した数 */}
                            <StatResultRow
                                icon={ICONS.METOR}
                                label="をこわしたかず"
                                value={stats.destroyedCount}
                                suffix="個"
                                delay={0.3}
                            />
                            {/* 役職ごとの結果 */}
                            <StatResultRow
                                icon={isShooter ? ICONS.TARGET_CIRCLE : ICONS.TYPIST}
                                label={isShooter ? "きみの めいちゅうど" : "きみの タイプすう"}
                                value={isShooter ? accuracy : stats.fireCount}
                                suffix={isShooter ? "%" : "文字"}
                                delay={0.8}
                            />
                        </div>
                    )}

                    {/* earned points badge */}
                </div>

                {/* ===== DINO MESSAGE ===== */}
                {/* <motion.div
                    className="w-full"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45, duration: 0.55 }}
                >
                    <div
                        className={styles.dinoMessage()}
                        style={{
                            ['--dino-message-border' as string]: isCleared
                                ? '1px solid rgba(129,140,248,0.18)'
                                : '1px solid rgba(239,68,68,0.18)',
                        }}
                    >
                        <div className="relative w-12 h-12 shrink-0 mt-0.5">
                            <Image src={ICONS.DINO} alt="" fill className="object-contain" />
                        </div>
                        <div className="flex-1">
                            <p className={styles.dinoMessageText()}>{config.message}</p>
                        </div>
                    </div>
                </motion.div> */}

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
                            className={styles.statCard()}
                            style={{
                                ['--stat-color' as string]: config.color,
                                ['--stat-glow' as string]: config.glowColor,
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
                            <div className={styles.statValue()}>{value}</div>
                            <div className={styles.statLabel()}>{label}</div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ===== BUTTON ===== */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.85, duration: 0.5 }}
                >
                    <Button variant="success" onClick={onBackToTitle} className="font-cherry-bomb-one text-base">
                        ▶ BACK TO TITLE
                    </Button>
                </motion.div>
            </motion.div>
        </div>
    )
}
