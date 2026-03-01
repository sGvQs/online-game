'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './ProtectedStar'

const CHERRY_BOMB_FONT = 'var(--font-cherry-bomb-one)'
const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'

type Difficulty = 'EASY' | 'NORMAL' | 'HARD'

interface TitleScreenProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    isReady: boolean
    allUsersReady: boolean
    difficulty: Difficulty
    onToggleReady: () => void
    onStartGame: () => void
    onExit: () => void
    onDifficultyChange: (d: Difficulty) => void
    currentUserId: string
}

const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD']

const DIFFICULTY_META: Record<Difficulty, { label: string; rate: string; bg: string; border: string; text: string; glow: string; emoji: string }> = {
    EASY:   { label: 'EASY',   rate: '0.5/s', emoji: '🌿', bg: 'rgba(134,239,172,0.12)', border: 'rgba(134,239,172,0.5)', text: '#86efac', glow: '0 0 12px rgba(134,239,172,0.4)' },
    NORMAL: { label: 'NORMAL', rate: '1/s',   emoji: '🌟', bg: 'rgba(253,224,71,0.12)',  border: 'rgba(253,224,71,0.5)',  text: '#fde047', glow: '0 0 12px rgba(253,224,71,0.4)'  },
    HARD:   { label: 'HARD',   rate: '1.5/s', emoji: '🔥', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.5)', text: '#f87171', glow: '0 0 12px rgba(248,113,113,0.4)' },
}

const SPEC_CHIPS = [
    { icon: '🛸', title: '2 Player Co-op', sub: 'チームで守れ' },
    { icon: '☄️', title: 'Meteor Defense', sub: '隕石を全部壊す' },
    { icon: '⭐', title: 'Protect the Star', sub: '星に触れたらゲームオーバー' },
]

const HOW_TO_PLAY = [
    { icon: '🎯', text: 'Shooter がエイムして自動射撃' },
    { icon: '⌨️', text: 'Typist がタイプして弾を撃つ' },
    { icon: '☄️', text: '隕石を全て破壊せよ' },
    { icon: '⏱️', text: '制限時間 90 秒' },
]

