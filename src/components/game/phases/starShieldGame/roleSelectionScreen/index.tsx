'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from '../playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/dinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { roleSelectionScreen } from './styles'
import { COLORS, DIFFICULTIES, DIFFICULTY_META, ROLE_META, type Difficulty, type RoleChoice } from '@/constants/starShieldGame/constants'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import {
    getDebugNormalAttacks,
    getAvailableNormalAttacks,
    getAvailableSpecialAttacks,
    getAvailableHealLevel,
} from '@/utils/starShieldGame'
import type { SpecialAttackChoice, OwnedSkills } from '@/utils/starShieldGame'

interface RoleSelectionScreenProps {
    room: RoomWithUsersAndReadyStatus
    roleChoices: Record<string, RoleChoice>
    onRoleChange: (role: RoleChoice) => void
    normalAttackChoices: Record<string, TechniqueId | null>
    onNormalAttackChange: (normal: TechniqueId | null) => void
    specialAttackChoices: Record<string, SpecialAttackChoice>
    onSpecialAttackChange: (special: SpecialAttackChoice) => void
    healChoices?: Record<string, number | null>
    onHealChange?: (healLevel: number | null) => void
    roomId?: string
    roleConflict: boolean
    canProceed: boolean
    onProceedToGame: () => void
    onBack: () => void
    currentUserId: string
    difficulty: Difficulty
    onDifficultyChange: (d: Difficulty) => void
    isHost: boolean
    isHellUnlocked: boolean
    autoAimNearest?: boolean
    onToggleAutoAim?: () => void
    shooterProgress?: OwnedSkills | null
    typistProgress?: OwnedSkills | null
}

