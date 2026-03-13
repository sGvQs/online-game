'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ProtectedStar } from '../playing/protectedStar'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { TECHNIQUES, TECHNIQUE_STATS, type TechniqueId } from '@/constants/starShieldGame/techniques'
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
    SPECIAL_ATTACK_LEVEL_PARAMS,
    type SpecialAttackLevel,
} from '@/constants/starShieldGame/skillConfig'
import {
    LEVEL_STAR_HP,
    LEVEL_BULLET_COUNT,
    LEVEL_PINK_COUNT,
    LEVEL_SPREAD_DEG,
    LEVEL_BLUE_SLOW_MULTIPLIER,
    LEVEL_YELLOW_DAMAGE,
    LEVEL_PURPLE_SIZE,
    LEVEL_ORANGE_CHAIN_COUNT,
    LEVEL_ORANGE_DAMAGE,
} from '@/constants/starShieldGame/gameConfig'
import { cn } from '@/lib/utils'
import { getAvailableNormalAttacks, getAvailableSpecialAttacks } from '@/utils/starShieldGame'
import type { OwnedSkills } from '@/utils/starShieldGame'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'

// ============================================================
// 型定義
// ============================================================
type PreviewData =
    | { kind: 'normalAttack'; techniqueId: TechniqueId }
    | { kind: 'specialAttack'; id: string }
    | { kind: 'heal' }
    | { kind: 'starHp' }

// ============================================================
// 定数
// ============================================================
const SPECIAL_LABELS: Record<string, string> = {
    spread: '広範囲弾（スプレッド）',
    all_destruction: '全破壊',
}

const NORMAL_ATTACK_IDS: TechniqueId[] = ['red', 'blue', 'yellow_beam', 'purple', 'orange', 'pink']
const SPECIAL_ATTACK_IDS = ['spread'] as const

const PROGRESS_BAR_COLORS = {
    indigo: '#818cf8',
    emerald: '#34d399',
} as const

