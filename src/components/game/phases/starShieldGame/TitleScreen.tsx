'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/DinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/AuroraGlow'
import { FONTS, COLORS, ICONS } from '@/constants/starShieldGame/constants'

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
                                <span
                                    className="block text-[5.5rem] font-black leading-none"
                                    style={{
                                        fontFamily: FONTS.RUBIK_PUDDLES,
                                        background: 'linear-gradient(135deg, #fff 0%, #c084fc 50%, #f472b6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 0 30px rgba(192,132,252,0.6))',
                                    }}
                                >
                                    STAR
                                </span>
                                <span
                                    className="block text-[5.5rem] font-black leading-none -mt-2"
                                    style={{
                                        fontFamily: FONTS.RUBIK_PUDDLES,
                                        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #f472b6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.6))',
                                    }}
                                >
                                    SHIELD
                                </span>
                            </h1>
                            <p className="flex gap-2 text-sm mt-3" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.VIOLET_7 }}>
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
                        <div
                            className="rounded-2xl p-5"
                            style={{ background: COLORS.BRAND_05, border: `1px solid ${COLORS.BRAND_18}` }}
                        >
                            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.BRAND_6 }}>
                                Players {readyCount}/{totalUsers}
                            </p>
                            <div className="flex flex-col gap-3">
                                {room.users.map((u: RoomUserWithReadyStatus) => {
                                    const isMe = u.userId === currentUserId
                                    const ranking = initialRankings.find((r) => r.userId === u.userId)
                                    const rankDisplay = ranking ? `${ranking.rank}位 ${Math.floor(ranking.points)}pt` : '--- 0pt'
                                    return (
                                        <div key={u.id} className="flex items-center gap-3">
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0 transition-colors duration-300"
                                                style={{ backgroundColor: u.isReady ? '#818cf8' : COLORS.WHITE_15 }}
                                            />
                                            <span
                                                className="text-base flex-1 truncate"
                                                style={{
                                                    fontFamily: FONTS.DOT_GOTHIC,
                                                    color: isMe ? '#ffffff' : 'rgba(255,255,255,0.65)',
                                                }}
                                            >
                                                {u.user?.name ?? '...'}
                                                {isMe && (
                                                    <span className="text-xs text-brand-500/50 ml-1" style={{ fontFamily: FONTS.DOT_GOTHIC }}>
                                                        (あなた)
                                                    </span>
                                                )}
                                            </span>
                                            <span className="text-xs shrink-0 tabular-nums" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.PURPLE_8 }}>
                                                {rankDisplay}
                                            </span>
                                            {u.isReady ? (
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        fontFamily: FONTS.CHERRY_BOMB,
                                                        color: '#818cf8',
                                                        background: COLORS.BRAND_15,
                                                        border: `1px solid ${COLORS.BRAND_4}`,
                                                    }}
                                                >
                                                    READY
                                                </span>
                                            ) : (
                                                <span className="text-xs" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.WHITE_2 }}>
                                                    ---
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${totalUsers > 0 ? (readyCount / totalUsers) * 100 : 0}%`,
                                        background: 'linear-gradient(90deg, #818cf8, #c084fc)',
                                        boxShadow: '0 0 8px rgba(129,140,248,0.6)',
                                    }}
                                />
                            </div>
                        </div>

                        <div
                            className="rounded-2xl p-5"
                            style={{ background: COLORS.PURPLE_05, border: `1px solid ${COLORS.PURPLE_18}` }}
                        >
                            <p className="text-[10px] tracking-[0.4em] uppercase mb-4" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.PURPLE_6 }}>
                                How to Play
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {HOW_TO_PLAY.map(({ iconSrc, text }) => (
                                    <div key={text} className="flex items-start gap-2.5">
                                        <Image src={iconSrc} alt="" width={20} height={20} className="mt-0.5 shrink-0 opacity-90" />
                                        <span className="text-xs leading-5" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.SLATE_7 }}>
                                            {text}
                                        </span>
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
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={cn(
                'py-3 px-6 rounded-2xl font-bold text-left transition-all duration-200 select-none',
                isDisabled ? 'opacity-30 cursor-not-allowed bg-gray-800/60 text-gray-500 border-2 border-gray-700/50' : 'cursor-pointer',
                !isDisabled && !isExit && 'hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]',
                !isDisabled && isExit && 'hover:scale-105 hover:bg-green-500 hover:border-green-400 active:scale-95',
            )}
            style={{
                fontFamily: FONTS.CHERRY_BOMB,
                fontSize: '1rem',
                ...(active
                    ? { background: activeBg, border: `2px solid ${activeBorder}`, color: activeText, boxShadow: activeGlow }
                    : isExit
                      ? { background: 'rgba(34,197,94,0.9)', border: '2px solid #22c55e', color: '#dcfce7', boxShadow: '0 0 20px rgba(34,197,94,0.5)' }
                      : { background: 'rgba(45,42,66,0.92)', border: '2px solid #4a4a6a', color: '#9ca3af', boxShadow: 'none' }),
            }}
        >
            {children}
        </button>
    )
}
