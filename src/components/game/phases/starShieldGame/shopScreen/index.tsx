'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ProtectedStar } from '../playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/dinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import {
    getMyStarShieldProgress,
    purchaseNormalAttackUnlock,
    purchaseNormalAttackLevelUp,
    purchaseSpecialAttackUnlock,
    purchaseSpecialAttackLevelUp,
    purchaseHealUnlock,
    purchaseHealLevelUp,
} from '@/server/actions/game'
import type { StarShieldProgress } from '@/server/actions/game/starShieldProgressionActions'
import {
    NORMAL_ATTACK_UNLOCK_COSTS,
    NORMAL_ATTACK_LEVEL_UP_COSTS,
    SPECIAL_ATTACK_UNLOCK_COSTS,
    SPECIAL_ATTACK_LEVEL_UP_COSTS,
    HEAL_UNLOCK_COST,
    HEAL_LEVEL_UP_COSTS,
} from '@/constants/starShieldGame/shopConfig'
import { roleSelectionScreen } from '../roleSelectionScreen/styles'

const SPECIAL_ATTACK_LABELS: Record<string, string> = {
    spread_small: '小規模',
    spread_medium: '中規模',
    spread_large: '大規模',
}

export function StarShieldShop({ roomId, currentUserId }: { roomId: string; currentUserId: string }) {
    const [progress, setProgress] = useState<StarShieldProgress | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const styles = roleSelectionScreen()

    useEffect(() => {
        getMyStarShieldProgress()
            .then(setProgress)
            .catch(() => setError('データの取得に失敗しました'))
            .finally(() => setLoading(false))
    }, [])

    const refresh = () => {
        setLoading(true)
        getMyStarShieldProgress()
            .then(setProgress)
            .finally(() => setLoading(false))
    }

    const handlePurchase = async (
        fn: () => Promise<{ ok: boolean; error?: string }>,
        label: string
    ) => {
        setError(null)
        const result = await fn()
        if (result.ok) {
            refresh()
        } else {
            setError(result.error ?? `${label}に失敗しました`)
        }
    }

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
                <ProtectedStar />
                <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />
                <p className="relative z-10 text-white/60">読み込み中…</p>
            </div>
        )
    }

    const typingCount = progress?.totalTypingCount ?? 0
    const normalAttacks = progress?.normalAttacks ?? []
    const specialAttacks = progress?.specialAttacks ?? []
    const healLevel = progress?.healLevel ?? null

    const normalAttackIds: TechniqueId[] = ['red', 'blue', 'yellow_beam', 'purple', 'orange']
    const specialAttackIds = ['spread_small', 'spread_medium', 'spread_large'] as const

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />
            <DinosaurWithBalls size="w-20 h-20" />
            <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <h1 className={styles.sectionTitle()}>ショップ</h1>
                    <Link
                        href={`/game/${roomId}/star-shield`}
                        className="px-4 py-2 rounded-xl border border-brand-500/50 bg-brand-500/20 text-brand-300 text-sm hover:bg-brand-500/30 transition-colors"
                    >
                        ← もどる
                    </Link>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={styles.difficultyCard()}
                >
                    <p className={styles.difficultyCardTitle()}>所持 typing 数</p>
                    <p className="text-2xl font-bold text-brand-400">{typingCount.toLocaleString()}</p>
                </motion.div>

                {error && (
                    <div className="rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 text-sm">
                        {error}
                    </div>
                )}

                {/* Shooter: 通常攻撃 */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className={styles.difficultyCard()}
                >
                    <p className={styles.difficultyCardTitle()}>[通常攻撃]（Shooter）</p>
                    <div className="flex flex-col gap-2">
                        {normalAttackIds
                            .filter((id) => id !== 'red')
                            .map((techniqueId) => {
                                const tech = TECHNIQUES[techniqueId]
                                const cost = NORMAL_ATTACK_UNLOCK_COSTS[techniqueId] ?? 0
                                const owned = normalAttacks.some((a) => a.techniqueId === techniqueId)
                                return (
                                    <div
                                        key={techniqueId}
                                        className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: tech.color }}
                                            />
                                            <span className="text-white/90">{tech.label}</span>
                                            {owned && <span className="text-xs text-emerald-400">所持</span>}
                                        </div>
                                        {!owned && (
                                            <button
                                                onClick={() =>
                                                    handlePurchase(
                                                        () => purchaseNormalAttackUnlock(techniqueId),
                                                        tech.label
                                                    )
                                                }
                                                disabled={typingCount < cost}
                                                className="px-3 py-1.5 rounded-lg bg-brand-500/30 border border-brand-500/50 text-brand-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-500/40"
                                            >
                                                {cost.toLocaleString()} で購入
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                    </div>

                    {/* レベル上げ */}
                    <p className={styles.difficultyCardTitle() + ' mt-4'}>通常攻撃 レベル上げ</p>
                    <div className="flex flex-col gap-2">
                        {normalAttacks.map(({ techniqueId, level }) => {
                            if (level >= 5) return null
                            const tech = TECHNIQUES[techniqueId as TechniqueId]
                            const costs = NORMAL_ATTACK_LEVEL_UP_COSTS[techniqueId]
                            const nextLevel = (level + 1) as 2 | 3 | 4 | 5
                            const cost = costs?.[nextLevel] ?? 0
                            return (
                                <div
                                    key={`${techniqueId}-${level}`}
                                    className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
                                >
                                    <div className="flex items-center gap-2">
                                        <span
                                            className="w-3 h-3 rounded-full shrink-0"
                                            style={{ backgroundColor: tech?.color ?? '#666' }}
                                        />
                                        <span className="text-white/90">
                                            {tech?.label ?? techniqueId} lv{level} → lv{nextLevel}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() =>
                                            handlePurchase(
                                                () => purchaseNormalAttackLevelUp(techniqueId, nextLevel),
                                                'レベル上げ'
                                            )
                                        }
                                        disabled={typingCount < cost}
                                        className="px-3 py-1.5 rounded-lg bg-brand-500/30 border border-brand-500/50 text-brand-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-500/40"
                                    >
                                        {cost.toLocaleString()} で購入
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Shooter: 必殺技 */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={styles.difficultyCard()}
                >
                    <p className={styles.difficultyCardTitle()}>[必殺技]（Shooter）</p>
                    <div className="flex flex-col gap-2">
                        {specialAttackIds.map((id) => {
                            const cost = SPECIAL_ATTACK_UNLOCK_COSTS[id]
                            const owned = specialAttacks.some((a) => a.specialAttackId === id)
                            return (
                                <div
                                    key={id}
                                    className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
                                >
                                    <span className="text-white/90">{SPECIAL_ATTACK_LABELS[id] ?? id}</span>
                                    {owned && <span className="text-xs text-emerald-400">所持</span>}
                                    {!owned && (
                                        <button
                                            onClick={() =>
                                                handlePurchase(
                                                    () => purchaseSpecialAttackUnlock(id),
                                                    SPECIAL_ATTACK_LABELS[id]
                                                )
                                            }
                                            disabled={typingCount < cost}
                                            className="px-3 py-1.5 rounded-lg bg-brand-500/30 border border-brand-500/50 text-brand-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-500/40"
                                        >
                                            {cost.toLocaleString()} で購入
                                        </button>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* 必殺技 レベル上げ */}
                    <p className={styles.difficultyCardTitle() + ' mt-4'}>必殺技 レベル上げ</p>
                    <div className="flex flex-col gap-2">
                        {specialAttacks.map(({ specialAttackId, level }) => {
                            if (level >= 10) return null
                            const nextLevel = (level + 1) as 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                            const cost = SPECIAL_ATTACK_LEVEL_UP_COSTS[nextLevel] ?? 0
                            const label = SPECIAL_ATTACK_LABELS[specialAttackId] ?? specialAttackId
                            return (
                                <div
                                    key={`${specialAttackId}-${level}`}
                                    className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
                                >
                                    <span className="text-white/90">
                                        {label} lv{level} → lv{nextLevel}
                                    </span>
                                    <button
                                        onClick={() =>
                                            handlePurchase(
                                                () => purchaseSpecialAttackLevelUp(specialAttackId, nextLevel),
                                                '必殺技レベル上げ'
                                            )
                                        }
                                        disabled={typingCount < cost}
                                        className="px-3 py-1.5 rounded-lg bg-brand-500/30 border border-brand-500/50 text-brand-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-brand-500/40"
                                    >
                                        {cost.toLocaleString()} で購入
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Typist: ヒール */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className={styles.difficultyCard()}
                >
                    <p className={styles.difficultyCardTitle()}>[ヒール]（Typist）</p>
                    <div className="flex flex-col gap-2">
                        {!healLevel ? (
                            <div className="flex items-center justify-between gap-4 py-2">
                                <span className="text-white/90">ヒール解放</span>
                                <button
                                    onClick={() => handlePurchase(() => purchaseHealUnlock(), 'ヒール解放')}
                                    disabled={typingCount < HEAL_UNLOCK_COST}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/40"
                                >
                                    {HEAL_UNLOCK_COST.toLocaleString()} で購入
                                </button>
                            </div>
                        ) : healLevel < 6 ? (
                            (() => {
                                const nextLevel = (healLevel + 1) as 2 | 3 | 4 | 5 | 6
                                const cost = HEAL_LEVEL_UP_COSTS[nextLevel]
                                return (
                                    <div
                                        key={nextLevel}
                                        className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0"
                                    >
                                        <span className="text-white/90">
                                            ヒール lv{healLevel} → lv{nextLevel === 6 ? 'max' : nextLevel}
                                        </span>
                                        <button
                                            onClick={() =>
                                                handlePurchase(
                                                    () => purchaseHealLevelUp(nextLevel),
                                                    'ヒールレベル上げ'
                                                )
                                            }
                                            disabled={typingCount < cost}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-emerald-500/40"
                                        >
                                            {cost.toLocaleString()} で購入
                                        </button>
                                    </div>
                                )
                            })()
                        ) : (
                            <p className="text-white/50 text-sm">ヒール lv max 所持</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
