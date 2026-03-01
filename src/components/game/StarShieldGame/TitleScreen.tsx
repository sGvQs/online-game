'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import type { UserRanking } from '@/shared/types/game'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './ProtectedStar'
import { DINO_SPAWN, BULLET_COLOR } from '@/hooks/useStarShield'

const CHERRY_BOMB_FONT = 'var(--font-cherry-bomb-one)'
const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'
const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'

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
    { iconSrc: '/svg/object/target-circle.svg', text: '「シューター」は照準を隕石に合わせてエイム。' },
    { iconSrc: '/svg/object/keyboard.svg', text: '「タイピスト」はワードをタイプして弾を発射。' },
    { iconSrc: '/svg/charactor/annoying-dinosaur.svg', text: '90秒間、隕石の猛攻から星を守り抜けばクリア！' },
    { iconSrc: '/svg/object/fire.svg', text: '隕石が星に直撃するとゲームオーバー' },
]

/** 口から画面右上へ飛ぶ角度（rad）0=右、π/2=上 */
const BALL_ANGLE = Math.PI / 4
/** 画面外まで飛ばす距離（px） */
const BALL_DISTANCE = 2000

export function TitleScreen({
    room,
    isHost,
    isReady,
    allUsersReady,
    canStart,
    onToggleReady,
    onStartGame,
    onExit,
    currentUserId,
    initialRankings,
}: TitleScreenProps) {
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length

    const [balls, setBalls] = useState<{ id: number }[]>([])

    useEffect(() => {
        const spawn = () => {
            setBalls(b => [...b.slice(-3), { id: Date.now() + Math.random() }])
        }

        const schedule = () => {
            spawn()
            const delay = 1500 + Math.random() * 2500
            return setTimeout(schedule, delay)
        }
        const t = schedule()
        return () => clearTimeout(t)
    }, [])

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* ── 背景装飾 ── */}
            <ProtectedStar />

            {/* 恐竜 */}
            <div
                className="absolute z-10 pointer-events-none w-28 h-28"
                style={{
                    left: `${DINO_SPAWN.left}%`,
                    bottom: `${DINO_SPAWN.bottom}%`,
                    transform: 'translate(-50%, 50%) rotate(-0.5rad)',
                }}
            >
                <div className="relative w-full h-full">
                    <Image
                        src="/svg/charactor/annoying-dinosaur.svg"
                        alt="恐竜"
                        fill
                        className="object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]"
                    />
                </div>
            </div>

            {/* 恐竜が吐く赤い球（口から画面外まで） */}
            <div
                className="absolute z-9 pointer-events-none"
                style={{ left: `${DINO_SPAWN.left}%`, bottom: `${DINO_SPAWN.bottom}%`, transform: 'translate(-50%, 50%)' }}
            >
                <AnimatePresence>
                    {balls.map((b) => (
                        <motion.div
                            key={b.id}
                            className="absolute rounded-full"
                            style={{
                                width: 12,
                                height: 12,
                                left: 0,
                                top: 0,
                                backgroundColor: BULLET_COLOR,
                                boxShadow: `0 0 8px ${BULLET_COLOR}99`,
                            }}
                            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                            animate={{
                                x: Math.cos(BALL_ANGLE) * BALL_DISTANCE,
                                y: -Math.sin(BALL_ANGLE) * BALL_DISTANCE,
                                opacity: 0.4,
                                scale: 0.8,
                            }}
                            transition={{ duration: 1.8, ease: 'linear' }}
                            onAnimationComplete={() => {
                                setBalls(prev => prev.filter(x => x.id !== b.id))
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* 中央オーロラグロー */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full pointer-events-none opacity-25"
                style={{
                    background: 'radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
            />

            {/* ── メインコンテンツ ── */}
            <div className="relative z-10 w-full max-w-5xl mx-auto px-6 py-10 flex flex-col gap-8">

                {/* ── グリッド本体 ── */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-start">

                    {/* 左列：タイトル + メニュー */}
                    <div className="flex flex-col gap-5">

                        {/* タイトルロゴ */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <h1 className="leading-none select-none">
                                <span
                                    className="block text-[5.5rem] font-black leading-none"
                                    style={{
                                        fontFamily: RUBIK_PUDDLES_FONT,
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
                                        fontFamily: RUBIK_PUDDLES_FONT,
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
                            <p
                                className="flex gap-2 text-sm mt-3"
                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(167,139,250,0.7)' }}
                            >
                                <Image
                                    src="/svg/object/target-circle.svg"
                                    alt=""
                                    width={18}
                                    height={18}
                                    className="shrink-0 opacity-80"
                                />
                                と
                                <Image
                                    src="/svg/object/keyboard.svg"
                                    alt=""
                                    width={18}
                                    height={18}
                                    className="shrink-0 opacity-80"
                                />
                                で役割分担して隕石から星を守りぬけ
                            </p>
                        </motion.div>

                        {/* メニューボタン */}
                        <motion.div
                            className="flex flex-col gap-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            {/* READY */}
                            <MenuButton
                                onClick={() => !isReady && onToggleReady()}
                                active={isReady}
                                disabled={isReady}
                                activeBg="rgba(79,70,229,0.92)"
                                activeBorder="#6366f1"
                                activeText="#e0e7ff"
                                activeGlow="0 0 20px rgba(99,102,241,0.5)"
                            >
                                {isReady ? '✓ Ready!' : '▶ Ready'}
                            </MenuButton>

                            {/* START */}
                            {isHost && (
                                <MenuButton
                                    onClick={() => canStart && onStartGame()}
                                    active={canStart}
                                    disabled={!canStart}
                                    activeBg="rgba(109,40,217,0.92)"
                                    activeBorder="#8b5cf6"
                                    activeText="#ede9fe"
                                    activeGlow="0 0 20px rgba(139,92,246,0.5)"
                                >
                                    {canStart ? '🚀 Start Game!' : '🔒 Start Game'}
                                </MenuButton>
                            )}

                            {/* EXIT */}
                            {isHost && (
                                <MenuButton
                                    onClick={onExit}
                                    active={false}
                                    disabled={false}
                                    activeBg="rgba(185,28,28,0.92)"
                                    activeBorder="#dc2626"
                                    activeText="#fecaca"
                                    activeGlow="0 0 16px rgba(220,38,38,0.4)"
                                    isExit
                                >
                                    ← Exit
                                </MenuButton>
                            )}
                        </motion.div>
                    </div>

                    {/* 中央ディバイダー */}
                    <div className="w-px self-stretch bg-linear-to-b from-transparent via-brand-500/30 to-transparent" />

                    {/* 右列：プレイヤー + HOW TO PLAY */}
                    <motion.div
                        className="flex flex-col gap-6"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        {/* プレイヤーパネル */}
                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: 'rgba(129,140,248,0.05)',
                                border: '1px solid rgba(129,140,248,0.18)',
                            }}
                        >
                            <p
                                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(129,140,248,0.6)' }}
                            >
                                Players {readyCount}/{totalUsers}
                            </p>

                            <div className="flex flex-col gap-3">
                                {room.users.map((u: RoomUserWithReadyStatus) => {
                                    const isMe = u.userId === currentUserId
                                    const ranking = initialRankings.find((r) => r.userId === u.userId)
                                    const rankDisplay = ranking
                                        ? `${ranking.rank}位 ${Math.floor(ranking.points)}pt`
                                        : '--- 0pt'
                                    return (
                                        <div key={u.id} className="flex items-center gap-3">
                                            {/* アバタードット */}
                                            <div
                                                className="w-2 h-2 rounded-full shrink-0 transition-colors duration-300"
                                                style={{ backgroundColor: u.isReady ? '#818cf8' : 'rgba(255,255,255,0.15)' }}
                                            />
                                            {/* 名前 */}
                                            <span
                                                className="text-base flex-1 truncate"
                                                style={{
                                                    fontFamily: CHERRY_BOMB_FONT,
                                                    color: isMe ? '#ffffff' : 'rgba(255,255,255,0.65)',
                                                }}
                                            >
                                                {u.user?.name ?? '...'}
                                                {isMe && (
                                                    <span className="text-xs text-brand-500/50 ml-1" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                                                        (あなた)
                                                    </span>
                                                )}
                                            </span>
                                            {/* ランキング・pt */}
                                            <span
                                                className="text-xs shrink-0 tabular-nums"
                                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(192,132,252,0.8)' }}
                                            >
                                                {rankDisplay}
                                            </span>
                                            {/* READYバッジ */}
                                            {u.isReady ? (
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full"
                                                    style={{
                                                        fontFamily: CHERRY_BOMB_FONT,
                                                        color: '#818cf8',
                                                        background: 'rgba(129,140,248,0.15)',
                                                        border: '1px solid rgba(129,140,248,0.4)',
                                                    }}
                                                >
                                                    Ready!
                                                </span>
                                            ) : (
                                                <span
                                                    className="text-xs"
                                                    style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(255,255,255,0.2)' }}
                                                >
                                                    ---
                                                </span>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Ready progress bar */}
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

                        {/* HOW TO PLAY */}
                        <div
                            className="rounded-2xl p-5"
                            style={{
                                background: 'rgba(192,132,252,0.05)',
                                border: '1px solid rgba(192,132,252,0.18)',
                            }}
                        >
                            <p
                                className="text-[10px] tracking-[0.4em] uppercase mb-4"
                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(192,132,252,0.6)' }}
                            >
                                How to Play
                            </p>
                            <div className="flex flex-col gap-2.5">
                                {HOW_TO_PLAY.map(({ iconSrc, text }) => (
                                    <div key={text} className="flex items-start gap-2.5">
                                        <Image
                                            src={iconSrc}
                                            alt=""
                                            width={20}
                                            height={20}
                                            className="mt-0.5 shrink-0 opacity-90"
                                        />
                                        <span
                                            className="text-xs leading-5"
                                            style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(203,213,225,0.7)' }}
                                        >
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

/* ── メニューボタンコンポーネント ── */
const INACTIVE_BG = 'rgba(45,42,66,0.92)'
const INACTIVE_BORDER = '#4a4a6a'
const INACTIVE_TEXT = '#9ca3af'
const HOVER_BG = 'rgba(61,58,82,0.92)'
const EXIT_BG = 'rgba(127,29,29,0.92)'
const EXIT_BORDER = '#991b1b'
const EXIT_TEXT = '#fca5a5'
const EXIT_HOVER_BG = 'rgba(153,27,27,0.92)'

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
    const bg = active ? activeBg : (isExit ? EXIT_BG : INACTIVE_BG)
    const border = active ? activeBorder : (isExit ? EXIT_BORDER : INACTIVE_BORDER)
    const textColor = active ? activeText : (isExit ? EXIT_TEXT : INACTIVE_TEXT)
    const hoverBg = isExit ? EXIT_HOVER_BG : HOVER_BG

    return (
        <button
            onClick={onClick}
            disabled={disabled && !isExit}
            className={cn(
                'group relative flex items-center gap-2 px-4 py-2 rounded-xl text-left',
                'transition-all duration-200 select-none',
                disabled && !isExit ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
            )}
            style={{
                fontFamily: CHERRY_BOMB_FONT,
                fontSize: '1.1rem',
                background: bg,
                border: `1.5px solid ${border}`,
                color: textColor,
                boxShadow: active ? activeGlow : 'none',
            }}
            onMouseEnter={e => {
                if (disabled && !isExit) return
                const el = e.currentTarget as HTMLButtonElement
                if (!active) {
                    el.style.background = hoverBg
                    el.style.borderColor = isExit ? '#dc2626' : '#6b6b8a'
                    el.style.color = isExit ? '#fecaca' : '#d1d5db'
                }
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = bg
                el.style.borderColor = border
                el.style.color = textColor
            }}
        >
            {children}
        </button>
    )
}