// ============================================================
// Main Component
// ============================================================
export function StarShieldSkill({ roomId, currentUserId: _currentUserId }: { roomId: string; currentUserId: string }) {
    const [progress, setProgress] = useState<StarShieldProgress | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
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

    // ヒール・必殺技：最大値のものを自動でセット
    useEffect(() => {
        if (!progress || loading) return
        const updates: Parameters<typeof updateLoadout>[0] = {}

        // ヒール：所持している最大レベルをセット
        const healLv = progress.healLevel ?? 0
        const selHeal = progress.selectedHealLevel ?? null
        if (healLv > 0 && (selHeal === null || selHeal < healLv)) {
            updates.selectedHealLevel = healLv
        }

        // 必殺技：利用可能な最強のものをセット（all_destruction > spread）
        const ownedSkills: OwnedSkills = {
            normalAttacks: progress.normalAttacks ?? [],
            specialAttacks: progress.specialAttacks ?? [],
            healLevel: progress.healLevel ?? null,
        }
        const availSpecial = getAvailableSpecialAttacks(ownedSkills)
        const selSpecial = progress.selectedSpecialAttackId ?? null
        const bestSpecial = availSpecial.length > 0 ? availSpecial[availSpecial.length - 1]!.specialAttackId : null
        if (bestSpecial && selSpecial !== bestSpecial) {
            updates.selectedSpecialAttackId = bestSpecial
        }

        if (Object.keys(updates).length > 0) {
            updateLoadout(updates).then((r) => r.ok && refresh())
        }
    }, [progress, loading, refresh])

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
                <p className="relative z-10 text-white/60 font-dot-gothic-16">読み込み中…</p>
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

    const handleLoadoutUpdate = async (updates: Parameters<typeof updateLoadout>[0]) => {
        setError(null)
        const result = await updateLoadout(updates)
        if (result.ok) refresh()
        else setError(result.error ?? 'スキル設定に失敗しました')
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
                        <h1 className="text-2xl font-black font-dot-gothic-16 bg-linear-to-br from-purple-400 to-pink-400 bg-clip-text text-transparent [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">
                            SKILL
                        </h1>
                        <p className="text-white/35 text-xs mt-0.5 font-dot-gothic-16">
                            スキルを強化して星を守る力を高めよう
                        </p>
                    </div>
                    <Link
                        href={`/game/${roomId}/star-shield`}
                        className="px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white/80 text-sm hover:bg-white/15 transition-colors font-dot-gothic-16"
                    >
                        ← もどる
                    </Link>
                </motion.div>

                {/* 所持 typing 数 */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="rounded-2xl px-5 py-4 bg-white/3 border border-white/8 flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <Image src={ICONS.TYPIST} alt="Typing" width={36} height={36} className="select-none" />
                        <p className="text-3xl font-bold text-white tabular-nums">
                            {typingCount.toLocaleString()}
                        </p>
                    </div>
                </motion.div>

                {error && (
                    <div className="rounded-xl bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 text-sm">
                        {error}
                    </div>
                )}

                {/* ロードアウト設定（常時表示） */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="rounded-2xl p-5 bg-white/3 border border-white/8 flex flex-col gap-5"
                >
                    <p className="text-sm font-dot-gothic-16 text-white/80 flex items-center gap-2">
                        ⚙️ 現在の装備
                        <span className="text-[10px] text-white/30 font-normal font-dot-gothic-16">
                            ゲームで使用するスキルの状態
                        </span>
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* ===================== ATTACK COLUMN ===================== */}
                        <div className="flex flex-col gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 overflow-hidden h-full">
                            <h3 className="text-indigo-400 text-xs font-bold flex items-center gap-2 font-dot-gothic-16 mb-1">
                                <Image src={ICONS.SHOOTER} alt="Shooter" width={16} height={16} className="opacity-80" />
                                ATTACK（Shooter）
                            </h3>

                            {/* 通常攻撃 */}
                            <div>
                                <p className="text-[10px] text-indigo-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
                                    通常攻撃
                                </p>
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
                            {availableSpecial.length > 0 && (
                            <div>
                                <p className="text-[10px] text-indigo-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
                                    必殺技
                                </p>
                                {/* 必殺技プレビュー */}
                                {(() => {
                                    const selSpec = availableSpecial.find((a) => a.specialAttackId === selSpecial)
                                    if (!selSpec) return null
                                    return (
                                        <SpecialAttackLoadoutPreview
                                            specialAttackId={selSpec.specialAttackId}
                                            level={selSpec.level}
                                            bulletColor={TECHNIQUES[selNormal as TechniqueId]?.color ?? '#ef4444'}
                                        />
                                    )
                                })()}
                            </div>
                            )}
                        </div>

                        {/* ===================== DEFENCE COLUMN ===================== */}
                        <div className="flex flex-col gap-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 overflow-hidden h-full">
                            <h3 className="text-emerald-400 text-xs font-bold flex items-center gap-2 font-dot-gothic-16 mb-1">
                                <Image src={ICONS.TYPIST} alt="Typist" width={16} height={16} className="opacity-80" />
                                DEFENCE（Typist）
                            </h3>

                            {/* 星のHP */}
                            <div>
                                <p className="text-[10px] text-emerald-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 opacity-50" />
                                    星のHP
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-white text-lg font-dot-gothic-16">HP</span>
                                    <span className="text-xl font-bold text-emerald-400 font-dot-gothic-16 tabular-nums">
                                        {LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]}
                                    </span>
                                </div>
                                <div className="mt-1.5 flex items-center gap-2">
                                    <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
                                        <div
                                            className="h-full bg-linear-to-r from-emerald-700 to-emerald-400 transition-all duration-500"
                                            style={{ width: `${(starHpLevel / 5) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] text-white/40 tabular-nums w-8 text-right">
                                        Lv. {starHpLevel}
                                    </span>
                                </div>
                            </div>

                            {/* ヒール */}
                            {healLevel !== null && (
                            <div className="h-full flex flex-col justify-end">
                                <p className="text-[10px] text-emerald-400 font-dot-gothic-16 mb-1.5 flex items-center gap-1.5">
                                    <span className="w-1 h-1 rounded-full bg-emerald-400 shrink-0 opacity-50" />
                                    ヒール
                                </p>
                                {healLevel !== null && (
                                <div className="flex items-center gap-2 flex-row">
                                    <span className="text-lg font-bold text-emerald-400 font-dot-gothic-16 tabular-nums">
                                        +{LEVEL_HEAL_RECOVERY[healLevel as 1 | 2 | 3 | 4 | 5 | 6] as number}HP
                                    </span>
                                </div>
                                )}
                                {/* ヒールプレビュー */}
                                    <div className="mt-2">
                                        <HealLoadoutPreview
                                            healValue={LEVEL_HEAL_RECOVERY[healLevel as 1 | 2 | 3 | 4 | 5 | 6] as number}
                                            isFullRestore={healLevel >= 5}
                                            starHpMax={LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]}
                                            healLevel={healLevel}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 通常攻撃選択 */}
                    {availableNormal.length > 0 && (
                        <div className="pt-2 border-t border-white/8">
                            <p className="text-[10px] text-indigo-400 font-dot-gothic-16 mb-2 flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0 opacity-50" />
                                通常攻撃を選択
                            </p>
                            <div className="flex flex-wrap justify-between">
                                {availableNormal.map(({ techniqueId, level }) => {
                                    const tech = TECHNIQUES[techniqueId]
                                    const isActive = selNormal === techniqueId
                                    return (
                                        <button
                                            key={techniqueId}
                                            type="button"
                                            onClick={() => handleLoadoutUpdate({ selectedNormalAttackId: techniqueId })}
                                            className={cn(
                                                'flex items-center gap-2 px-5 py-3 rounded-xl border-2 transition-all font-dot-gothic-16 text-sm',
                                                isActive
                                                    ? 'shadow-[0_0_12px_rgba(255,255,255,0.2)]'
                                                    : 'border-white/15 bg-white/3 hover:bg-white/6'
                                            )}
                                            style={
                                                isActive
                                                    ? { borderColor: tech.color, boxShadow: `0 0 12px ${tech.color}80` }
                                                    : undefined
                                            }
                                        >
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: tech.color }}
                                            />
                                            <span className="text-white text-xs">Lv.{level}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* スキル一覧：ATTACK / DEFENCE */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-col gap-4"
                >
                    {/* ATTACK セクション */}
                    <SectionDivider icon={ICONS.SHOOTER} label="ATTACK" color="indigo" desc="Shooter・攻撃担当" />

                    {/* 通常攻撃 */}
                    <SkillCard title="通常攻撃" jurisdiction="attack">
                        {NORMAL_ATTACK_IDS.map((techniqueId) => {
                            const tech = TECHNIQUES[techniqueId]
                            const ownedAttack = normalAttacks.find((a) => a.techniqueId === techniqueId)
                            const currentLevel = ownedAttack ? ownedAttack.level : 0
                            const maxLevel = 5

                            return (
                                <SkillRow
                                    key={techniqueId}
                                    label={
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="w-3 h-3 rounded-full shrink-0"
                                                style={{ backgroundColor: tech.color }}
                                            />
                                            <span className="font-dot-gothic-16 font-bold">{tech.label}</span>
                                        </div>
                                    }
                                    detail={getTechEffectLabel(techniqueId)}
                                    currentLevel={currentLevel}
                                    maxLevel={maxLevel}
                                    onClick={() => setPreview({ kind: 'normalAttack', techniqueId })}
                                    progressBarColor={tech.color}
                                />
                            )
                        })}
                    </SkillCard>

                    {/* 必殺技 */}
                    <SkillCard title="必殺技" jurisdiction="attack">
                        {SPECIAL_ATTACK_IDS.map((id) => {
                            const ownedSA = specialAttacks.find((a) => a.specialAttackId === id)
                            const currentLevel = ownedSA ? ownedSA.level : 0
                            const maxLevel = 10

                            return (
                                <SkillRow
                                    key={id}
                                    label={
                                        <span className="font-dot-gothic-16 font-bold">
                                            {SPECIAL_LABELS[id] ?? id}
                                        </span>
                                    }
                                    detail="単語を打ち切ったとき、強攻撃を発生させる"
                                    currentLevel={currentLevel}
                                    maxLevel={maxLevel}
                                    onClick={() => setPreview({ kind: 'specialAttack', id })}
                                    progressBarColor="#818cf8"
                                />
                            )
                        })}
                    </SkillCard>

                    {/* DEFENCE セクション */}
                    <SectionDivider icon={ICONS.TYPIST} label="DEFENCE" color="emerald" desc="Typist・守護担当" />

                    {/* 星のHP */}
                    <SkillCard title="星のHP強化" jurisdiction="defence">
                        {starHpLevel < 5 ? (
                            (() => {
                                const nextLevel = (starHpLevel + 1) as 2 | 3 | 4 | 5
                                return (
                                    <SkillRow
                                        label={
                                            <span>
                                                HP上限 <span className="text-emerald-400 font-bold">{LEVEL_STAR_HP[starHpLevel as 1 | 2 | 3 | 4 | 5]}</span>
                                                {' '}→ {LEVEL_STAR_HP[nextLevel]}（Lv. {starHpLevel} → Lv. {nextLevel}）
                                            </span>
                                        }
                                        currentLevel={starHpLevel}
                                        maxLevel={5}
                                        onClick={() => setPreview({ kind: 'starHp' })}
                                        progressBarColor="#34d399"
                                    />
                                )
                            })()
                        ) : (
                            <MaxedMessage>星のHP MAX レベル到達 🏆</MaxedMessage>
                        )}
                    </SkillCard>

                    {/* ヒール */}
                    <SkillCard title="ヒール" jurisdiction="defence">
                        {!healLevel ? (
                            <>
                                <p className="text-white/40 text-xs mb-3 font-dot-gothic-16">
                                    単語を打ち切ったとき、星のHPを回復します
                                </p>
                                <SkillRow
                                    label={<span>ヒール解放</span>}
                                    currentLevel={0}
                                    maxLevel={6}
                                    onClick={() => setPreview({ kind: 'heal' })}
                                    progressBarColor="#34d399"
                                />
                            </>
                        ) : (
                            healLevel < 6 ? (
                                (() => {
                                    const nextLevel = (healLevel + 1) as 2 | 3 | 4 | 5 | 6
                                    return (
                                        <SkillRow
                                            label={
                                                <span>
                                                    回復量 <span className="text-emerald-400 font-bold">
                                                        {healLevel >= 5 ? '全回復' : `+${LEVEL_HEAL_RECOVERY[healLevel as 1 | 2 | 3 | 4 | 5 | 6]} HP`}
                                                    </span>
                                                    {' '}→ Lv. {nextLevel === 6 ? 'max' : nextLevel}
                                                </span>
                                            }
                                            currentLevel={healLevel}
                                            maxLevel={6}
                                            onClick={() => setPreview({ kind: 'heal' })}
                                            progressBarColor="#34d399"
                                        />
                                    )
                                })()
                            ) : (
                                <MaxedMessage>ヒール MAX レベル到達 🏆</MaxedMessage>
                            )
                        )}
                    </SkillCard>
                </motion.div>
            </div>

            {/* プレビューモーダル */}
            <AnimatePresence>
                {preview && (
                    <SkillPreviewModal
                        preview={preview}
                        progress={progress}
                        typingCount={typingCount}
                        handlePurchase={handlePurchase}
                        onClose={() => setPreview(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// ============================================================
// SkillCard
// ============================================================
function SkillCard({
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
                'rounded-2xl p-5 bg-white/2 border flex flex-col gap-3',
                isAttack ? 'border-indigo-500/20' : 'border-emerald-500/20'
            )}
        >
            <div className="flex items-center justify-between">
                <p
                    className={cn(
                        'text-[13px] font-bold tracking-wider font-dot-gothic-16',
                        isAttack ? 'text-indigo-400' : 'text-emerald-400'
                    )}
                >
                    {title}
                </p>
                <span
                    className={cn(
                        'text-[10px] px-2 py-0.5 rounded-full border tracking-wide font-dot-gothic-16',
                        isAttack
                            ? 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                            : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                    )}
                >
                    <span className="flex items-center gap-1">
                        <Image
                            src={isAttack ? ICONS.SHOOTER : ICONS.TYPIST}
                            alt=""
                            width={11}
                            height={11}
                            className="opacity-70"
                        />
                        {isAttack ? 'Shooter' : 'Typist'}
                    </span>
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
    onClick,
    progressBarColor,
}: {
    label: React.ReactNode
    detail?: string
    currentLevel?: number
    maxLevel?: number
    onClick?: () => void
    progressBarColor: string
}) {
    return (
        <button
            onClick={onClick}
            className="w-full text-left flex items-center justify-between gap-3 py-2.5 border-b border-white/4 last:border-0 hover:bg-white/4 -mx-2 px-2 rounded-xl transition-colors cursor-pointer group"
        >
            <div className="flex items-center gap-2 min-w-0 flex-1">
                <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-white/85 text-sm">{label}</span>
                    {detail && (
                        <span className="text-white/30 text-[10px] font-dot-gothic-16">{detail}</span>
                    )}
                    {currentLevel !== undefined && maxLevel !== undefined && (
                        <div className="w-full mt-1.5 relative flex items-center gap-3">
                            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${(currentLevel / maxLevel) * 100}%`,
                                        backgroundColor: progressBarColor,
                                    }}
                                />
                            </div>
                            <span className="text-[10px] tracking-wider text-white/40 font-dot-gothic-16 shrink-0 w-8 text-right">
                                {currentLevel}/{maxLevel}
                            </span>
                        </div>
                    )}
                </div>
            </div>
            {currentLevel === 0 ? (
                <span className="text-[10px] text-white/40 shrink-0 font-dot-gothic-16 border border-white/20 bg-white/5 px-2 py-0.5 rounded tracking-widest">
                    未入手
                </span>
            ) : currentLevel === maxLevel ? (
                <span className="text-[10px] text-amber-300 shrink-0 font-dot-gothic-16 border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 rounded tracking-widest">
                    MAX
                </span>
            ) : (
                <span className="text-[10px] text-white/70 shrink-0 font-dot-gothic-16 border border-white/10 bg-white/5 px-2 py-0.5 rounded tracking-widest">
                    Lv {currentLevel}
                </span>
            )}
        </button>
    )
}

