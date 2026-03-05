'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ProtectedStar } from '../playing/protectedStar'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import { ICONS } from '@/constants/starShieldGame/constants'
import {
    getMyStarShieldProgress,
    updateLoadout,
    purchaseNormalAttackUnlock,
    purchaseNormalAttackLevelUp,
    purchaseSpecialAttackUnlock,
    purchaseSpecialAttackLevelUp,
    purchaseHealUnlock,
    purchaseHealLevelUp,
    purchaseStarHpLevelUp,
} from '@/server/actions/game'
import type { StarShieldProgress } from '@/server/actions/game/starShieldProgressionActions'
import {
    NORMAL_ATTACK_UNLOCK_COSTS,
    NORMAL_ATTACK_LEVEL_UP_COSTS,
    SPECIAL_ATTACK_UNLOCK_COSTS,
    SPECIAL_ATTACK_LEVEL_UP_COSTS,
    HEAL_UNLOCK_COST,
    HEAL_LEVEL_UP_COSTS,
    STAR_HP_LEVEL_UP_COSTS,
    LEVEL_HEAL_RECOVERY,
} from '@/constants/starShieldGame/shopConfig'
import {
    LEVEL_STAR_HP,
    LEVEL_BULLET_COUNT,
    LEVEL_SPREAD_DEG,
    SPECIAL_ATTACK_LEVEL_PARAMS,
    type SpecialAttackLevel,
} from '@/constants/starShieldGame/gameConfig'
import { cn } from '@/lib/utils'
import { getAvailableNormalAttacks, getAvailableSpecialAttacks } from '@/utils/starShieldGame'
import type { OwnedSkills } from '@/utils/starShieldGame'

// ============================================================
// 型定義
// ============================================================
type TabType = 'attack' | 'defence'

type PreviewData =
    | { kind: 'normalAttack'; techniqueId: TechniqueId; currentLevel: number; owned: boolean }
    | { kind: 'specialAttack'; id: string; currentLevel: number; owned: boolean }
    | { kind: 'heal'; currentLevel: number | null }
    | { kind: 'starHp'; currentLevel: number }

// ============================================================
// 定数
// ============================================================
const SPECIAL_LABELS: Record<string, string> = {
    spread: '広範囲弾（スプレッド）',
    all_destruction: '全破壊',
}

const NORMAL_ATTACK_IDS: TechniqueId[] = ['red', 'blue', 'yellow_beam', 'purple', 'orange']
const SPECIAL_ATTACK_IDS = ['spread'] as const

