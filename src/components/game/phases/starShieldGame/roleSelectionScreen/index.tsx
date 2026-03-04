'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from '../playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/dinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { roleSelectionScreen } from './styles'
import { COLORS, DIFFICULTIES, DIFFICULTY_META, ROLE_META, type Difficulty, type RoleChoice } from '@/constants/starShieldGame/constants'
import { TECHNIQUES, TECHNIQUE_IDS, type TechniqueId } from '@/constants/starShieldGame/techniques'

interface RoleSelectionScreenProps {
    room: RoomWithUsersAndReadyStatus
    roleChoices: Record<string, RoleChoice>
    onRoleChange: (role: RoleChoice) => void
    techniqueChoices: Record<string, TechniqueId | null>
    onTechniqueChange: (technique: TechniqueId | null) => void
    roleConflict: boolean
    canProceed: boolean
    onProceedToGame: () => void
    onBack: () => void
    currentUserId: string
    difficulty: Difficulty
    onDifficultyChange: (d: Difficulty) => void
    isHost: boolean
    isHellUnlocked: boolean
}

export function RoleSelectionScreen({
    room,
    roleChoices,
    onRoleChange,
    techniqueChoices,
    onTechniqueChange,
    canProceed,
    onProceedToGame,
    onBack,
    currentUserId,
    difficulty,
    onDifficultyChange,
    isHost,
    isHellUnlocked,
}: RoleSelectionScreenProps) {
    const myRole = roleChoices[currentUserId]
    const activeDiffMeta = DIFFICULTY_META[difficulty]
    const styles = roleSelectionScreen()

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />
            <DinosaurWithBalls size="w-28 h-28" />
            <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-7">
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h2 className={styles.sectionTitle()}>[むずかしさ]と[やくわり]をきめよう。</h2>
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
                    className="rounded-2xl p-5 flex flex-col gap-3 bg-white/[0.03] border border-white/[0.08]"
                >
                    <p className={styles.difficultyCardTitle()}>わざ（タイピストのみ）</p>
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => onTechniqueChange(null)}
                            className={cn(
                                'px-3 py-2 rounded-xl text-xs transition-all border',
                                !techniqueChoices[currentUserId]
                                    ? 'bg-brand-500/20 border-brand-500/50 text-brand-300'
                                    : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20'
                            )}
                        >
                            ふつう
                        </button>
                        {TECHNIQUE_IDS.map((tid) => {
                            const tech = TECHNIQUES[tid]
                            const isActive = techniqueChoices[currentUserId] === tid
                            return (
                                <button
                                    key={tid}
                                    onClick={() => onTechniqueChange(tid)}
                                    className={cn(
                                        'px-3 py-2 rounded-xl text-xs transition-all border flex items-center gap-1.5',
                                        isActive ? 'border-current' : 'bg-white/[0.02] border-white/10 text-white/50 hover:border-white/20'
                                    )}
                                    style={isActive ? { color: tech.color, borderColor: tech.color, backgroundColor: `${tech.color}20` } : undefined}
                                >
                                    <span
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: tech.color }}
                                    />
                                    {tech.label}
                                </button>
                            )
                        })}
                    </div>
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
