'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from '../playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/dinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { roleSelectionScreen } from './styles'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'
import { COLORS, DIFFICULTIES, DIFFICULTY_META, ROLE_META, type Difficulty, type RoleChoice } from '@/constants/starShieldGame/constants'
import { TECHNIQUES, type TechniqueId } from '@/constants/starShieldGame/techniques'
import { getAvailableNormalAttacks } from '@/utils/starShieldGame'
import type { OwnedSkills } from '@/utils/starShieldGame'
import type { StarShieldProgress } from '@/types/starShieldGame'
import { LEVEL_STAR_HP } from '@/constants/starShieldGame/gameConfig'
import { LEVEL_HEAL_RECOVERY } from '@/constants/starShieldGame/skillConfig'

interface RoleSelectionScreenProps {
    room: RoomWithUsersAndReadyStatus
    roleChoices: Record<string, RoleChoice>
    onRoleChange: (role: RoleChoice) => void
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
    isAbyssUnlocked: boolean
    shooterProgress?: StarShieldProgress | null
    typistProgress?: StarShieldProgress | null
    currentUserProgress?: StarShieldProgress | null
    shooterId?: string | null
    onShooterLoadoutUpdate?: (updates: { selectedNormalAttackId: TechniqueId }) => void
}

export function RoleSelectionScreen({
    room,
    roleChoices,
    onRoleChange,
    roomId,
    canProceed,
    onProceedToGame,
    onBack,
    currentUserId,
    difficulty,
    onDifficultyChange,
    isHost,
    isHellUnlocked,
    isAbyssUnlocked,
    shooterProgress,
    typistProgress,
    currentUserProgress,
    shooterId,
    onShooterLoadoutUpdate,
}: RoleSelectionScreenProps) {
    const myRole = roleChoices[currentUserId]
    // 役割衝突時・1人プレイ時は shooterProgress/typistProgress が null なので、自分の progress をフォールバック
    const displayShooterProgress = shooterProgress ?? (myRole === 'SHOOTER' ? currentUserProgress : null)
    const displayTypistProgress = typistProgress ?? (myRole === 'TYPIST' ? currentUserProgress : null)
    const ownedSkills: OwnedSkills = {
        normalAttacks: displayShooterProgress?.normalAttacks ?? [],
        specialAttacks: displayShooterProgress?.specialAttacks ?? [],
        healLevel: displayShooterProgress?.healLevel ?? null,
    }
    const availableNormal = getAvailableNormalAttacks(ownedSkills)
    const selNormal = displayShooterProgress?.selectedNormalAttackId ?? 'red'
    const activeDiffMeta = DIFFICULTY_META[difficulty]
    const styles = roleSelectionScreen()

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />
            <DinosaurWithBalls size="w-28 h-28" />
            <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-7">
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <Typography variant="h1" as="h2" className={styles.sectionTitle()}>
                        [むずかしさ]と[やくわり]をきめよう。
                    </Typography>
                </motion.div>

                <div className="grid grid-cols-[1fr_1fr] gap-5 items-stretch">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={cn(styles.difficultyCard(), !isHost && 'opacity-70')}
                    >
                        <Typography variant="small" as="p" font="cherry-bomb-one" className={styles.difficultyCardTitle()}>
                            むずかしさ
                        </Typography>
                        <div className="flex flex-col gap-2">
                            {DIFFICULTIES.map((d) => {
                                const meta = DIFFICULTY_META[d]
                                const isActive = difficulty === d
                                const isHellLocked = d === 'HELL' && !isHellUnlocked
                                const isAbyssLocked = d === 'ABYSS' && !isAbyssUnlocked
                                const isLocked = isHellLocked || isAbyssLocked
                                const canSelect = isHost && !isLocked
                                const isSelectableInactive = canSelect && !isActive
                                const lockTitle = isHellLocked
                                    ? '隕石破壊数200以上のクリアで解放'
                                    : isAbyssLocked
                                        ? '隕石破壊数500以上のクリアで解放'
                                        : undefined
                                return (
                                    <Button
                                        key={d}
                                        screen="star-shield"
                                        variant="solid"
                                        onClick={() => canSelect && onDifficultyChange(d)}
                                        disabled={!canSelect}
                                        title={lockTitle}
                                        className={cn(
                                            styles.difficultyButton(),
                                            'hover:scale-[1.02] hover:brightness-110',
                                            isSelectableInactive && 'hover:bg-white/5 hover:border-white/25',
                                        )}
                                        style={{
                                            ['--diff-bg' as string]: isActive ? meta.bg : 'transparent',
                                            ['--diff-border' as string]: isActive
                                                ? `1.5px solid ${meta.border}`
                                                : isSelectableInactive
                                                    ? '1.5px solid rgba(255,255,255,0.12)'
                                                    : '1.5px solid rgba(255,255,255,0.07)',
                                            ['--diff-glow' as string]: isActive ? meta.glow : 'none',
                                            ['--diff-color' as string]: isActive ? meta.text : isLocked ? COLORS.WHITE_15 : COLORS.WHITE_2,
                                            ['--diff-rate-color' as string]: isActive ? meta.text : COLORS.WHITE_15,
                                        }}
                                    >
                                        <Typography variant="body" as="span" className="text-lg leading-none w-5 text-center shrink-0">
                                            {meta.emoji}
                                        </Typography>
                                        <Typography variant="body" as="span" font="cherry-bomb-one" className="font-bold flex-1 text-left">
                                            {meta.label}
                                        </Typography>
                                        {isLocked && (
                                            <Typography variant="caption" as="span" className={styles.hellLockLabel()}>
                                                解放条件
                                            </Typography>
                                        )}
                                        {!isLocked && (
                                            <Typography variant="caption" as="span" className={styles.rateLabel()}>
                                                {meta.rate}
                                            </Typography>
                                        )}
                                    </Button>
                                )
                            })}
                        </div>
                        <Typography
                            variant="caption"
                            as="p"
                            font="cherry-bomb-one"
                            className={styles.successHint()}
                            style={{ ['--diff-hint-color' as string]: activeDiffMeta.text }}
                        >
                            せいこうしたとき {activeDiffMeta.rate} もらえるよ。
                        </Typography>
                        {!isHost && (
                            <Typography variant="caption" as="p" font="cherry-bomb-one" className={styles.hostWaiting()}>
                                ほすとがせんたくちゅう…
                            </Typography>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.15 }}
                        className="flex flex-col gap-2 min-h-0"
                    >
                        {(['SHOOTER', 'TYPIST'] as const).map((r) => {
                            const meta = ROLE_META[r]
                            const isSelected = myRole === r
                            return (
                                <div
                                    key={r}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => onRoleChange(r)}
                                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onRoleChange(r))}
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
                                        <Typography variant="h3" as="span" className={styles.roleTitle()}>
                                            {meta.label}
                                        </Typography>
                                    </div>
                                    <Typography variant="small" as="p" className={styles.roleDescription()}>
                                        {meta.description}
                                    </Typography>
                                    <Typography variant="caption" as="p" className={styles.roleDetail()}>
                                        {meta.detail}
                                    </Typography>
                                    {isSelected && r === 'SHOOTER' && displayShooterProgress && (
                                        <div className="mt-3 pt-3 border-t border-white/6 min-h-22" onClick={(e) => e.stopPropagation()}>
                                            <Typography variant="caption" as="p" className="text-[10px] mb-1.5 opacity-70">
                                                選択している色
                                            </Typography>
                                            <div className="flex flex-wrap gap-1.5">
                                                {availableNormal.map(({ techniqueId, level }) => {
                                                    const tech = TECHNIQUES[techniqueId]
                                                    const isActive = selNormal === techniqueId
                                                    const canChange = isSelected && r === 'SHOOTER' && onShooterLoadoutUpdate
                                                    return (
                                                        <Button
                                                            key={techniqueId}
                                                            type="button"
                                                            onClick={() => canChange && onShooterLoadoutUpdate({ selectedNormalAttackId: techniqueId })}
                                                            disabled={!canChange}
                                                            className={cn(
                                                                'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border-2 transition-all hover:brightness-110',
                                                                isActive ? 'bg-white/15 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'border-white/15 bg-white/3'
                                                            )}
                                                            style={isActive ? { borderColor: tech.color, boxShadow: `0 0 12px ${tech.color}80` } : undefined}
                                                        >
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tech.color }} />
                                                            <Typography variant="caption" as="span">Lv. {level}</Typography>
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}
                                    {isSelected && r === 'TYPIST' && displayTypistProgress && (
                                        <div className="mt-3 pt-3 border-t border-white/6 min-h-22">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <Typography variant="caption" as="span" className="text-[10px] opacity-80">
                                                        HP {LEVEL_STAR_HP[(displayTypistProgress.starHpLevel ?? 1) as 1 | 2 | 3 | 4 | 5]}
                                                    </Typography>
                                                    <div className="flex-1 min-w-0 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                        <div
                                                            className="h-full rounded-full bg-linear-to-r from-emerald-700 to-emerald-400 transition-all duration-300"
                                                            style={{ width: `${((displayTypistProgress.starHpLevel ?? 1) / 5) * 100}%` }}
                                                        />
                                                    </div>
                                                    <Typography variant="caption" as="span" className="opacity-50 shrink-0">
                                                        Lv{(displayTypistProgress.starHpLevel ?? 1)}/5
                                                    </Typography>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <Typography variant="caption" as="span" className="text-[10px] opacity-80 shrink-0">
                                                            {displayTypistProgress.healLevel != null ? (
                                                                displayTypistProgress.healLevel >= 5 ? (
                                                                    '回復: 全回復'
                                                                ) : (
                                                                    `回復: +${LEVEL_HEAL_RECOVERY[displayTypistProgress.healLevel as 1 | 2 | 3 | 4]}`
                                                                )
                                                            ) : (
                                                                <span className="text-white/40">回復: 未所持</span>
                                                            )}
                                                        </Typography>
                                                        {displayTypistProgress.healLevel != null && (
                                                            <>
                                                                <div className="flex-1 min-w-0 h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                                    <div
                                                                        className={cn(
                                                                            'h-full rounded-full transition-all duration-300',
                                                                            displayTypistProgress.healLevel === 6
                                                                                ? 'bg-linear-to-r from-amber-600 to-yellow-400'
                                                                                : 'bg-linear-to-r from-emerald-700 to-emerald-400'
                                                                        )}
                                                                        style={{ width: `${(displayTypistProgress.healLevel / 6) * 100}%` }}
                                                                    />
                                                                </div>
                                                                <Typography variant="caption" as="span" className="opacity-50 shrink-0">
                                                                    Lv{displayTypistProgress.healLevel === 6 ? 'max' : displayTypistProgress.healLevel}/6
                                                                </Typography>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </motion.div>
                </div>


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
                    <Typography variant="body" as="p" font="cherry-bomb-one" className={styles.statusMessage()}>
                        {canProceed ? 'じゅんびがととのったよ' : 'ちがうやくわりをえらんでね'}
                    </Typography>
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
                                    <Typography variant="body" as="span" className={styles.playerName()}>
                                        {u.user?.name ?? '...'}
                                        {isMe && (
                                            <Typography variant="small" as="span" className={styles.playerNameSuffix()}>
                                                (あなた)
                                            </Typography>
                                        )}
                                    </Typography>
                                    {roleMeta ? (
                                        <Typography variant="small" as="span" font="cherry-bomb-one" className={styles.roleBadge()}>
                                            <span className="relative w-3.5 h-3.5 shrink-0 block">
                                                <Image src={roleMeta.iconSrc} alt="" fill className="object-contain" />
                                            </span>
                                            {roleMeta.label}
                                        </Typography>
                                    ) : (
                                        <Typography variant="small" as="span" font="cherry-bomb-one" className={styles.selectingLabel()}>
                                            せんたくちゅう…
                                        </Typography>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                    {isHost && (
                        <Button variant="success" size="lg" onClick={onBack} className="shrink-0 font-cherry-bomb-one">
                            ← EXIT
                        </Button>
                    )}
                    {isHost && (
                        <Button
                            variant="primary"
                            size="lg"
                            disabled={!canProceed}
                            onClick={() => canProceed && onProceedToGame()}
                            className="flex-1 font-cherry-bomb-one"
                        >
                            {canProceed ? '🚀 START GAME' : '🔒 START GAME'}
                        </Button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