// ============================================================
// Main Component
// ============================================================
export function StarShieldShop({ roomId, currentUserId }: { roomId: string; currentUserId: string }) {
    const [progress, setProgress] = useState<StarShieldProgress | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<TabType>('attack')
    const [preview, setPreview] = useState<PreviewData | null>(null)

    useEffect(() => {
        getMyStarShieldProgress()
            .then(setProgress)
            .catch(() => setError('データの取得に失敗しました'))
            .finally(() => setLoading(false))
    }, [])

    const refresh = useCallback(() => {
        getMyStarShieldProgress()
            .then(setProgress)
            .catch(() => { })
    }, [])

    const handlePurchase = useCallback(
        async (fn: () => Promise<{ ok: boolean; error?: string }>, label: string) => {
            setError(null)
            const result = await fn()
            if (result.ok) refresh()
            else setError(result.error ?? `${label}に失敗しました`)
        },
        [refresh]
    )

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
                <ProtectedStar />
                <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />
                <p className="relative z-10 text-white/60 [font-family:var(--font-dot-gothic-16)]">読み込み中…</p>
            </div>
        )
    }

    const typingCount = progress?.totalTypingCount ?? 0
    const normalAttacks = progress?.normalAttacks ?? []
    const specialAttacks = progress?.specialAttacks ?? []
    const healLevel = progress?.healLevel ?? null
    const starHpLevel = progress?.starHpLevel ?? 1

    const ownedSkills: OwnedSkills = { normalAttacks, specialAttacks, healLevel }
    const availableNormal = getAvailableNormalAttacks(ownedSkills)
    const availableSpecial = getAvailableSpecialAttacks(ownedSkills)
    const selNormal = progress?.selectedNormalAttackId ?? 'red'
    const selSpecial = progress?.selectedSpecialAttackId ?? null
    const selHeal = progress?.selectedHealLevel ?? null

    const handleLoadoutUpdate = async (updates: Parameters<typeof updateLoadout>[0]) => {
        setError(null)
        const result = await updateLoadout(updates)
        if (result.ok) refresh()
        else setError(result.error ?? '設定に失敗しました')
    }

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center">
            <ProtectedStar />
            <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-4 pt-8 pb-20 flex flex-col gap-5">
                {/* ヘッダー */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-black [font-family:var(--font-dot-gothic-16)] bg-gradient-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            スキル設定
                        </h1>
                        <p className="text-white/35 text-xs mt-0.5 [font-family:var(--font-dot-gothic-16)]">
                            スキルを購入してロードアウトを整えよう
                        </p>
                    </div>
                    <Link
                        href={`/game/${roomId}/star-shield`}
                        className="px-4 py-2 rounded-xl border border-brand-500/50 bg-brand-500/20 text-brand-300 text-sm hover:bg-brand-500/30 transition-colors [font-family:var(--font-dot-gothic-16)]"
                    >
                        ← もどる
                    </Link>
                </motion.div>

                {/* 所持 typing 数 */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-2xl px-5 py-4 bg-white/[0.03] border border-white/[0.08] flex items-center justify-between"
                >
                    <div>
                        <p className="text-[11px] [font-family:var(--font-cherry-bomb-one)] text-[rgba(129,140,248,0.6)] mb-1">
                            所持 typing 数
                        </p>
                        <p className="text-3xl font-bold text-brand-400 [font-family:var(--font-cherry-bomb-one)] tabular-nums">
                            {typingCount.toLocaleString()}
                        </p>
                    </div>
                    <Image src={ICONS.TYPIST} alt="Typing" width={36} height={36} className="opacity-40 select-none" />
                </motion.div>

                {error && (
                    <div className="rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 text-sm">
                        {error}
                    </div>
                )}

                {/* ロードアウト設定（常時表示） */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-5 bg-white/[0.03] border border-white/[0.08] flex flex-col gap-5"
                >
                    <p className="text-sm [font-family:var(--font-dot-gothic-16)] text-white/80 flex items-center gap-2">
                        🎮 ロードアウト設定
                        <span className="text-[10px] text-white/30 font-normal [font-family:var(--font-dot-gothic-16)]">
                            ゲームで使用するスキルを選択
                        </span>
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ===================== ATTACK COLUMN ===================== */}
                        <div className="flex flex-col gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none">
                                <Image src={ICONS.SHOOTER} alt="" width={80} height={80} />
                            </div>
                            <h3 className="text-indigo-400 text-xs font-bold flex items-center gap-2 [font-family:var(--font-dot-gothic-16)] mb-1">
                                <Image src={ICONS.SHOOTER} alt="Shooter" width={16} height={16} className="opacity-80" />
                                ATTACK（Shooter）
                            </h3>

                            {/* 通常攻撃 */}
                            <div>
                                <p className="text-[10px] text-indigo-400/50 [font-family:var(--font-dot-gothic-16)] mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
                                    通常攻撃
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availableNormal.map(({ techniqueId, level }) => {
                                        const tech = TECHNIQUES[techniqueId]
                                        const isActive = selNormal === techniqueId
                                        return (
                                            <button
                                                key={techniqueId}
                                                onClick={() => handleLoadoutUpdate({ selectedNormalAttackId: techniqueId })}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-xl text-xs border flex items-center gap-1.5 transition-all',
                                                    isActive
                                                        ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                                                        : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                                                )}
                                            >
                                                {isActive && <span className="text-indigo-400 font-bold">✓</span>}
                                                <span
                                                    className="w-2 h-2 rounded-full shrink-0"
                                                    style={{ backgroundColor: tech.color }}
                                                />
                                                {tech.label}
                                                <span className="text-[10px] opacity-50">lv{level}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                                {/* アニメーションプレビュー */}
                                {(() => {
                                    const selAttack = availableNormal.find((a) => a.techniqueId === selNormal)
                                    if (!selAttack) return null
                                    return (
                                        <LoadoutAnimPreview
                                            techniqueId={selAttack.techniqueId}
                                            level={selAttack.level}
                                        />
                                    )
                                })()}
                            </div>

                            {/* 必殺技 */}
                            <div>
                                <p className="text-[10px] text-indigo-400/50 [font-family:var(--font-dot-gothic-16)] mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
                                    必殺技
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {availableSpecial.map(({ specialAttackId, level }) => {
                                        const isActive = selSpecial === specialAttackId
                                        return (
                                            <button
                                                key={specialAttackId}
                                                onClick={() => handleLoadoutUpdate({ selectedSpecialAttackId: specialAttackId })}
                                                className={cn(
                                                    'px-3 py-1.5 rounded-xl text-xs border flex items-center gap-1.5 transition-all',
                                                    isActive
                                                        ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                                                        : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                                                )}
                                            >
                                                {isActive && <span className="text-indigo-400 font-bold">✓</span>}
                                                {SPECIAL_LABELS[specialAttackId] ?? specialAttackId}
                                                <span className="text-[10px] opacity-50">lv{level}</span>
                                            </button>
                                        )
                                    })}
                                    {availableSpecial.length === 0 && (
                                        <span className="text-white/30 text-xs [font-family:var(--font-dot-gothic-16)]">未所持</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* ===================== DEFENCE COLUMN ===================== */}
                        <div className="flex flex-col gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-[0.03] pointer-events-none">
                                <Image src={ICONS.TYPIST} alt="" width={80} height={80} />
                            </div>
                            <h3 className="text-emerald-400 text-xs font-bold flex items-center gap-2 [font-family:var(--font-dot-gothic-16)] mb-1">
                                <Image src={ICONS.TYPIST} alt="Typist" width={16} height={16} className="opacity-80" />
                                DEFENCE（Typist）
                            </h3>

                            {/* ヒール */}
                            <div>
                                <p className="text-[10px] text-emerald-400/50 [font-family:var(--font-dot-gothic-16)] mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 opacity-50" />
                                    ヒール
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleLoadoutUpdate({ selectedHealLevel: null })}
                                        className={cn(
                                            'px-3 py-1.5 rounded-xl text-xs border transition-all',
                                            selHeal === null
                                                ? 'border-white/30 bg-white/10 text-white/70'
                                                : 'bg-white/[0.02] border-white/10 text-white/30 hover:border-white/20 hover:text-white/50'
                                        )}
                                    >
                                        ✕ 使わない
                                    </button>
                                    {healLevel !== null &&
                                        [1, 2, 3, 4, 5, 6]
                                            .filter((lv) => lv <= healLevel)
                                            .map((lv) => {
                                                const isActive = selHeal === lv
                                                return (
                                                    <button
                                                        key={lv}
                                                        onClick={() => handleLoadoutUpdate({ selectedHealLevel: lv })}
                                                        className={cn(
                                                            'px-3 py-1.5 rounded-xl text-xs border transition-all',
                                                            isActive
                                                                ? 'border-emerald-500/60 bg-emerald-500/20 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                                                                : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/25 hover:text-white/70'
                                                        )}
                                                    >
                                                        {isActive && <span className="text-emerald-400 font-bold mr-1">✓</span>}
                                                        lv{lv === 6 ? 'max' : lv}
                                                    </button>
                                                )
                                            })}
                                    {healLevel === null && (
                                        <span className="text-white/30 text-xs [font-family:var(--font-dot-gothic-16)]">未所持</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ショップ：ATTACK / DEFENCE タブ */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    {/* タブスイッチャー */}
                    <div className="flex rounded-2xl overflow-hidden border border-white/[0.08] mb-4">
                        <button
                            onClick={() => setActiveTab('attack')}
                            className={cn(
                                'flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all duration-300',
                                activeTab === 'attack'
                                    ? 'bg-indigo-700/70 text-indigo-100 shadow-[inset_0_0_30px_rgba(99,102,241,0.2)]'
                                    : 'bg-white/[0.02] text-white/35 hover:text-white/55 hover:bg-white/[0.04]'
                            )}
                        >
                            <span className="text-2xl">⚔️</span>
                            <span className="text-sm font-bold [font-family:var(--font-cherry-bomb-one)]">ATTACK</span>
                            <span className="text-[10px] opacity-60 [font-family:var(--font-dot-gothic-16)]">Shooter・攻撃担当</span>
                        </button>
                        <div className="w-px bg-white/[0.08]" />
                        <button
                            onClick={() => setActiveTab('defence')}
                            className={cn(
                                'flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all duration-300',
                                activeTab === 'defence'
                                    ? 'bg-emerald-800/70 text-emerald-100 shadow-[inset_0_0_30px_rgba(16,185,129,0.2)]'
                                    : 'bg-white/[0.02] text-white/35 hover:text-white/55 hover:bg-white/[0.04]'
                            )}
                        >
                            <span className="text-2xl">🛡️</span>
                            <span className="text-sm font-bold [font-family:var(--font-cherry-bomb-one)]">DEFENCE</span>
                            <span className="text-[10px] opacity-60 [font-family:var(--font-dot-gothic-16)]">Typist・守護担当</span>
                        </button>
                    </div>

                    {/* タブコンテンツ */}
                    <AnimatePresence mode="wait">
                        {activeTab === 'attack' ? (
                            <motion.div
                                key="attack"
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 12 }}
                                transition={{ duration: 0.18 }}
                                className="flex flex-col gap-4"
                            >
                                {/* 通常攻撃 */}
                                <ShopCard title="通常攻撃" jurisdiction="attack">
                                    {NORMAL_ATTACK_IDS.filter((id) => id !== 'red').map((techniqueId) => {
                                        const tech = TECHNIQUES[techniqueId]
                                        const ownedAttack = normalAttacks.find((a) => a.techniqueId === techniqueId)
                                        const currentLevel = ownedAttack ? ownedAttack.level : 0
                                        const maxLevel = 5
                                        const isMaxed = currentLevel >= maxLevel
                                        const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4 | 5
                                        const cost = currentLevel === 0
                                            ? NORMAL_ATTACK_UNLOCK_COSTS[techniqueId] ?? 0
                                            : NORMAL_ATTACK_LEVEL_UP_COSTS[techniqueId]?.[nextLevel as 2 | 3 | 4 | 5] ?? 0

                                        return (
                                            <SkillRow
                                                key={techniqueId}
                                                label={
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className="w-3 h-3 rounded-full shrink-0"
                                                            style={{ backgroundColor: tech.color }}
                                                        />
                                                        <span className="[font-family:var(--font-dot-gothic-16)] font-bold">{tech.label}</span>
                                                    </div>
                                                }
                                                detail={getTechEffectLabel(techniqueId)}
                                                currentLevel={currentLevel}
                                                maxLevel={maxLevel}
                                                cost={cost}
                                                typingCount={typingCount}
                                                onPurchase={
                                                    isMaxed
                                                        ? undefined
                                                        : () =>
                                                            handlePurchase(
                                                                () =>
                                                                    currentLevel === 0
                                                                        ? purchaseNormalAttackUnlock(techniqueId)
                                                                        : purchaseNormalAttackLevelUp(
                                                                            techniqueId,
                                                                            nextLevel as 2 | 3 | 4 | 5
                                                                        ),
                                                                currentLevel === 0 ? tech.label : '通常攻撃レベル上げ'
                                                            )
                                                }
                                                onPreview={() =>
                                                    setPreview({
                                                        kind: 'normalAttack',
                                                        techniqueId,
                                                        currentLevel,
                                                        owned: currentLevel > 0,
                                                    })
                                                }
                                                color="indigo"
                                            />
                                        )
                                    })}
                                </ShopCard>

                                {/* 必殺技 */}
                                <ShopCard title="必殺技" jurisdiction="attack">
                                    {SPECIAL_ATTACK_IDS.map((id) => {
                                        const ownedSA = specialAttacks.find((a) => a.specialAttackId === id)
                                        const currentLevel = ownedSA ? ownedSA.level : 0
                                        const maxLevel = 10
                                        const isMaxed = currentLevel >= maxLevel
                                        const nextLevel = (currentLevel + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
                                        const cost = currentLevel === 0
                                            ? SPECIAL_ATTACK_UNLOCK_COSTS[id] ?? 0
                                            : SPECIAL_ATTACK_LEVEL_UP_COSTS[nextLevel as Exclude<typeof nextLevel, 1>] ?? 0

                                        return (
                                            <SkillRow
                                                key={id}
                                                label={
                                                    <span className="[font-family:var(--font-dot-gothic-16)] font-bold">
                                                        {SPECIAL_LABELS[id] ?? id}
                                                    </span>
                                                }
                                                detail="単語完了時に扇状に弾を散布"
                                                currentLevel={currentLevel}
                                                maxLevel={maxLevel}
                                                cost={cost}
                                                typingCount={typingCount}
                                                onPurchase={
                                                    isMaxed
                                                        ? undefined
                                                        : () =>
                                                            handlePurchase(
                                                                () =>
                                                                    currentLevel === 0
                                                                        ? purchaseSpecialAttackUnlock(id)
                                                                        : purchaseSpecialAttackLevelUp(
                                                                            id,
                                                                            nextLevel as Exclude<typeof nextLevel, 1>
                                                                        ),
                                                                currentLevel === 0 ? SPECIAL_LABELS[id] : '必殺技レベル上げ'
                                                            )
                                                }
                                                onPreview={() =>
                                                    setPreview({
                                                        kind: 'specialAttack',
                                                        id,
                                                        currentLevel,
                                                        owned: currentLevel > 0,
                                                    })
                                                }
                                                color="indigo"
                                            />
                                        )
                                    })}
                                </ShopCard>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="defence"
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.18 }}
                                className="flex flex-col gap-4"
                            >
                                {/* 星のHP */}
                                <ShopCard title="星のHP強化" jurisdiction="defence">
                                    {/* 現在の HP バー */}
                                    <div className="flex items-end gap-4 mb-1">
                                        <div>
                                            <p className="text-[10px] text-white/30 mb-0.5 [font-family:var(--font-dot-gothic-16)]">
                                                現在のHP上限
                                            </p>
                                            <p className="text-3xl font-bold text-emerald-400 [font-family:var(--font-dot-gothic-16)] leading-none">
                                                {LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]}
                                            </p>
                                        </div>
                                        <div className="flex-1 pb-1">
                                            <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-700"
                                                    style={{ width: `${(starHpLevel / 5) * 100}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-white/25 mt-0.5 [font-family:var(--font-dot-gothic-16)]">
                                                Lv {starHpLevel} / 5
                                            </p>
                                        </div>
                                    </div>

                                    {starHpLevel < 5 ? (
                                        (() => {
                                            const nextLevel = (starHpLevel + 1) as 2 | 3 | 4 | 5
                                            const cost = STAR_HP_LEVEL_UP_COSTS[nextLevel]
                                            return (
                                                <SkillRow
                                                    label={
                                                        <span>
                                                            HP {LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]} →{' '}
                                                            {LEVEL_STAR_HP[nextLevel]}（lv{starHpLevel} → lv
                                                            {nextLevel}）
                                                        </span>
                                                    }
                                                    cost={cost}
                                                    typingCount={typingCount}
                                                    onPurchase={() =>
                                                        handlePurchase(
                                                            () => purchaseStarHpLevelUp(nextLevel),
                                                            '星のHPレベル上げ'
                                                        )
                                                    }
                                                    onPreview={() =>
                                                        setPreview({
                                                            kind: 'starHp',
                                                            currentLevel: starHpLevel,
                                                        })
                                                    }
                                                    color="emerald"
                                                />
                                            )
                                        })()
                                    ) : (
                                        <MaxedMessage>星のHP MAX レベル到達 🏆</MaxedMessage>
                                    )}
                                </ShopCard>

                                {/* ヒール */}
                                <ShopCard title="ヒール" jurisdiction="defence">
                                    {!healLevel ? (
                                        <>
                                            <p className="text-white/40 text-xs mb-3 [font-family:var(--font-dot-gothic-16)]">
                                                単語を打ち切ったとき、星のHPを回復します
                                            </p>
                                            <SkillRow
                                                label={<span>ヒール解放</span>}
                                                cost={HEAL_UNLOCK_COST}
                                                typingCount={typingCount}
                                                onPurchase={() =>
                                                    handlePurchase(() => purchaseHealUnlock(), 'ヒール解放')
                                                }
                                                onPreview={() => setPreview({ kind: 'heal', currentLevel: null })}
                                                color="emerald"
                                            />
                                        </>
                                    ) : (
                                        <>
                                            {/* 現在の回復量バー */}
                                            <div className="flex items-end gap-4 mb-1">
                                                <div>
                                                    <p className="text-[10px] text-white/30 mb-0.5 [font-family:var(--font-dot-gothic-16)]">
                                                        現在の回復量
                                                    </p>
                                                    <p className="text-xl font-bold text-emerald-400 [font-family:var(--font-dot-gothic-16)] leading-none">
                                                        {healLevel >= 5 ? '全回復' : `+${LEVEL_HEAL_RECOVERY[healLevel as 1 | 2 | 3 | 4 | 5 | 6]} HP`}
                                                    </p>
                                                </div>
                                                <div className="flex-1 pb-1">
                                                    <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-700"
                                                            style={{ width: `${(healLevel / 6) * 100}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[10px] text-white/25 mt-0.5 [font-family:var(--font-dot-gothic-16)]">
                                                        Lv {healLevel === 6 ? 'max' : healLevel} / max
                                                    </p>
                                                </div>
                                            </div>

                                            {healLevel < 6 ? (
                                                (() => {
                                                    const nextLevel = (healLevel + 1) as 2 | 3 | 4 | 5 | 6
                                                    const cost = HEAL_LEVEL_UP_COSTS[nextLevel]
                                                    return (
                                                        <SkillRow
                                                            label={
                                                                <span>
                                                                    ヒール lv{healLevel} → lv
                                                                    {nextLevel === 6 ? 'max' : nextLevel}
                                                                </span>
                                                            }
                                                            cost={cost}
                                                            typingCount={typingCount}
                                                            onPurchase={() =>
                                                                handlePurchase(
                                                                    () => purchaseHealLevelUp(nextLevel),
                                                                    'ヒールレベル上げ'
                                                                )
                                                            }
                                                            onPreview={() =>
                                                                setPreview({
                                                                    kind: 'heal',
                                                                    currentLevel: healLevel,
                                                                })
                                                            }
                                                            color="emerald"
                                                        />
                                                    )
                                                })()
                                            ) : (
                                                <MaxedMessage>ヒール MAX レベル到達 🏆</MaxedMessage>
                                            )}
                                        </>
                                    )}
                                </ShopCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* プレビューモーダル */}
            <AnimatePresence>
                {preview && (
                    <SkillPreviewModal
                        preview={preview}
                        normalAttacks={normalAttacks}
                        starHpLevel={starHpLevel}
                        onClose={() => setPreview(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// ============================================================
// ShopCard
// ============================================================
function ShopCard({
    title,
    jurisdiction,
    children,
}: {
    title: string
    jurisdiction: 'attack' | 'defence'
    children: React.ReactNode
}) {
    const isAttack = jurisdiction === 'attack'
    return (
        <div
            className={cn(
                'rounded-2xl p-5 bg-white/[0.02] border flex flex-col gap-3',
                isAttack ? 'border-indigo-500/20' : 'border-emerald-500/20'
            )}
        >
            <div className="flex items-center justify-between">
                <p
                    className={cn(
                        'text-[13px] font-bold tracking-wider [font-family:var(--font-dot-gothic-16)]',
                        isAttack ? 'text-indigo-400' : 'text-emerald-400'
                    )}
                >
                    {title}
                </p>
                <span
                    className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border tracking-wide [font-family:var(--font-dot-gothic-16)]',
                        isAttack
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    )}
                >
                    {isAttack ? '⚔️ Shooter' : '🛡️ Typist'}
                </span>
            </div>
            {children}
        </div>
    )
}

// ============================================================
// SkillRow
// ============================================================
function SkillRow({
    label,
    detail,
    currentLevel,
    maxLevel,
    cost,
    typingCount,
    onPurchase,
    onPreview,
    color,
}: {
    label: React.ReactNode
    detail?: string
    currentLevel?: number
    maxLevel?: number
    cost?: number
    typingCount?: number
    onPurchase?: () => void
    onPreview?: () => void
    color: 'indigo' | 'emerald'
}) {
    const canAfford = cost !== undefined && typingCount !== undefined && typingCount >= cost
    const btnCls =
        color === 'indigo'
            ? 'bg-indigo-500/25 border-indigo-500/50 text-indigo-300 hover:bg-indigo-500/35'
            : 'bg-emerald-500/25 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/35'

    return (
        <div className="flex items-center justify-between gap-3 py-2.5 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] -mx-2 px-2 rounded-xl transition-colors">
            <div className="flex items-center gap-2 min-w-0 flex-1">
                {onPreview && (
                    <button
                        onClick={onPreview}
                        className="shrink-0 text-[11px] px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-white/40 hover:text-white/70 hover:border-white/20 transition-colors"
                        title="プレビュー"
                    >
                        👁️
                    </button>
                )}
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-white/85 text-sm">{label}</span>
                    {detail && (
                        <span className="text-white/30 text-[10px] [font-family:var(--font-dot-gothic-16)]">{detail}</span>
                    )}
                    {currentLevel !== undefined && maxLevel !== undefined && (
                        <div className="w-24 md:w-32 mt-1.5 relative flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-700', color === 'indigo' ? 'bg-indigo-400' : 'bg-emerald-400')}
                                    style={{ width: `${(currentLevel / maxLevel) * 100}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-white/40 [font-family:var(--font-dot-gothic-16)] shrink-0">
                                {currentLevel}/{maxLevel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {onPurchase && cost !== undefined && (
                <button
                    onClick={onPurchase}
                    disabled={!canAfford}
                    className={cn(
                        'px-3 py-1.5 rounded-lg border text-xs shrink-0 transition-colors cursor-pointer',
                        btnCls,
                        !canAfford && 'opacity-30 cursor-not-allowed'
                    )}
                >
                    {cost.toLocaleString()}
                </button>
            )}
            {!onPurchase && currentLevel === maxLevel && (
                <span className="text-[10px] text-amber-300 shrink-0 [font-family:var(--font-dot-gothic-16)] border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded">MAX</span>
            )}
        </div>
    )
}

// ============================================================
// MaxedMessage
// ============================================================
function MaxedMessage({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 py-2.5">
            <span className="text-amber-400 text-base">🏆</span>
            <span className="text-amber-400/80 text-sm [font-family:var(--font-dot-gothic-16)]">{children}</span>
        </div>
    )
}

// ============================================================
// getTechEffectLabel
// ============================================================
function getTechEffectLabel(techniqueId: TechniqueId): string {
    const effects: Partial<Record<TechniqueId, string>> = {
        blue: 'スロー効果',
        yellow_beam: 'ビーム状（30連射）',
        purple: '貫通効果',
        orange: 'チェーン攻撃',
    }
    return effects[techniqueId] ?? ''
}

// ============================================================
// SkillPreviewModal
// ============================================================
function SkillPreviewModal({
    preview,
    normalAttacks,
    starHpLevel,
    onClose,
}: {
    preview: PreviewData
    normalAttacks: { techniqueId: string; level: number }[]
    starHpLevel: number
    onClose: () => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <motion.div
                initial={{ y: 72, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 72, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className="relative w-full max-w-sm rounded-3xl bg-[#14142a] border border-white/[0.1] p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/10 transition-all text-sm"
                >
                    ✕
                </button>
                <PreviewContent preview={preview} normalAttacks={normalAttacks} starHpLevel={starHpLevel} />
            </motion.div>
        </motion.div>
    )
}

// ============================================================
// PreviewContent
// ============================================================
function PreviewContent({
    preview,
    normalAttacks,
    starHpLevel,
}: {
    preview: PreviewData
    normalAttacks: { techniqueId: string; level: number }[]
    starHpLevel: number
}) {
    if (preview.kind === 'normalAttack') {
        const tech = TECHNIQUES[preview.techniqueId]
        const ownedAttack = normalAttacks.find((a) => a.techniqueId === preview.techniqueId)
        const level = (ownedAttack?.level ?? 1) as 1 | 2 | 3 | 4 | 5

        const specialEffects: Partial<Record<TechniqueId, { label: string; desc: string }>> = {
            blue: { label: 'スロー', desc: '命中した隕石の速度を下げる' },
            yellow_beam: { label: 'ビーム', desc: '30発が前方に連続して飛ぶ' },
            purple: { label: '貫通', desc: '隕石を貫通し複数を同時に攻撃' },
            orange: { label: 'チェーン', desc: '周囲の隕石に連鎖してダメージ' },
        }
        const fx = specialEffects[preview.techniqueId]

        return (
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: `${tech.color}22`,
                            border: `2px solid ${tech.color}`,
                            boxShadow: `0 0 24px ${tech.color}55`,
                        }}
                    >
                        <div
                            className="w-7 h-7 rounded-full"
                            style={{ backgroundColor: tech.color, boxShadow: `0 0 10px ${tech.color}` }}
                        />
                    </div>
                    <div>
                        <p className="text-white font-bold text-base [font-family:var(--font-dot-gothic-16)]">
                            {tech.label}
                        </p>
                        <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">
                            通常攻撃 {preview.owned ? `Lv ${level}` : '未所持'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <StatRow label="ダメージ / 発" value={`${tech.damage}`} color="text-orange-400" />
                    <StatRow label="発射タイミング" value="1文字打鍵ごと" color="text-white/55" />
                    {fx && (
                        <div className="mt-1 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
                            <p className="text-indigo-300 text-xs font-bold mb-1 [font-family:var(--font-dot-gothic-16)]">
                                ⚡ 特殊効果：{fx.label}
                            </p>
                            <p className="text-white/45 text-[11px] [font-family:var(--font-dot-gothic-16)]">
                                {fx.desc}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    if (preview.kind === 'specialAttack') {
        const level = (preview.currentLevel || 1) as SpecialAttackLevel
        const params = SPECIAL_ATTACK_LEVEL_PARAMS[level]
        const totalBullets = params.waveCount * params.bulletsPerWave

        return (
            <div>
                <div className="flex items-center gap-3 mb-5">
                    {/* spread ビジュアル（扇状） */}
                    <div className="w-14 h-14 relative flex items-center justify-center shrink-0">
                        {Array.from({ length: 9 }).map((_, i) => {
                            const angle = (i / 8) * params.spreadDeg - params.spreadDeg / 2
                            const rad = ((angle - 90) * Math.PI) / 180
                            const r = 22
                            const x = Math.cos(rad) * r
                            const y = Math.sin(rad) * r
                            return (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-brand-400"
                                    style={{
                                        transform: `translate(${x}px, ${y}px)`,
                                        opacity: 0.4 + (i / 8) * 0.6,
                                        boxShadow: '0 0 4px rgba(129,140,248,0.6)',
                                    }}
                                />
                            )
                        })}
                    </div>
                    <div>
                        <p className="text-white font-bold text-base [font-family:var(--font-dot-gothic-16)]">
                            {SPECIAL_LABELS[preview.id] ?? preview.id}
                        </p>
                        <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">
                            必殺技 {preview.owned ? `Lv ${level}` : '未所持'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <StatRow label="総弾数" value={`${totalBullets} 発`} color="text-orange-400" />
                    <StatRow label="広がり角度" value={`${params.spreadDeg}°`} color="text-indigo-300" />
                    {params.waveCount > 1 && (
                        <StatRow label="ウェーブ数" value={`${params.waveCount} 波`} color="text-purple-300" />
                    )}
                    <StatRow label="発射タイミング" value="単語を打ち切ったとき" color="text-white/55" />
                </div>
            </div>
        )
    }

    if (preview.kind === 'heal') {
        const level = preview.currentLevel
        const healVal = level ? LEVEL_HEAL_RECOVERY[level as 1 | 2 | 3 | 4 | 5 | 6] : 0
        const isFullRestore = level !== null && level >= 5
        const barWidth = isFullRestore ? 100 : level ? healVal * 100 : 0

        return (
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-14 h-14 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center text-2xl shrink-0"
                        style={{ boxShadow: '0 0 24px rgba(16,185,129,0.35)' }}
                    >
                        💚
                    </div>
                    <div>
                        <p className="text-white font-bold text-base [font-family:var(--font-dot-gothic-16)]">ヒール</p>
                        <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">
                            {level ? `Lv ${level === 6 ? 'max' : level}` : '未所持'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">回復量</p>
                            <p className="text-emerald-400 text-sm font-bold [font-family:var(--font-dot-gothic-16)]">
                                {level === null ? '---' : isFullRestore ? '全回復' : `+${healVal} HP`}
                            </p>
                        </div>
                        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-emerald-700 to-emerald-400 transition-all duration-700"
                                style={{ width: `${barWidth}%` }}
                            />
                        </div>
                    </div>
                    {level === 6 && (
                        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3">
                            <p className="text-red-300 text-xs font-bold mb-1 [font-family:var(--font-dot-gothic-16)]">
                                ⚡ all_destruction 付与
                            </p>
                            <p className="text-white/40 text-[11px] [font-family:var(--font-dot-gothic-16)]">
                                全回復＋全隕石を一撃で破壊
                            </p>
                        </div>
                    )}
                    <StatRow label="発動タイミング" value="単語を打ち切ったとき" color="text-white/55" />
                </div>
            </div>
        )
    }

    if (preview.kind === 'starHp') {
        const level = preview.currentLevel as 1 | 2 | 3 | 4 | 5
        const hp = LEVEL_STAR_HP[level]
        const nextHp = level < 5 ? LEVEL_STAR_HP[(level + 1) as 2 | 3 | 4 | 5] : null

        return (
            <div>
                <div className="flex items-center gap-3 mb-5">
                    <div
                        className="w-14 h-14 rounded-full bg-yellow-500/20 border-2 border-yellow-500/60 flex items-center justify-center text-2xl shrink-0"
                        style={{ boxShadow: '0 0 24px rgba(234,179,8,0.35)' }}
                    >
                        ⭐
                    </div>
                    <div>
                        <p className="text-white font-bold text-base [font-family:var(--font-dot-gothic-16)]">
                            星のHP
                        </p>
                        <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">Lv {level}</p>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">HP上限</p>
                            <p className="text-yellow-400 text-2xl font-bold [font-family:var(--font-cherry-bomb-one)] leading-none">
                                {hp}
                            </p>
                        </div>
                        <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-yellow-700 to-yellow-400 transition-all duration-700"
                                style={{ width: `${(level / 5) * 100}%` }}
                            />
                        </div>
                        <p className="text-white/25 text-[10px] mt-1 [font-family:var(--font-dot-gothic-16)]">
                            Lv {level} / 5
                        </p>
                    </div>
                    {nextHp && (
                        <p className="text-white/40 text-xs [font-family:var(--font-dot-gothic-16)]">
                            次のレベルで HP {nextHp} に強化
                        </p>
                    )}
                    <StatRow label="適用ロール" value="Typist（守護担当）" color="text-white/55" />
                </div>
            </div>
        )
    }

    return null
}

// ============================================================
// StatRow
// ============================================================
function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div className="flex items-center justify-between py-1.5 border-b border-white/[0.05] last:border-0">
            <span className="text-white/35 text-xs [font-family:var(--font-dot-gothic-16)]">{label}</span>
            <span className={cn('text-xs font-bold', color)}>{value}</span>
        </div>
    )
}

// ============================================================
// LoadoutAnimPreview
// Canvas requestAnimationFrame による恐竜射撃アニメーション
// ============================================================
type Bullet = {
    x: number
    y: number
    vx: number
    vy: number
    color: string
    alpha: number
    radius: number
}

function LoadoutAnimPreview({ techniqueId, level }: { techniqueId: TechniqueId; level: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const tech = TECHNIQUES[techniqueId]

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctxOrNull = canvas.getContext('2d')
        if (!ctxOrNull) return
        const c: CanvasRenderingContext2D = ctxOrNull

        const lvl = Math.max(1, Math.min(5, level)) as 1 | 2 | 3 | 4 | 5
        const bulletCount = LEVEL_BULLET_COUNT[lvl]
        const spreadDeg = LEVEL_SPREAD_DEG[lvl]

        const DINO_X = 18
        const H = canvas.height
        const W = canvas.width
        const ORIGIN_Y = H / 2 - 2
        const FIRE_INTERVAL = 1400

        const bullets: Bullet[] = []
        let lastFire = -FIRE_INTERVAL
        let animId: number

        function fire() {
            // yellow_beam：細かく連続発射
            if (techniqueId === 'yellow_beam') {
                const count = 12
                for (let i = 0; i < count; i++) {
                    const delay = i * 40
                    setTimeout(() => {
                        bullets.push({
                            x: DINO_X + 18,
                            y: ORIGIN_Y + (Math.random() - 0.5) * 3,
                            vx: 4.4,
                            vy: 0,
                            color: tech.color,
                            alpha: 0.9,
                            radius: 1.8,
                        })
                    }, delay)
                }
                return
            }

            const displayCount = Math.min(bulletCount, 18)

            if (displayCount === 1) {
                bullets.push({
                    x: DINO_X + 18,
                    y: ORIGIN_Y,
                    vx: 3.8,
                    vy: 0,
                    color: tech.color,
                    alpha: 1,
                    radius: techniqueId === 'purple' ? 5.5 : 3.5,
                })
            } else {
                for (let i = 0; i < displayCount; i++) {
                    const angle = ((i / (displayCount - 1)) - 0.5) * spreadDeg
                    const rad = (angle * Math.PI) / 180
                    const speed = 3.4
                    bullets.push({
                        x: DINO_X + 18,
                        y: ORIGIN_Y,
                        vx: Math.cos(rad) * speed,
                        vy: Math.sin(rad) * speed,
                        color: tech.color,
                        alpha: 0.95,
                        radius: 2.4,
                    })
                }
            }
        }

        function draw(now: number) {
            c.clearRect(0, 0, W, H)

            if (now - lastFire >= FIRE_INTERVAL) {
                fire()
                lastFire = now
            }

            // orange: チェーン線
            if (techniqueId === 'orange' && bullets.length >= 2) {
                c.save()
                c.strokeStyle = `${tech.color}44`
                c.lineWidth = 0.8
                for (let i = 0; i < Math.min(bullets.length - 1, 6); i++) {
                    const b1 = bullets[i]
                    const b2 = bullets[i + 1]
                    if (Math.abs(b1.x - b2.x) < 50) {
                        c.beginPath()
                        c.moveTo(b1.x, b1.y)
                        c.lineTo(b2.x, b2.y)
                        c.stroke()
                    }
                }
                c.restore()
            }

            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i]
                b.x += b.vx
                b.y += b.vy
                b.alpha -= techniqueId === 'yellow_beam' ? 0.028 : 0.015

                if (b.alpha <= 0 || b.x > W + 12 || b.y < -12 || b.y > H + 12) {
                    bullets.splice(i, 1)
                    continue
                }

                const alphaHex = Math.round(Math.max(0, b.alpha) * 255)
                    .toString(16)
                    .padStart(2, '0')

                c.save()
                c.shadowBlur = techniqueId === 'purple' ? 16 : 8
                c.shadowColor = b.color
                c.beginPath()
                c.arc(b.x, b.y, b.radius, 0, Math.PI * 2)
                c.fillStyle = b.color + alphaHex
                c.fill()
                c.restore()

                // blue：尾を引く
                if (techniqueId === 'blue') {
                    c.save()
                    c.beginPath()
                    c.arc(b.x - b.vx * 3.5, b.y, b.radius * 0.5, 0, Math.PI * 2)
                    c.fillStyle =
                        b.color + Math.round(b.alpha * 70).toString(16).padStart(2, '0')
                    c.fill()
                    c.restore()
                }
            }

            animId = requestAnimationFrame(draw)
        }

        animId = requestAnimationFrame(draw)
        return () => {
            cancelAnimationFrame(animId)
            bullets.length = 0
        }
    }, [techniqueId, level]) // eslint-disable-line react-hooks/exhaustive-deps

    const EFFECT_LABEL: Partial<Record<TechniqueId, string>> = {
        blue: 'スロー効果',
        yellow_beam: 'ビーム（30連射）',
        purple: '貫通',
        orange: 'チェーン攻撃',
    }

    return (
        <div
            className="relative mt-2 rounded-xl overflow-hidden border border-white/[0.07]"
            style={{ height: '88px', background: 'rgba(0,0,0,0.35)' }}
        >
            {/* 発射ライン */}
            <div
                className="absolute top-1/2 left-[38px] right-0 border-t border-dashed border-white/[0.05]"
                style={{ transform: 'translateY(-1px)' }}
            />

            {/* 恐竜 */}
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 opacity-90 ptr-events-none">
                <Image src={ICONS.DINO} alt="Dino" width={24} height={24} />
            </div>

            {/* Canvas */}
            <canvas
                ref={canvasRef}
                width={360}
                height={88}
                className="absolute inset-0 w-full h-full"
            />

            {/* ラベル */}
            <div className="absolute bottom-1.5 left-10 flex items-center gap-1.5">
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: tech.color }}
                />
                <span className="text-[9px] text-white/25 [font-family:var(--font-dot-gothic-16)]">
                    {tech.label} lv{level}
                    {EFFECT_LABEL[techniqueId] ? ` · ${EFFECT_LABEL[techniqueId]}` : ''}
                </span>
            </div>
        </div>
    )
}
