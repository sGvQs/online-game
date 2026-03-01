'use client'

import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './ProtectedStar'

const CHERRY_BOMB_FONT = 'var(--font-cherry-bomb-one)'
const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'
const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'

type Difficulty = 'EASY' | 'NORMAL' | 'HARD'
type RoleChoice = 'SHOOTER' | 'TYPIST'

interface RoleSelectionScreenProps {
    room: RoomWithUsersAndReadyStatus
    roleChoices: Record<string, RoleChoice>
    onRoleChange: (role: RoleChoice) => void
    roleConflict: boolean
    canProceed: boolean
    onProceedToGame: () => void
    onBack: () => void
    currentUserId: string
    difficulty: Difficulty
    onDifficultyChange: (d: Difficulty) => void
    isHost: boolean
}

const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD']

const DIFFICULTY_META: Record<Difficulty, { label: string; rate: string; bg: string; border: string; text: string; glow: string; emoji: string }> = {
    EASY: { label: 'かんたん', rate: '+1pt', emoji: '🌿', bg: 'rgba(134,239,172,0.12)', border: 'rgba(134,239,172,0.5)', text: '#86efac', glow: '0 0 12px rgba(134,239,172,0.4)' },
    NORMAL: { label: 'ふつう', rate: '+2pt', emoji: '🌟', bg: 'rgba(253,224,71,0.12)', border: 'rgba(253,224,71,0.5)', text: '#fde047', glow: '0 0 12px rgba(253,224,71,0.4)' },
    HARD: { label: 'むずかしい', rate: '+3pt', emoji: '🔥', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.5)', text: '#f87171', glow: '0 0 12px rgba(248,113,113,0.4)' },
}

export function RoleSelectionScreen({
    room,
    roleChoices,
    onRoleChange,
    roleConflict,
    canProceed,
    onProceedToGame,
    onBack,
    currentUserId,
    difficulty,
    onDifficultyChange,
    isHost,
}: RoleSelectionScreenProps) {

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />

            {/* 中央オーロラグロー */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] rounded-full pointer-events-none opacity-25"
                style={{
                    background:
                        'radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                    filter: 'blur(50px)',
                }}
            />

            <div className="relative z-10 w-full max-w-lg mx-auto px-6 py-10 flex flex-col gap-8">
                {/* タイトル */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h2
                        className="text-3xl font-black"
                        style={{
                            fontFamily: RUBIK_PUDDLES_FONT,
                            background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        役職を決めよう
                    </h2>
                    <p
                        className="text-sm mt-2"
                        style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(167,139,250,0.7)' }}
                    >
                        お互いに違う役職を選んでね
                    </p>
                </motion.div>

                {/* 難易度セレクター */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
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
                                    className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-2xl transition-all duration-200 cursor-pointer disabled:cursor-default w-[100px]"
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
                                    <span className="text-[9px] opacity-70" style={{ fontFamily: DOT_GOTHIC_FONT }}>{meta.rate}</span>
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

                {/* プレイヤー & 役職選択 */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="rounded-2xl p-6"
                    style={{
                        background: 'rgba(129,140,248,0.08)',
                        border: '1px solid rgba(129,140,248,0.2)',
                    }}
                >
                    {roleConflict && (
                        <p
                            className="text-sm mb-4"
                            style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(248,113,113,0.95)' }}
                        >
                            お互いに違う役職を選んでください
                        </p>
                    )}

                    <div className="flex flex-col gap-4">
                        {room.users.map((u: RoomUserWithReadyStatus) => {
                            const isMe = u.userId === currentUserId
                            const myRole = roleChoices[u.userId]
                            return (
                                <div key={u.id} className="flex items-center gap-4">
                                    <div
                                        className="w-3 h-3 rounded-full shrink-0"
                                        style={{ backgroundColor: '#818cf8' }}
                                    />
                                    <span
                                        className="text-base flex-1 truncate"
                                        style={{
                                            fontFamily: CHERRY_BOMB_FONT,
                                            color: isMe ? '#ffffff' : 'rgba(255,255,255,0.7)',
                                        }}
                                    >
                                        {u.user?.name ?? '...'}
                                        {isMe && (
                                            <span
                                                className="text-xs text-brand-500/50 ml-1"
                                                style={{ fontFamily: DOT_GOTHIC_FONT }}
                                            >
                                                (あなた)
                                            </span>
                                        )}
                                    </span>
                                    {isMe ? (
                                        <div className="flex gap-2 shrink-0">
                                            {(['SHOOTER', 'TYPIST'] as const).map((r) => (
                                                <button
                                                    key={r}
                                                    onClick={() => onRoleChange(r)}
                                                    className={cn(
                                                        'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                                                        myRole === r
                                                            ? 'bg-brand-500/30 text-brand-300 border border-brand-500/50'
                                                            : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/25'
                                                    )}
                                                    style={{ fontFamily: DOT_GOTHIC_FONT }}
                                                >
                                                    {r === 'SHOOTER' ? '🎯 Shooter' : '⌨️ Typist'}
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <span
                                            className="text-sm shrink-0"
                                            style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(192,132,252,0.8)' }}
                                        >
                                            {myRole === 'SHOOTER' ? '🎯 Shooter' : myRole === 'TYPIST' ? '⌨️ Typist' : '選択中...'}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* ボタン */}
                <motion.div
                    className="flex flex-col gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    {isHost && (
                        <button
                            onClick={() => canProceed && onProceedToGame()}
                            disabled={!canProceed}
                            className={cn(
                                'w-full py-3.5 px-6 rounded-2xl font-bold transition-all',
                                canProceed
                                    ? 'bg-indigo-600/90 text-indigo-100 border border-indigo-500 hover:bg-indigo-500/90'
                                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 cursor-not-allowed'
                            )}
                            style={{ fontFamily: CHERRY_BOMB_FONT }}
                        >
                            {canProceed ? '🚀 ゲーム開始' : '🔒 役職を決めてね'}
                        </button>
                    )}
                    <button
                        onClick={onBack}
                        className="w-full py-3 px-6 rounded-2xl font-bold border border-white/20 bg-white/5 text-gray-300 hover:bg-white/10 transition-all"
                        style={{ fontFamily: DOT_GOTHIC_FONT }}
                    >
                        ← 戻る
                    </button>
                </motion.div>
            </div>
        </div>
    )
}