export function RoleSelectionScreen({
    room,
    roleChoices,
    onRoleChange,
    normalAttackChoices,
    onNormalAttackChange,
    specialAttackChoices,
    onSpecialAttackChange,
    healChoices = {},
    onHealChange,
    roomId,
    canProceed,
    onProceedToGame,
    onBack,
    currentUserId,
    difficulty,
    onDifficultyChange,
    isHost,
    isHellUnlocked,
    autoAimNearest = false,
    onToggleAutoAim,
    shooterProgress = null,
    typistProgress = null,
}: RoleSelectionScreenProps) {
    const myRole = roleChoices[currentUserId]
    const typistId = room.users.find((u) => roleChoices[u.userId] === 'TYPIST')?.userId
    const shooterId = room.users.find((u) => roleChoices[u.userId] === 'SHOOTER')?.userId
    const canEditTechnique = isHost
    const activeDiffMeta = DIFFICULTY_META[difficulty]
    const styles = roleSelectionScreen()
    const shooterOwned: OwnedSkills = shooterProgress ?? {
        normalAttacks: [{ techniqueId: 'red', level: 1 }],
        specialAttacks: [],
        healLevel: null,
    }
    const typistOwned: OwnedSkills = typistProgress ?? { normalAttacks: [], specialAttacks: [], healLevel: null }
    const availableNormalAttacks = getAvailableNormalAttacks(shooterOwned)
    const availableSpecialAttacks = getAvailableSpecialAttacks(shooterOwned)
    const availableHealLevel = getAvailableHealLevel(typistOwned)

    const SPECIAL_ATTACK_OPTIONS: { id: SpecialAttackChoice; label: string }[] = [
        { id: 'spread_small', label: '小規模' },
        { id: 'spread_medium', label: '中規模' },
        { id: 'spread_large', label: '大規模' },
        { id: 'all_destruction', label: '全部破壊' },
    ].filter((opt) => availableSpecialAttacks.some((a) => a.specialAttackId === opt.id)) as {
        id: SpecialAttackChoice
        label: string
    }[]

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />
            <DinosaurWithBalls size="w-28 h-28" />
            <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-7">
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex items-center justify-between">
                    <h2 className={styles.sectionTitle()}>[むずかしさ]と[やくわり]をきめよう。</h2>
                    {roomId && (
                        <Link
                            href={`/game/${roomId}/star-shield/shop`}
                            className="text-sm text-amber-400/80 hover:text-amber-400 border border-amber-500/40 px-3 py-1.5 rounded-xl hover:bg-amber-500/10 transition-colors"
                        >
                            🛒 ショップ
                        </Link>
                    )}
                </motion.div>

                <div className="grid grid-cols-[1fr_1fr] gap-5">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={cn(styles.difficultyCard(), !isHost && 'opacity-70')}
                    >
                        <p className={styles.difficultyCardTitle()}>むずかしさ</p>
                        <div className="flex flex-col gap-2">
                            {DIFFICULTIES.map((d) => {
                                const meta = DIFFICULTY_META[d]
                                const isActive = difficulty === d
                                const isHellLocked = d === 'HELL' && !isHellUnlocked
                                const canSelect = isHost && (!isHellLocked || d !== 'HELL')
                                return (
                                    <button
                                        key={d}
                                        onClick={() => canSelect && onDifficultyChange(d)}
                                        disabled={!canSelect}
                                        title={isHellLocked ? '隕石破壊数100以上のクリアで解放' : undefined}
                                        className={cn(
                                            styles.difficultyButton(),
                                            canSelect ? 'cursor-pointer hover:scale-[1.02] hover:brightness-110' : 'cursor-default',
                                            isHellLocked && 'opacity-50',
                                        )}
                                        style={{
                                            ['--diff-bg' as string]: isActive ? meta.bg : 'transparent',
                                            ['--diff-border' as string]: isActive ? `1.5px solid ${meta.border}` : '1.5px solid rgba(255,255,255,0.07)',
                                            ['--diff-glow' as string]: isActive ? meta.glow : 'none',
                                            ['--diff-color' as string]: isActive ? meta.text : isHellLocked ? COLORS.WHITE_15 : COLORS.WHITE_2,
                                            ['--diff-rate-color' as string]: isActive ? meta.text : COLORS.WHITE_15,
                                        }}
                                    >
                                        <span className="text-lg leading-none w-5 text-center shrink-0">{meta.emoji}</span>
                                        <span className="text-sm font-bold flex-1 text-left">{meta.label}</span>
                                        {isHellLocked && <span className={styles.hellLockLabel()}>解放条件</span>}
                                        {!isHellLocked && <span className={styles.rateLabel()}>{meta.rate}</span>}
                                    </button>
                                )
                            })}
                        </div>
                        <p
                            className={styles.successHint()}
                            style={{ ['--diff-hint-color' as string]: activeDiffMeta.text }}
                        >
                            せいこうしたとき {activeDiffMeta.rate} もらえるよ。
                        </p>
                        {!isHost && <p className={styles.hostWaiting()}>ほすとがせんたくちゅう…</p>}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="flex flex-col gap-2"
                    >
                        {(['SHOOTER', 'TYPIST'] as const).map((r) => {
                            const meta = ROLE_META[r]
                            const isSelected = myRole === r
                            return (
                                <button
                                    key={r}
                                    onClick={() => onRoleChange(r)}
                                    className={styles.roleButton()}
                                    style={{
                                        ['--role-bg' as string]: isSelected ? meta.bg : 'rgba(255,255,255,0.02)',
                                        ['--role-border' as string]: isSelected ? `1.5px solid ${meta.border}` : '1.5px solid rgba(255,255,255,0.07)',
                                        ['--role-glow' as string]: isSelected ? meta.glow : 'none',
                                        ['--role-icon-filter' as string]: isSelected ? 'none' : 'opacity(0.35)',
                                        ['--role-title-color' as string]: isSelected ? meta.text : COLORS.WHITE_35,
                                        ['--role-desc-color' as string]: isSelected ? meta.text : COLORS.WHITE_25,
                                        ['--role-detail-color' as string]: isSelected ? `${meta.text}99` : COLORS.WHITE_15,
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="relative w-6 h-6 shrink-0">
                                            <Image src={meta.iconSrc} alt={meta.label} fill className={styles.roleIcon()} />
                                        </div>
                                        <span className={styles.roleTitle()}>{meta.label}</span>
                                    </div>
                                    <p className={styles.roleDescription()}>{meta.description}</p>
                                    <p className={styles.roleDetail()}>{meta.detail}</p>
                                </button>
                            )
                        })}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.18 }}
                    className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-white/[0.03] border border-white/[0.08]', !canEditTechnique && 'opacity-70')}
                >
                    <p className={styles.difficultyCardTitle()}>[通常攻撃]（Shooter）</p>
                    {shooterId ? (
                        <div className="flex flex-wrap gap-2">
                            {availableNormalAttacks.map(({ techniqueId: tid, level: lv }) => {
                                const tech = TECHNIQUES[tid]
                                const isActive = normalAttackChoices[shooterId] === tid
                                return (
                                    <button
                                        key={tid}
                                        onClick={() => canEditTechnique && onNormalAttackChange(tid)}
                                        disabled={!canEditTechnique}
                                        className={cn(
                                            'px-3 py-2 rounded-xl text-xs transition-all border flex items-center gap-1.5',
                                            isActive ? 'border-current' : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20',
                                            !canEditTechnique && 'cursor-default'
                                        )}
                                        style={isActive ? { color: tech.color, borderColor: tech.color, backgroundColor: `${tech.color}20` } : undefined}
                                    >
                                        <span
                                            className="w-2 h-2 rounded-full shrink-0"
                                            style={{ backgroundColor: tech.color }}
                                        />
                                        {tech.label} (lv{lv})
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-white/40 text-xs">やくわりがきまるとせんたくできます</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.185 }}
                    className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-white/[0.03] border border-white/[0.08]', !canEditTechnique && 'opacity-70')}
                >
                    <p className={styles.difficultyCardTitle()}>[必殺技]（Shooter）</p>
                    {shooterId ? (
                        <div className="flex flex-wrap gap-2">
                            {SPECIAL_ATTACK_OPTIONS.map(({ id, label }) => {
                                const spec = availableSpecialAttacks.find((a) => a.specialAttackId === id)
                                const lv = spec?.level ?? 1
                                const isActive = (specialAttackChoices[shooterId] ?? 'spread_medium') === id
                                const isAllDestruction = id === 'all_destruction'
                                return (
                                    <button
                                        key={id}
                                        onClick={() => canEditTechnique && onSpecialAttackChange(id as SpecialAttackChoice)}
                                        disabled={!canEditTechnique}
                                        className={cn(
                                            'px-3 py-2 rounded-xl text-xs transition-all border flex items-center gap-1.5',
                                            isActive
                                                ? isAllDestruction
                                                    ? 'border-red-500 bg-red-500/20 text-red-400'
                                                    : 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                                                : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20',
                                            !canEditTechnique && 'cursor-default'
                                        )}
                                    >
                                        {isAllDestruction && <span className="w-2 h-2 rounded-full shrink-0 bg-red-500" />}
                                        {label} (lv{lv})
                                    </button>
                                )
                            })}
                        </div>
                    ) : (
                        <p className="text-white/40 text-xs">やくわりがきまるとせんたくできます</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.186 }}
                    className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-white/[0.03] border border-white/[0.08]', myRole !== 'TYPIST' && 'opacity-70')}
                >
                    <p className={styles.difficultyCardTitle()}>[ヒール]（Typist）</p>
                    {typistId ? (
                        availableHealLevel != null ? (
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: availableHealLevel }, (_, i) => i + 1).map((lv) => {
                                    const isActive = (healChoices[typistId] ?? 1) === lv
                                    const isMax = lv === 6
                                    const canEditHeal = myRole === 'TYPIST' && typistId === currentUserId
                                    return (
                                        <button
                                            key={lv}
                                            onClick={() => canEditHeal && onHealChange?.(lv)}
                                            disabled={!canEditHeal}
                                            className={cn(
                                                'px-3 py-2 rounded-xl text-xs transition-all border flex items-center gap-1.5',
                                                isActive
                                                    ? isMax
                                                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                                                        : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                                                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20',
                                                !canEditHeal && 'cursor-default'
                                            )}
                                        >
                                            {lv === 6 ? 'lv.max' : `lv.${lv}`}
                                        </button>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-white/40 text-xs">ショップでヒールをかいましょう</p>
                        )
                    ) : (
                        <p className="text-white/40 text-xs">やくわりがきまるとせんたくできます</p>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.19 }}
                    className={cn('rounded-2xl p-5 flex flex-col gap-3 bg-white/[0.03] border border-white/[0.08]', !isHost && 'opacity-70')}
                >
                    <p className={styles.difficultyCardTitle()}>[デバッグチェック]</p>
                    {onToggleAutoAim && (
                        <label
                            htmlFor="auto-aim-debug"
                            className="flex items-center gap-2 cursor-pointer select-none"
                        >
                            <input
                                id="auto-aim-debug"
                                type="checkbox"
                                checked={autoAimNearest}
                                onChange={onToggleAutoAim}
                                disabled={!isHost}
                                className="w-3.5 h-3.5 rounded border-white/30 bg-white/5 accent-brand-500 disabled:cursor-default"
                            />
                            <span className="text-brand-500/60 text-xs">オートエイム</span>
                        </label>
                    )}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className={styles.statusPanel()}
                    style={{
                        ['--status-panel-bg' as string]: COLORS.BRAND_06,
                        ['--status-panel-border' as string]: canProceed ? '1px solid rgba(129,140,248,0.15)' : '1px solid rgba(248,113,113,0.4)',
                        ['--status-message-color' as string]: canProceed ? 'rgba(134,239,172,0.95)' : 'rgba(248,113,113,0.95)',
                    }}
                >
                    <p className={styles.statusMessage()}>
                        {canProceed ? 'じゅんびがととのったよ' : 'ちがうやくわりをえらんでね'}
                    </p>
                    <div className="flex flex-col gap-3">
                        {room.users.map((u: RoomUserWithReadyStatus) => {
                            const isMe = u.userId === currentUserId
                            const role = roleChoices[u.userId]
                            const roleMeta = role ? ROLE_META[role] : null
                            return (
                                <div
                                    key={u.id}
                                    className="flex items-center gap-3"
                                    style={{
                                        ['--status-dot-color' as string]: roleMeta ? roleMeta.text : COLORS.WHITE_15,
                                        ['--player-name-color' as string]: isMe ? '#ffffff' : COLORS.WHITE_5,
                                        ...(roleMeta
                                            ? {
                                                  ['--badge-color' as string]: roleMeta.text,
                                                  ['--badge-bg' as string]: roleMeta.bg,
                                                  ['--badge-border' as string]: `1px solid ${roleMeta.border}`,
                                              }
                                            : {}),
                                    }}
                                >
                                    <div className={styles.statusDot()} />
                                    <span className={styles.playerName()}>
                                        {u.user?.name ?? '...'}
                                        {isMe && <span className={styles.playerNameSuffix()}>(あなた)</span>}
                                    </span>
                                    {roleMeta ? (
                                        <span className={styles.roleBadge()}>
                                            <span className="relative w-3.5 h-3.5 shrink-0 block">
                                                <Image src={roleMeta.iconSrc} alt="" fill className="object-contain" />
                                            </span>
                                            {roleMeta.label}
                                        </span>
                                    ) : (
                                        <span className={styles.selectingLabel()}>せんたくちゅう…</span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                    {isHost && (
                        <button onClick={onBack} className={styles.exitButton()}>
                            ← EXIT
                        </button>
                    )}
                    {isHost && (
                        <button
                            onClick={() => canProceed && onProceedToGame()}
                            disabled={!canProceed}
                            className={cn(
                                styles.startButton(),
                                canProceed ? styles.startButtonEnabled() : styles.startButtonDisabled(),
                            )}
                        >
                            {canProceed ? '🚀 START GAME' : '🔒 START GAME'}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