// ============================================================
// MaxedMessage
// ============================================================
function MaxedMessage({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 py-2.5">
            <span className="text-amber-400 text-base">🏆</span>
            <span className="text-amber-400/80 text-sm font-dot-gothic-16">{children}</span>
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
        orange: '直撃＋一段連鎖',
        pink: '円弧軌道（5発・レベルで増加）',
    }
    return effects[techniqueId] ?? ''
}

// ============================================================
// SectionDivider
// ============================================================
function SectionDivider({
    icon,
    label,
    color,
    desc,
}: {
    icon: string
    label: string
    color: 'indigo' | 'emerald'
    desc: string
}) {
    return (
        <div className="flex items-center gap-2 mt-2">
            <Image src={icon} alt={label} width={18} height={18} className="opacity-80 shrink-0" />
            <span
                className={cn(
                    'font-bold font-cherry-bomb-one text-sm shrink-0',
                    color === 'indigo' ? 'text-indigo-400' : 'text-emerald-400'
                )}
            >
                {label}
            </span>
            <span className="text-white/30 text-xs font-dot-gothic-16 shrink-0">{desc}</span>
            <div className="flex-1 h-px bg-white/8 ml-1" />
        </div>
    )
}

// ============================================================
// HealLoadoutPreview
// ============================================================
function HealLoadoutPreview({ healValue, isFullRestore, starHpMax, healLevel }: { healValue: number; isFullRestore: boolean; starHpMax: number; healLevel: number }) {
    const BASE_PCT = 28
    const HEAL_PCT = isFullRestore ? 100 - BASE_PCT : Math.min(100 - BASE_PCT, (healValue / starHpMax) * 100)

    return (
        <div className="rounded-xl bg-black/30 border border-white/5 p-2.5 flex flex-col gap-1.5">
            <p className="text-[9px] text-white/25 font-dot-gothic-16">ヒール効果イメージ</p>
            <div className="relative h-3 rounded-full bg-white/5 overflow-hidden">
                <div
                    className="absolute inset-y-0 left-0 bg-emerald-600"
                    style={{ width: `${BASE_PCT}%` }}
                />
                <motion.div
                    className={cn(
                        'absolute inset-y-0',
                        isFullRestore
                            ? 'bg-linear-to-r from-amber-600 to-yellow-400'
                            : 'bg-linear-to-r from-emerald-600 to-emerald-400'
                    )}
                    style={{ left: `${BASE_PCT}%` }}
                    animate={{ width: ['0%', `${HEAL_PCT}%`, `${HEAL_PCT}%`, '0%'] }}
                    transition={{ duration: 1.8, times: [0, 0.4, 0.7, 1], repeat: Infinity, repeatDelay: 0.6 }}
                />
            </div>
            <p className="text-[9px] font-dot-gothic-16 flex justify-between items-center">
                <span className="text-emerald-400/60">{isFullRestore ? '全回復' : `+${healValue} HP`}</span>
                <span className="text-white/25">{healLevel === 6 ? 'Lv. max' : `Lv. ${healLevel}`}</span>
            </p>
        </div>
    )
}