export function TitleScreen({
    room,
    isHost,
    isReady,
    allUsersReady,
    difficulty,
    onToggleReady,
    onStartGame,
    onExit,
    onDifficultyChange,
    currentUserId,
}: TitleScreenProps) {
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            {/* ── 背景装飾 ── */}
            <ProtectedStar />

            {/* 恐竜 */}
            <div
                className="absolute z-10 pointer-events-none w-28 h-28"
                style={{ left: '10%', bottom: '14%', transform: 'translate(-50%, 50%) rotate(-0.5rad)' }}
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

                {/* スペックチップ行（LPHero 風） */}
                <motion.div
                    className="flex gap-3 flex-wrap justify-center"
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {SPEC_CHIPS.map(({ icon, title, sub }) => (
                        <div
                            key={title}
                            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl"
                            style={{
                                background: 'rgba(129,140,248,0.07)',
                                border: '1px solid rgba(129,140,248,0.22)',
                            }}
                        >
                            <span className="text-base leading-none">{icon}</span>
                            <div className="text-left">
                                <p className="text-[11px] font-bold text-brand-400" style={{ fontFamily: DOT_GOTHIC_FONT }}>{title}</p>
                                <p className="text-[9px] text-brand-600 mt-0.5" style={{ fontFamily: DOT_GOTHIC_FONT }}>{sub}</p>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* ── グリッド本体 ── */}
                <div className="grid grid-cols-[1fr_auto_1fr] gap-10 items-start">

                    {/* 左列：タイトル + メニュー + 難度 */}
                    <div className="flex flex-col gap-8">

                        {/* タイトルロゴ */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                        >
                            <p
                                className="text-xs mb-3 tracking-[0.4em] uppercase"
                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(192,132,252,0.7)' }}
                            >
                                2 Player Co-op Shooting
                            </p>
                            <h1 className="leading-none select-none">
                                <span
                                    className="block text-[5.5rem] font-black leading-none"
                                    style={{
                                        fontFamily: CHERRY_BOMB_FONT,
                                        background: 'linear-gradient(135deg, #fff 0%, #c084fc 50%, #f472b6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 0 30px rgba(192,132,252,0.6))',
                                    }}
                                >
                                    Star
                                </span>
                                <span
                                    className="block text-[5.5rem] font-black leading-none -mt-2"
                                    style={{
                                        fontFamily: CHERRY_BOMB_FONT,
                                        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #f472b6 100%)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        backgroundClip: 'text',
                                        filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.6))',
                                    }}
                                >
                                    Shield
                                </span>
                            </h1>
                            <p
                                className="text-sm mt-3"
                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(167,139,250,0.7)' }}
                            >
                                ☄️ 隕石から星を守りぬけ ⭐
                            </p>
                        </motion.div>

                        {/* メニューボタン */}
                        <motion.div
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            {/* READY */}
                            <MenuButton
                                onClick={() => !isReady && onToggleReady()}
                                active={isReady}
                                disabled={isReady}
                                activeColor="rgba(129,140,248,1)"
                                activeGlow="rgba(129,140,248,0.5)"
                                activeBg="rgba(129,140,248,0.18)"
                            >
                                {isReady ? '✓ Ready!' : '▶ Ready'}
                            </MenuButton>

                            {/* START */}
                            {isHost && (
                                <MenuButton
                                    onClick={() => allUsersReady && onStartGame()}
                                    active={allUsersReady}
                                    disabled={!allUsersReady}
                                    activeColor="rgba(192,132,252,1)"
                                    activeGlow="rgba(192,132,252,0.5)"
                                    activeBg="rgba(192,132,252,0.18)"
                                >
                                    {allUsersReady ? '🚀 Start Game!' : '🔒 Start Game'}
                                </MenuButton>
                            )}

                            {/* EXIT */}
                            {isHost && (
                                <MenuButton
                                    onClick={onExit}
                                    active={false}
                                    disabled={false}
                                    activeColor="rgba(248,113,113,1)"
                                    activeGlow="rgba(248,113,113,0.4)"
                                    activeBg="rgba(248,113,113,0.12)"
                                    isExit
                                >
                                    ← Exit
                                </MenuButton>
                            )}
                        </motion.div>

                        {/* 難度セレクター */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.7 }}
                        >
                            <p
                                className="text-[10px] tracking-[0.4em] uppercase mb-3"
                                style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(129,140,248,0.5)' }}
                            >
                                Difficulty
                            </p>
                            <div className="flex gap-2">
                                {DIFFICULTIES.map((d) => {
                                    const meta = DIFFICULTY_META[d]
                                    const isActive = difficulty === d
                                    return (
                                        <button
                                            key={d}
                                            onClick={() => isHost && onDifficultyChange(d)}
                                            disabled={!isHost}
                                            className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 cursor-pointer disabled:cursor-default"
                                            style={{
                                                fontFamily: CHERRY_BOMB_FONT,
                                                background: isActive ? meta.bg : 'rgba(255,255,255,0.03)',
                                                border: `1.5px solid ${isActive ? meta.border : 'rgba(255,255,255,0.1)'}`,
                                                boxShadow: isActive ? meta.glow : 'none',
                                                color: isActive ? meta.text : 'rgba(255,255,255,0.25)',
                                                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                                            }}
                                        >
                                            <span className="text-base leading-none">{meta.emoji}</span>
                                            <span className="text-sm font-bold">{meta.label}</span>
                                            <span className="text-[9px] opacity-70" style={{ fontFamily: DOT_GOTHIC_FONT }}>{meta.rate}/s</span>
                                        </button>
                                    )
                                })}
                            </div>
                            {!isHost && (
                                <p className="text-[10px] mt-2 text-white/20" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                                    ホストが選択中…
                                </p>
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
                                {HOW_TO_PLAY.map(({ icon, text }) => (
                                    <div key={text} className="flex items-start gap-2.5">
                                        <span className="text-sm leading-none mt-0.5 shrink-0">{icon}</span>
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
interface MenuButtonProps {
    children: React.ReactNode
    onClick: () => void
    active: boolean
    disabled: boolean
    activeColor: string
    activeGlow: string
    activeBg: string
    isExit?: boolean
}

function MenuButton({ children, onClick, active, disabled, activeColor, activeGlow, activeBg, isExit }: MenuButtonProps) {
    const baseColor = isExit ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.35)'
    const hoverBg = isExit ? 'rgba(248,113,113,0.08)' : 'rgba(255,255,255,0.04)'

    return (
        <button
            onClick={onClick}
            disabled={disabled && !isExit}
            className={cn(
                'group relative flex items-center gap-3 px-6 py-3.5 rounded-2xl text-left',
                'transition-all duration-200 select-none',
                disabled && !isExit ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer',
            )}
            style={{
                fontFamily: CHERRY_BOMB_FONT,
                fontSize: '1.6rem',
                background: active ? activeBg : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${active ? activeColor : (isExit ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.1)')}`,
                color: active ? activeColor : baseColor,
                boxShadow: active ? `0 0 16px ${activeGlow}` : 'none',
            }}
            onMouseEnter={e => {
                if (disabled && !isExit) return
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = active ? activeBg : hoverBg
                el.style.borderColor = active ? activeColor : (isExit ? 'rgba(248,113,113,0.5)' : 'rgba(255,255,255,0.2)')
                el.style.color = active ? activeColor : (isExit ? 'rgba(248,113,113,0.9)' : 'rgba(255,255,255,0.8)')
            }}
            onMouseLeave={e => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = active ? activeBg : 'rgba(255,255,255,0.03)'
                el.style.borderColor = active ? activeColor : (isExit ? 'rgba(248,113,113,0.25)' : 'rgba(255,255,255,0.1)')
                el.style.color = active ? activeColor : baseColor
            }}
        >
            {children}
        </button>
    )
}
