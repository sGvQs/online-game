'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/dinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { titleScreen } from './titleScreen.styles'
import { ICONS } from '@/constants/starShieldGame/constants'

interface TitleScreenProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    isReady: boolean
    allUsersReady: boolean
    canStart: boolean
    onToggleReady: () => void
    onStartGame: () => void
    onExit: () => void
    currentUserId: string
    initialRankings: UserRanking[]
}

const HOW_TO_PLAY = [
    { iconSrc: ICONS.TARGET_CIRCLE, text: '「シューター」は照準を隕石に合わせてエイム。' },
    { iconSrc: ICONS.TYPIST, text: '「タイピスト」はワードをタイプして弾を発射。' },
    { iconSrc: ICONS.DINO, text: '90秒間、隕石の猛攻から星を守り抜けばクリア！' },
    { iconSrc: ICONS.FIRE, text: '隕石が星に直撃するとゲームオーバー' },
]

export function TitleScreen({
    room,
    isHost,
    isReady,
    canStart,
    onToggleReady,
    onStartGame,
    onExit,
    currentUserId,
    initialRankings,
}: TitleScreenProps) {
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const styles = titleScreen()

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />
            <DinosaurWithBalls size="w-28 h-28" />
            <AuroraGlow width={700} height={350} opacity={0.25} blur={50} />

            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">
                <div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-start">
                    <div className="flex flex-col gap-5">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <h1 className="leading-none select-none">
                                <span className={styles.titleStar()}>STAR</span>
                                <span className={styles.titleShield()}>SHIELD</span>
                            </h1>
                            <p className={styles.subtitle()}>
                                <Image src={ICONS.TARGET_CIRCLE} alt="" width={18} height={18} className="shrink-0 opacity-80" />
                                と
                                <Image src={ICONS.TYPIST} alt="" width={18} height={18} className="shrink-0 opacity-80" />
                                で役割分担して隕石から星を守りぬけ
                            </p>
                        </motion.div>

                        <motion.div
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <MenuButton
                                onClick={() => !isReady && onToggleReady()}
                                active={isReady}
                                disabled={isReady}
                                activeBg="rgba(79,70,229,0.92)"
                                activeBorder="#6366f1"
                                activeText="#e0e7ff"
                                activeGlow="0 0 20px rgba(99,102,241,0.5)"
                            >
                                {isReady ? '✓ READY' : '▶ READY'}
                            </MenuButton>
                            {isHost && (
                                <MenuButton
                                    onClick={() => canStart && onStartGame()}
                                    active={canStart}
                                    disabled={!canStart}
                                    activeBg="rgba(79,70,229,0.9)"
                                    activeBorder="#6366f1"
                                    activeText="#e0e7ff"
                                    activeGlow="0 0 20px rgba(99,102,241,0.5)"
                                >
                                    {canStart ? '🚀 START' : '🔒 START'}
                                </MenuButton>
                            )}
                            {isHost && (
                                <MenuButton
                                    onClick={onExit}
                                    active={false}
                                    disabled={false}
                                    activeBg="rgba(34,197,94,0.92)"
                                    activeBorder="#22c55e"
                                    activeText="#dcfce7"
                                    activeGlow="0 0 16px rgba(34,197,94,0.4)"
                                    isExit
                                >
                                    ← EXIT
                                </MenuButton>
                            )}
                        </motion.div>
                    </div>

                    <div className="w-px self-stretch bg-linear-to-b from-transparent via-brand-500/30 to-transparent" />

                    <motion.div
                        className="flex flex-col gap-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <div className={styles.playerCard()}>
                            <p className={styles.playerCardTitle()}>Players {readyCount}/{totalUsers}</p>
                            <div className="flex flex-col gap-3">
                                {room.users.map((u: RoomUserWithReadyStatus) => {
                                    const isMe = u.userId === currentUserId
                                    const ranking = initialRankings.find((r) => r.userId === u.userId)
                                    const rankDisplay = ranking ? `${ranking.rank}位 ${Math.floor(ranking.points)}pt` : '--- 0pt'
                                    return (
                                        <div
                                            key={u.id}
                                            className="flex items-center gap-3"
                                            style={{
                                                ['--status-dot-color' as string]: u.isReady ? '#818cf8' : 'rgba(255,255,255,0.15)',
                                                ['--player-name-color' as string]: isMe ? '#ffffff' : 'rgba(255,255,255,0.65)',
                                            }}
                                        >
                                            <div className={styles.statusDot()} />
                                            <span className={styles.playerName()}>
                                                {u.user?.name ?? '...'}
                                                {isMe && <span className={styles.playerNameSuffix()}>(あなた)</span>}
                                            </span>
                                            <span className={styles.playerRank()}>{rankDisplay}</span>
                                            {u.isReady ? (
                                                <span className={styles.readyBadge()}>READY</span>
                                            ) : (
                                                <span className={styles.waitingBadge()}>---</span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className={styles.progressTrack()}>
                                <div
                                    className={styles.progressBar()}
                                    style={{ ['--progress-pct' as string]: `${totalUsers > 0 ? (readyCount / totalUsers) * 100 : 0}%` }}
                                />
                            </div>
                        </div>

                        <div className={styles.howToCard()}>
                            <p className={styles.howToTitle()}>How to Play</p>
                            <div className="flex flex-col gap-2.5">
                                {HOW_TO_PLAY.map(({ iconSrc, text }) => (
                                    <div key={text} className="flex items-start gap-2.5">
                                        <Image src={iconSrc} alt="" width={20} height={20} className="mt-0.5 shrink-0 opacity-90" />
                                        <span className={styles.howToText()}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

interface MenuButtonProps {
    children: React.ReactNode
    onClick: () => void
    active: boolean
    disabled: boolean
    activeBg: string
    activeBorder: string
    activeText: string
    activeGlow: string
    isExit?: boolean
}

function MenuButton({ children, onClick, active, disabled, activeBg, activeBorder, activeText, activeGlow, isExit }: MenuButtonProps) {
    const isDisabled = disabled && !isExit
    const styles = titleScreen()
    const btnVars = active
        ? { ['--btn-bg' as string]: activeBg, ['--btn-border' as string]: `2px solid ${activeBorder}`, ['--btn-color' as string]: activeText, ['--btn-glow' as string]: activeGlow }
        : isExit
          ? { ['--btn-bg' as string]: 'rgba(34,197,94,0.9)', ['--btn-border' as string]: '2px solid #22c55e', ['--btn-color' as string]: '#dcfce7', ['--btn-glow' as string]: '0 0 20px rgba(34,197,94,0.5)' }
          : { ['--btn-bg' as string]: 'rgba(45,42,66,0.92)', ['--btn-border' as string]: '2px solid #4a4a6a', ['--btn-color' as string]: '#9ca3af', ['--btn-glow' as string]: 'none' }
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                isDisabled ? styles.menuButtonDisabled() : styles.menuButton(),
                isDisabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
                !isDisabled && !isExit && 'hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]',
                !isDisabled && isExit && 'hover:scale-105 hover:bg-green-500 hover:border-green-400 active:scale-95',
            )}
            style={!isDisabled ? btnVars : undefined}
        >
            {children}
        </button>
    )
}