// ============================================================
// TechniquePentagonChart
// 五角形レーダーチャート（ダメージ・当てやすさ・サポート・必殺技相性・かっこよさ）
// ============================================================
const PENTAGON_LABELS = ['ダメージ', '当てやすさ', 'サポート', '必殺技相性', 'かっこよさ'] as const

function TechniquePentagonChart({
    stats,
    color,
}: {
    stats: { damage: number; hitEase: number; support: number; specialCombo: number; coolness: number }
    color: string
}) {
    const size = 200
    const cx = size / 2
    const cy = size / 2
    const maxR = 44
    const values = [stats.damage, stats.hitEase, stats.support, stats.specialCombo, stats.coolness]

    // 頂点座標（上から時計回り、角度は垂直上向き基準）
    const getPoint = (angleDeg: number, r: number) => {
        const rad = ((angleDeg - 90) * Math.PI) / 180
        return { x: cx + Math.cos(rad) * r, y: cy + Math.sin(rad) * r }
    }

    // データポリゴンの頂点（1-5 を 8〜maxR に正規化）
    const dataPoints = values.map((v, i) => {
        const r = 8 + ((Math.max(1, Math.min(5, v)) - 1) / 4) * (maxR - 8)
        return getPoint(i * 72, r)
    })
    const dataPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'

    // グリッド（正五角形、1-5の各段階）
    const gridPaths = [1, 2, 3, 4, 5].map((level) => {
        const r = 8 + ((level - 1) / 4) * (maxR - 8)
        const pts = [0, 1, 2, 3, 4].map((i) => getPoint(i * 72, r))
        return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    })

    return (
        <div className="flex flex-col items-center gap-3">
            <p className="text-indigo-400 text-[12px] font-bold font-dot-gothic-16 tracking-wider">
                特性評価
            </p>
            <svg width={size} height={size} className="shrink-0">
                {/* グリッド線 */}
                <g fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5">
                    {gridPaths.map((d, i) => (
                        <path key={i} d={d} />
                    ))}
                </g>
                {/* 軸線（中心→各頂点） */}
                <g stroke="rgba(255,255,255,0.12)" strokeWidth="0.5">
                    {[0, 1, 2, 3, 4].map((i) => {
                        const p = getPoint(i * 72, maxR)
                        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} />
                    })}
                </g>
                {/* データポリゴン */}
                <path
                    d={dataPath}
                    fill={`${color}40`}
                    stroke={color}
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
                {/* ラベル */}
                <g fill="rgba(255,255,255,0.7)" fontSize="9" fontFamily="var(--font-dot-gothic-16)">
                    {PENTAGON_LABELS.map((label, i) => {
                        const p = getPoint(i * 72, maxR + 14)
                        const anchor = i === 0 ? 'middle' : i < 3 ? 'start' : i === 3 ? 'middle' : 'end'
                        return (
                            <text key={i} x={p.x} y={p.y} textAnchor={anchor} dominantBaseline="middle">
                                {label}
                            </text>
                        )
                    })}
                </g>
            </svg>
        </div>
    )
}

// ============================================================
// LevelProgressionBarChart
// レベルごとの値を縦棒グラフで表示。現在レベルをアクセント色で強調。ホバーで他レベルの値を表示
// ============================================================
function LevelProgressionBarChart({
    values,
    currentLevel,
    maxLevel,
    color,
    formatValue,
    title = 'レベル推移',
}: {
    values: number[]
    currentLevel: number
    maxLevel: number
    color: string
    formatValue: (v: number, level: number) => string
    title?: string
}) {
    const [hoveredLevel, setHoveredLevel] = useState<number | null>(null)
    const barCount = Math.min(values.length, maxLevel)
    const maxVal = Math.max(...values, 1)
    const w = barCount <= 5 ? 220 : Math.min(320, 40 + barCount * 26)
    const h = 100
    const padding = { left: 28, right: 8, top: 4, bottom: 22 }
    const chartW = w - padding.left - padding.right
    const chartH = h - padding.top - padding.bottom
    const barGap = 4
    const barTotalW = barCount > 0 ? (chartW - barGap * (barCount - 1)) / barCount : 0

    return (
        <div className="flex flex-col items-center gap-2 relative">
            <p className="text-indigo-400 text-[12px] font-bold font-dot-gothic-16 tracking-wider">
                {title}
            </p>
            <svg width={w} height={h} className="shrink-0" style={{ overflow: 'visible' }}>
                {Array.from({ length: barCount }).map((_, i) => {
                    const level = i + 1
                    const val = values[i] ?? 0
                    const ratio = maxVal > 0 ? val / maxVal : 0
                    const barH = Math.max(2, ratio * chartH)
                    const x = padding.left + i * (barTotalW + barGap)
                    const y = padding.top + chartH - barH
                    const isCurrent = level === currentLevel
                    const isHovered = level === hoveredLevel
                    const barFill =
                        isHovered ? (isCurrent ? color : `${color}99`) : isCurrent ? color : 'rgba(255,255,255,0.18)'
                    const barStroke = isCurrent || isHovered ? color : 'transparent'
                    return (
                        <g key={level}>
                            <rect
                                x={x}
                                y={y}
                                width={barTotalW}
                                height={barH}
                                rx={3}
                                ry={3}
                                fill={barFill}
                                stroke={barStroke}
                                strokeWidth={1.5}
                                onMouseEnter={() => setHoveredLevel(level)}
                                onMouseLeave={() => setHoveredLevel(null)}
                                className="cursor-pointer"
                            />
                            <text
                                x={x + barTotalW / 2}
                                y={h - 6}
                                textAnchor="middle"
                                fontSize="9"
                                fill="rgba(255,255,255,0.6)"
                                fontFamily="var(--font-dot-gothic-16)"
                            >
                                Lv{level}
                            </text>
                        </g>
                    )
                })}
                {hoveredLevel !== null && hoveredLevel <= barCount && (
                    <g>
                        <rect
                            x={padding.left + (hoveredLevel - 1) * (barTotalW + barGap) + barTotalW / 2 - 36}
                            y={padding.top - 20}
                            width={72}
                            height={16}
                            rx={4}
                            ry={4}
                            fill="rgba(0,0,0,0.75)"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth={1}
                        />
                        <text
                            x={padding.left + (hoveredLevel - 1) * (barTotalW + barGap) + barTotalW / 2}
                            y={padding.top - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fill="white"
                            fontFamily="var(--font-dot-gothic-16)"
                        >
                            Lv{hoveredLevel}: {formatValue(values[hoveredLevel - 1] ?? 0, hoveredLevel)}
                        </text>
                    </g>
                )}
            </svg>
            {currentLevel > 0 && currentLevel <= barCount && (
                <p className="text-white text-[10px] font-dot-gothic-16">
                    現在 Lv{currentLevel}: {formatValue(values[currentLevel - 1] ?? 0, currentLevel)}
                </p>
            )}
        </div>
    )
}

// ============================================================
// SkillPreviewModal
// ============================================================
function SkillPreviewModal({
    preview,
    progress,
    typingCount,
    handlePurchase,
    onClose,
}: {
    preview: PreviewData
    progress: StarShieldProgress | null
    typingCount: number
    handlePurchase: (fn: () => Promise<{ ok: boolean; error?: string }>, label: string) => Promise<void>
    onClose: () => void
}) {
    // ---- 各種スキルの現在・次レベル・費用の算出 ----
    let currentLevel = 0
    let maxLevel = 1
    let nextCost: number | null = null
    let purchaseLabel = ''
    let purchaseFn: (() => Promise<{ ok: boolean; error?: string }>) | null = null
    let purchaseLabelForFn = ''

    if (preview.kind === 'normalAttack') {
        const ownedAttack = progress?.normalAttacks.find((a) => a.techniqueId === preview.techniqueId)
        currentLevel = ownedAttack ? ownedAttack.level : 0
        maxLevel = 5
        const tech = TECHNIQUES[preview.techniqueId]
        if (currentLevel === 0) {
            nextCost = NORMAL_ATTACK_UNLOCK_COSTS[preview.techniqueId] ?? 0
            purchaseLabel = '解放する'
            purchaseFn = () => purchaseNormalAttackUnlock(preview.techniqueId)
            purchaseLabelForFn = tech.label
        } else if (currentLevel < maxLevel) {
            const nl = (currentLevel + 1) as 2 | 3 | 4 | 5
            nextCost = NORMAL_ATTACK_LEVEL_UP_COSTS[preview.techniqueId]?.[nl] ?? 0
            purchaseLabel = `Lv ${nl} に上げる`
            purchaseFn = () => purchaseNormalAttackLevelUp(preview.techniqueId, nl)
            purchaseLabelForFn = '通常攻撃レベル上げ'
        }
    } else if (preview.kind === 'specialAttack') {
        const ownedSA = progress?.specialAttacks.find((a) => a.specialAttackId === preview.id)
        currentLevel = ownedSA ? ownedSA.level : 0
        maxLevel = 10
        if (currentLevel === 0) {
            nextCost = SPECIAL_ATTACK_UNLOCK_COSTS[preview.id as 'spread'] ?? 0
            purchaseLabel = '解放する'
            purchaseFn = () => purchaseSpecialAttackUnlock(preview.id as 'spread')
            purchaseLabelForFn = SPECIAL_LABELS[preview.id] ?? preview.id
        } else if (currentLevel < maxLevel) {
            const nl = (currentLevel + 1) as keyof typeof SPECIAL_ATTACK_LEVEL_UP_COSTS
            nextCost = SPECIAL_ATTACK_LEVEL_UP_COSTS[nl] ?? 0
            purchaseLabel = `Lv ${nl} に上げる`
            purchaseFn = () => purchaseSpecialAttackLevelUp(preview.id as 'spread', nl)
            purchaseLabelForFn = '必殺技レベル上げ'
        }
    } else if (preview.kind === 'starHp') {
        currentLevel = progress?.starHpLevel ?? 1
        maxLevel = 5
        if (currentLevel < maxLevel) {
            const nl = (currentLevel + 1) as 2 | 3 | 4 | 5
            nextCost = STAR_HP_LEVEL_UP_COSTS[nl]
            purchaseLabel = `Lv ${nl} に上げる`
            purchaseFn = () => purchaseStarHpLevelUp(nl)
            purchaseLabelForFn = '星のHPレベル上げ'
        }
    } else if (preview.kind === 'heal') {
        currentLevel = progress?.healLevel ?? 0
        maxLevel = 6
        if (currentLevel === 0) {
            nextCost = HEAL_UNLOCK_COST
            purchaseLabel = '解放する'
            purchaseFn = () => purchaseHealUnlock()
            purchaseLabelForFn = 'ヒール解放'
        } else if (currentLevel < maxLevel) {
            const nl = (currentLevel + 1) as 2 | 3 | 4 | 5 | 6
            nextCost = HEAL_LEVEL_UP_COSTS[nl]
            purchaseLabel = nl === 6 ? 'MAX に上げる' : `Lv ${nl} に上げる`
            purchaseFn = () => purchaseHealLevelUp(nl)
            purchaseLabelForFn = 'ヒールレベル上げ'
        }
    }

    const isMaxed = currentLevel >= maxLevel
    const canAfford = nextCost !== null && typingCount >= nextCost
    const isStarHp = preview.kind === 'starHp'

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={onClose}
        >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <motion.div
                initial={{ y: 24, scale: 0.95, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: 24, scale: 0.95, opacity: 0 }}
                transition={{ type: 'spring', damping: 26, stiffness: 280 }}
                className={cn(
                    'relative w-full max-w-sm rounded-[24px] shadow-2xl flex flex-col overflow-hidden max-h-full',
                    isStarHp ? 'bg-[#0a1a14] border border-emerald-500/20' : 'bg-[#14142a] border border-white/10'
                )}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Actions */}
                <div className="absolute top-4 right-4 z-10">
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-all text-sm backdrop-blur border border-white/5"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Content Area */}
                <div className="p-6 overflow-y-auto">
                    <PreviewContent preview={preview} progress={progress} currentLevel={currentLevel} />
                </div>

                {/* Sticky Footer for Action */}
                <div
                    className={cn(
                        'p-5 mt-auto',
                        isStarHp ? 'bg-emerald-500/5 border-t border-emerald-500/20' : 'bg-white/2 border-t border-white/5'
                    )}
                >
                    {isMaxed ? (
                        <div
                            className={cn(
                                'py-3 px-4 rounded-xl text-center flex items-center justify-center gap-2',
                                isStarHp
                                    ? 'border border-emerald-500/30 bg-emerald-500/15'
                                    : 'border border-amber-500/20 bg-amber-500/10'
                            )}
                        >
                            <span className={isStarHp ? 'text-emerald-400 text-lg' : 'text-amber-400 text-lg'}>🏆</span>
                            <span
                                className={cn(
                                    'text-sm font-bold font-dot-gothic-16 tracking-wider',
                                    isStarHp ? 'text-emerald-300/90' : 'text-amber-300/90'
                                )}
                            >
                                MAX レベル到達
                            </span>
                        </div>
                    ) : (
                        <button
                            disabled={!canAfford || !purchaseFn}
                            onClick={() => {
                                if (purchaseFn) handlePurchase(purchaseFn, purchaseLabelForFn)
                            }}
                            className={cn(
                                'w-full py-3.5 px-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-3 transition-all font-dot-gothic-16',
                                canAfford
                                    ? isStarHp
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 active:scale-[0.98]'
                                        : 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-lg shadow-indigo-500/25 active:scale-[0.98]'
                                    : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                            )}
                        >
                            <span>{purchaseLabel}</span>
                            {nextCost !== null && (
                                <span className={cn(
                                    "px-2.5 py-1 rounded-lg text-xs font-bold border",
                                    canAfford ? "bg-black/20 border-black/10" : "bg-black/10 border-white/5"
                                )}>
                                    {nextCost.toLocaleString()}
                                </span>
                            )}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    )
}

// ============================================================
// PreviewContent
// ============================================================
function PreviewContent({
    preview,
    progress,
    currentLevel,
}: {
    preview: PreviewData
    progress: StarShieldProgress | null
    currentLevel: number
}) {
    if (preview.kind === 'normalAttack') {
        const tech = TECHNIQUES[preview.techniqueId]
        const owned = currentLevel > 0
        const displayLevel = Math.max(1, currentLevel) as 1 | 2 | 3 | 4 | 5

        const traitByTech: Record<TechniqueId, { label: string; value: string }> = {
            red: { label: '散弾数', value: `${LEVEL_BULLET_COUNT[displayLevel]} 発` },
            blue: { label: '減速割合', value: `${Math.round((1 - LEVEL_BLUE_SLOW_MULTIPLIER[displayLevel]) * 100)}%` },
            yellow_beam: { label: '火力', value: `${LEVEL_YELLOW_DAMAGE[displayLevel]} × 30発` },
            purple: { label: '球サイズ', value: `${LEVEL_PURPLE_SIZE[displayLevel]}x` },
            orange: { label: '連鎖数 / ダメージ', value: `${LEVEL_ORANGE_CHAIN_COUNT[displayLevel]}体 / ${LEVEL_ORANGE_DAMAGE[displayLevel]}x` },
            pink: { label: '弾数', value: `${LEVEL_PINK_COUNT[displayLevel]} 発` },
        }
        const trait = traitByTech[preview.techniqueId]

        const specialEffects: Partial<Record<TechniqueId, { label: string; desc: string }>> = {
            blue: { label: 'スロー', desc: '命中した隕石の速度を下げる' },
            yellow_beam: { label: 'ビーム', desc: '30発が前方に連続して飛ぶ' },
            purple: { label: '貫通', desc: '隕石を貫通し複数を同時に攻撃' },
            orange: { label: '一段連鎖', desc: '直撃から近隣に一段連鎖' },
            pink: { label: '円弧軌道', desc: 'ターゲットの上下から弧を描いて着弾する' },
        }
        const fx = specialEffects[preview.techniqueId]

        return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                        style={{
                            backgroundColor: `${tech.color}15`,
                            border: `2px solid ${tech.color}50`,
                            boxShadow: `0 0 32px ${tech.color}30`,
                        }}
                    >
                        <div
                            className="w-8 h-8 rounded-full"
                            style={{ backgroundColor: tech.color, boxShadow: `0 0 12px ${tech.color}` }}
                        />
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
                            {tech.label}
                        </p>
                        <span className={cn(
                            "inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border",
                            owned ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" : "bg-white/5 text-white/40 border-white/10"
                        )}>
                            通常攻撃 {owned ? `Lv ${currentLevel}` : '未所持'}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-3">
                    <StatRow label="特性" value={`${trait.label}：${trait.value}`} color="text-indigo-300" />
                    {fx && (
                        <div className="mt-2 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4">
                            <p className="text-indigo-400 text-[13px] font-bold mb-1.5 font-dot-gothic-16 flex items-center gap-1.5">
                                ⚡ 特殊効果：{fx.label}
                            </p>
                            <p className="text-white/45 text-xs font-dot-gothic-16 leading-relaxed">
                                {fx.desc}
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 flex justify-center">
                    <TechniquePentagonChart stats={TECHNIQUE_STATS[preview.techniqueId]} color={tech.color} />
                </div>

                {(() => {
                    const normLevels = [1, 2, 3, 4, 5] as const
                    const levelValues: Record<TechniqueId, number[]> = {
                        red: normLevels.map((l) => LEVEL_BULLET_COUNT[l]),
                        blue: normLevels.map((l) => Math.round((1 - LEVEL_BLUE_SLOW_MULTIPLIER[l]) * 100)),
                        yellow_beam: normLevels.map((l) => LEVEL_YELLOW_DAMAGE[l] * 30),
                        purple: normLevels.map((l) => LEVEL_PURPLE_SIZE[l]),
                        orange: normLevels.map((l) => LEVEL_ORANGE_CHAIN_COUNT[l]),
                        pink: normLevels.map((l) => LEVEL_PINK_COUNT[l]),
                    }
                    const formatByTech: Record<TechniqueId, (v: number) => string> = {
                        red: (v) => `${v} 発`,
                        blue: (v) => `${v}%`,
                        yellow_beam: (v) => `${v}`,
                        purple: (v) => `${v}x`,
                        orange: (v) => `${v} 体`,
                        pink: (v) => `${v} 発`,
                    }
                    return (
                        <div className="mt-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 flex justify-center">
                            <LevelProgressionBarChart
                                values={levelValues[preview.techniqueId]}
                                currentLevel={displayLevel}
                                maxLevel={5}
                                color={tech.color}
                                formatValue={(v, _l) => formatByTech[preview.techniqueId](v)}
                            />
                        </div>
                    )
                })()}

                <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-white/40 text-xs mb-3 font-dot-gothic-16 font-bold tracking-wider">アニメーション デモ (Lv {displayLevel})</p>
                    <LoadoutAnimPreview techniqueId={preview.techniqueId} level={displayLevel} />
                </div>
            </div>
        )
    }

    if (preview.kind === 'specialAttack') {
        const owned = currentLevel > 0
        const displayLevel = Math.max(1, currentLevel) as SpecialAttackLevel
        const params = SPECIAL_ATTACK_LEVEL_PARAMS[displayLevel]
        const totalBullets = params.waveCount * params.bulletsPerWave

        return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 relative flex items-center justify-center shrink-0 rounded-2xl bg-purple-500/10 border-2 border-purple-500/40">
                        {Array.from({ length: 9 }).map((_, i) => {
                            const angle = (i / 8) * params.spreadDeg - params.spreadDeg / 2
                            const rad = ((angle - 90) * Math.PI) / 180
                            const r = 24
                            const x = Math.cos(rad) * r
                            const y = Math.sin(rad) * r
                            return (
                                <div
                                    key={i}
                                    className="absolute w-2 h-2 rounded-full bg-[#a78bfa]"
                                    style={{
                                        transform: `translate(${x}px, ${y}px)`,
                                        opacity: 0.4 + (i / 8) * 0.6,
                                        boxShadow: '0 0 6px rgba(167,139,250,0.6)',
                                    }}
                                />
                            )
                        })}
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
                            {SPECIAL_LABELS[preview.id] ?? preview.id}
                        </p>
                        <span className={cn(
                            "inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border",
                            owned ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-white/5 text-white/40 border-white/10"
                        )}>
                            必殺技 {owned ? `Lv ${currentLevel}` : '未所持'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-3">
                    <StatRow label="総弾数" value={`${totalBullets} 発`} color="text-orange-400" />
                    <StatRow label="広がり角度" value={`${params.spreadDeg}°`} color="text-indigo-300" />
                    {params.waveCount > 1 && (
                        <StatRow label="ウェーブ数" value={`${params.waveCount} 波`} color="text-purple-300" />
                    )}
                </div>
                <div className="mt-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 p-4 flex justify-center">
                    <LevelProgressionBarChart
                        values={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                            (l) => SPECIAL_ATTACK_LEVEL_PARAMS[l as SpecialAttackLevel].waveCount * SPECIAL_ATTACK_LEVEL_PARAMS[l as SpecialAttackLevel].bulletsPerWave
                        )}
                        currentLevel={displayLevel}
                        maxLevel={10}
                        color="#a78bfa"
                        formatValue={(v) => `${v} 発`}
                    />
                </div>
                <div className="mt-6 pt-6 border-t border-white/5">
                    <p className="text-white/40 text-xs mb-3 font-dot-gothic-16 font-bold tracking-wider">
                        アニメーション デモ (Lv {displayLevel})
                    </p>
                    <SpecialAttackLoadoutPreview
                        specialAttackId={preview.id as SpecialAttackChoice}
                        level={displayLevel}
                        bulletColor={TECHNIQUES[progress?.selectedNormalAttackId as TechniqueId ?? 'red']?.color ?? '#ef4444'}
                    />
                </div>
            </div>
        )
    }

    if (preview.kind === 'heal') {
        const owned = currentLevel > 0
        const healVal = owned ? LEVEL_HEAL_RECOVERY[currentLevel as 1 | 2 | 3 | 4 | 5 | 6] : 0
        const isFullRestore = owned && currentLevel >= 5
        const barWidth = isFullRestore ? 100 : owned ? healVal * 100 : 0

        return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shrink-0"
                        style={{ boxShadow: '0 0 32px rgba(16,185,129,0.2)' }}
                    >
                        💚
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
                            ヒール
                        </p>
                        <span className={cn(
                            "inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border",
                            owned ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" : "bg-white/5 text-white/40 border-white/10"
                        )}>
                            {owned ? `Lv ${currentLevel === 6 ? 'max' : currentLevel}` : '未所持'}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl bg-white/2 border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-white text-[13px] font-dot-gothic-16 font-bold">回復量</p>
                            <p className="text-emerald-400 text-[15px] font-bold font-dot-gothic-16">
                                {!owned ? '---' : isFullRestore ? '全回復' : `+${healVal} HP`}
                            </p>
                        </div>
                        <div className="h-2.5 rounded-full bg-black/40 border border-white/5 overflow-hidden">
                            <div
                                className={cn(
                                    'h-full rounded-full transition-all duration-700',
                                    currentLevel === 6
                                        ? 'bg-linear-to-r from-amber-600 to-yellow-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                                        : 'bg-linear-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]'
                                )}
                                style={{ width: `${barWidth}%` }}
                            />
                        </div>
                    </div>
                    {currentLevel === 6 && (
                        <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4">
                            <p className="text-red-400 text-[13px] font-bold mb-1.5 font-dot-gothic-16 flex items-center gap-1.5">
                                ⚡ all_destruction 付与
                            </p>
                            <p className="text-white/45 text-xs font-dot-gothic-16 leading-relaxed">
                                全回復に加えて、フィールド上の全ての隕石を一撃で破壊する。
                            </p>
                        </div>
                    )}
                </div>
                <div className="mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex justify-center">
                    <LevelProgressionBarChart
                        values={[1, 2, 3, 4, 5, 6].map((l) => {
                            const v = LEVEL_HEAL_RECOVERY[l as 1 | 2 | 3 | 4 | 5 | 6]
                            return v >= 100 ? 99 : v * 10
                        })}
                        currentLevel={currentLevel > 0 ? (currentLevel === 6 ? 6 : currentLevel) : 0}
                        maxLevel={6}
                        color="#10b981"
                        formatValue={(_v, level) =>
                            level >= 5 ? '全回復' : `+${LEVEL_HEAL_RECOVERY[level as 1 | 2 | 3 | 4]} HP`
                        }
                    />
                </div>
                {owned && (
                    <div className="mt-6 pt-6 border-t border-white/5">
                        <p className="text-white/40 text-xs mb-3 font-dot-gothic-16 font-bold tracking-wider">
                            ヒール効果イメージ
                        </p>
                        <HealLoadoutPreview
                            healValue={healVal as number}
                            isFullRestore={isFullRestore}
                            starHpMax={LEVEL_STAR_HP[(progress?.starHpLevel ?? 1) as 1 | 2 | 3 | 4 | 5]}
                            healLevel={progress?.healLevel ?? 1}
                        />
                    </div>
                )}
            </div>
        )
    }

    if (preview.kind === 'starHp') {
        const displayLevel = Math.max(1, currentLevel) as 1 | 2 | 3 | 4 | 5
        const hp = LEVEL_STAR_HP[displayLevel]

        return (
            <div>
                <div className="flex items-center gap-4 mb-6">
                    <div
                        className="w-16 h-16 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center text-3xl shrink-0"
                        style={{ boxShadow: '0 0 32px rgba(16,185,129,0.2)' }}
                    >
                        ⭐
                    </div>
                    <div>
                        <p className="text-white font-bold text-xl font-dot-gothic-16 tracking-wide mb-1">
                            星のHP
                        </p>
                        <span className="inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-dot-gothic-16 tracking-wider border bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                            Lv {displayLevel}
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-emerald-400/70 text-[13px] font-dot-gothic-16 font-bold">HP上限</p>
                            <p className="text-emerald-400 text-3xl font-bold font-cherry-bomb-one leading-none drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">
                                {hp}
                            </p>
                        </div>
                        <div className="h-2.5 rounded-full bg-black/40 border border-emerald-500/20 overflow-hidden">
                            <div
                                className="h-full rounded-full bg-linear-to-r from-emerald-700 to-emerald-400 transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                style={{ width: `${(displayLevel / 5) * 100}%` }}
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <p className="text-emerald-500/70 text-[10px] font-dot-gothic-16 font-bold tracking-widest">
                                Lv {displayLevel} / 5
                            </p>
                        </div>
                    </div>
                    <StatRow label="適用ロール" value="Typist（守護担当）" color="text-emerald-400/80" />
                </div>
                <div className="mt-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 p-4 flex justify-center">
                    <LevelProgressionBarChart
                        values={[1, 2, 3, 4, 5].map((l) => LEVEL_STAR_HP[l as 1 | 2 | 3 | 4 | 5])}
                        currentLevel={displayLevel}
                        maxLevel={5}
                        color="#10b981"
                        formatValue={(v) => `${v} HP`}
                    />
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
        <div className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
            <span className="text-white/35 text-xs font-dot-gothic-16">{label}</span>
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
        const bulletCount =
            techniqueId === 'red'
                ? LEVEL_BULLET_COUNT[lvl]
                : techniqueId === 'pink'
                  ? LEVEL_PINK_COUNT[lvl]
                  : 1
        const spreadDeg = techniqueId === 'red' ? LEVEL_SPREAD_DEG[lvl] : 0
        const purpleRadius = techniqueId === 'purple' ? Math.min(3.5 * LEVEL_PURPLE_SIZE[lvl], 8) : 3.5

        const DINO_X = 18
        const H = canvas.height
        const W = canvas.width
        const ORIGIN_Y = H / 2 - 2
        const FIRE_INTERVAL = 1400

        const bullets: Bullet[] = []
        let lastFire = -FIRE_INTERVAL
        let animId: number

        function fire() {
            // pink：円弧軌道（恐竜の口から発射、弧を描いて右へ）
            if (techniqueId === 'pink') {
                const displayCount = Math.min(bulletCount, 8)
                const startX = DINO_X + 18
                for (let i = 0; i < displayCount; i++) {
                    const sign = i % 2 === 0 ? 1 : -1
                    bullets.push({
                        x: startX,
                        y: ORIGIN_Y,
                        vx: 2.8,
                        vy: -sign * 0.4,
                        color: tech.color,
                        alpha: 0.9,
                        radius: 2.2,
                    })
                }
                return
            }

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
                    radius: purpleRadius,
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
                if (techniqueId === 'pink') {
                    b.vy += 0.012 * (ORIGIN_Y - b.y)
                }
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
        orange: '一段連鎖',
        pink: '円弧軌道',
    }

    return (
        <div
            className="relative mt-2 rounded-xl overflow-hidden border border-white/[0.07]"
            style={{ height: '88px', background: 'rgba(0,0,0,0.35)' }}
        >
            {/* 発射ライン */}
            <div
                className="absolute top-1/2 left-[38px] right-0 border-t border-dashed border-white/5"
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
                <span className="text-[9px] text-white/25 font-dot-gothic-16">
                    {tech.label} Lv. {level}
                    {EFFECT_LABEL[techniqueId] ? ` · ${EFFECT_LABEL[techniqueId]}` : ''}
                </span>
            </div>
        </div>
    )
}

// ============================================================
// SpecialAttackLoadoutPreview
// 必殺技（スプレッド）の扇状発射プレビュー。赤球ベース、前方発射、レベルで波紋・ウェーブ表現
// ============================================================
type SpecBullet = { x: number; y: number; vx: number; vy: number; alpha: number }

function SpecialAttackLoadoutPreview({
    specialAttackId,
    level,
    bulletColor,
}: {
    specialAttackId: SpecialAttackChoice
    level: number
    bulletColor: string
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const lvl = Math.max(1, Math.min(10, level)) as SpecialAttackLevel
    const params = SPECIAL_ATTACK_LEVEL_PARAMS[lvl]
    const { spreadDeg, waveCount, bulletsPerWave, waveDelayMs } = params

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const c = ctx

        const W = canvas.width
        const H = canvas.height
        const DINO_X = 18
        const ORIGIN_Y = H / 2 - 2
        const FIRE_INTERVAL = 1800
        const SPEED = 3.4
        const COLOR = bulletColor

        const bullets: SpecBullet[] = []
        let lastFire = -FIRE_INTERVAL
        let animId: number

        function spawnWave(_waveIndex: number) {
            const displayCount = Math.min(bulletsPerWave, 24)
            if (displayCount <= 1) {
                bullets.push({ x: DINO_X + 18, y: ORIGIN_Y, vx: SPEED, vy: 0, alpha: 0.95 })
                return
            }
            for (let i = 0; i < displayCount; i++) {
                const angle = ((i / (displayCount - 1)) - 0.5) * spreadDeg
                const rad = (angle * Math.PI) / 180
                bullets.push({
                    x: DINO_X + 18,
                    y: ORIGIN_Y,
                    vx: Math.cos(rad) * SPEED,
                    vy: Math.sin(rad) * SPEED,
                    alpha: 0.95,
                })
            }
        }

        const timeouts: ReturnType<typeof setTimeout>[] = []

        function fire() {
            if (waveCount <= 1) {
                spawnWave(0)
                return
            }
            for (let w = 0; w < waveCount; w++) {
                timeouts.push(setTimeout(() => spawnWave(w), w * waveDelayMs))
            }
        }

        function draw(now: number) {
            c.clearRect(0, 0, W, H)
            if (now - lastFire >= FIRE_INTERVAL) {
                fire()
                lastFire = now
            }
            for (let i = bullets.length - 1; i >= 0; i--) {
                const b = bullets[i]
                b.x += b.vx
                b.y += b.vy
                b.alpha -= 0.012
                if (b.alpha <= 0 || b.x > W + 12 || b.y < -12 || b.y > H + 12) {
                    bullets.splice(i, 1)
                    continue
                }
                const alphaHex = Math.round(Math.max(0, b.alpha) * 255).toString(16).padStart(2, '0')
                c.save()
                c.shadowBlur = 8
                c.shadowColor = COLOR
                c.beginPath()
                c.arc(b.x, b.y, 2.4, 0, Math.PI * 2)
                c.fillStyle = COLOR + alphaHex
                c.fill()
                c.restore()
            }
            animId = requestAnimationFrame(draw)
        }
        animId = requestAnimationFrame(draw)
        return () => {
            cancelAnimationFrame(animId)
            timeouts.forEach((t) => clearTimeout(t))
            bullets.length = 0
        }
    }, [specialAttackId, level, bulletColor, spreadDeg, waveCount, bulletsPerWave, waveDelayMs])

    const label = specialAttackId === 'all_destruction' ? '全破壊' : '扇状散弾'

    return (
        <div className="relative mt-2 rounded-xl overflow-hidden border border-white/[0.07]" style={{ height: '88px', background: 'rgba(0,0,0,0.35)' }}>
            <div className="absolute top-1/2 left-[38px] right-0 border-t border-dashed border-white/5" style={{ transform: 'translateY(-1px)' }} />
            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 opacity-90 ptr-events-none">
                <Image src={ICONS.DINO} alt="Dino" width={24} height={24} />
            </div>
            <canvas ref={canvasRef} width={360} height={88} className="absolute inset-0 w-full h-full" />
            <div className="absolute bottom-1.5 left-10 flex items-center gap-1.5">
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{
                        background: bulletColor,
                        boxShadow: `0 0 6px ${bulletColor}99`,
                    }}
                />
                <span className="text-[9px] text-white font-dot-gothic-16">{label} Lv{level}</span>
            </div>
        </div>
    )
}
