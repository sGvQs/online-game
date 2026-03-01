'use client'

import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './ProtectedStar'

const CHERRY_BOMB_FONT = 'var(--font-cherry-bomb-one)'
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
    EASY:   { label: 'かんたん',   rate: '+1pt', emoji: '🌿', bg: 'rgba(134,239,172,0.12)', border: 'rgba(134,239,172,0.5)', text: '#86efac', glow: '0 0 12px rgba(134,239,172,0.4)' },
    NORMAL: { label: 'ふつう',     rate: '+2pt', emoji: '🌟', bg: 'rgba(253,224,71,0.12)',  border: 'rgba(253,224,71,0.5)',  text: '#fde047', glow: '0 0 12px rgba(253,224,71,0.4)'  },
    HARD:   { label: 'むずかしい', rate: '+3pt', emoji: '🔥', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.5)', text: '#f87171', glow: '0 0 12px rgba(248,113,113,0.4)' },
}

const ROLE_META: Record<RoleChoice, {
    emoji: string
    label: string
    description: string
    detail: string
    bg: string
    border: string
    text: string
    glow: string
}> = {
    SHOOTER: {
        emoji: '🎯',
        label: 'しゅーたー',
        description: 'カーソルをうごかして、いんせきをねらう',
        detail: 'たいぴすとがうった文字のぶんだけ、ねらったいんせきに弾がとぶよ。',
        bg: 'rgba(251,191,36,0.08)',
        border: 'rgba(251,191,36,0.35)',
        text: '#fbbf24',
        glow: '0 0 14px rgba(251,191,36,0.3)',
    },
    TYPIST: {
        emoji: '⌨️',
        label: 'たいぴすと',
        description: 'キャラクターのセリフをタイピング',
        detail: '1文字うつごとに1発、しゅーたーのねらったいんせきに弾がとぶよ。',
        bg: 'rgba(129,140,248,0.08)',
        border: 'rgba(129,140,248,0.35)',
        text: '#818cf8',
        glow: '0 0 14px rgba(129,140,248,0.3)',
    },
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

    const myRole = roleChoices[currentUserId]
    const activeDiffMeta = DIFFICULTY_META[difficulty]

    return (
        <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
            <ProtectedStar />

            {/* 中央オーロラグロー */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full pointer-events-none opacity-20"
                style={{
                    background: 'radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
            />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-7">

                {/* ── タイトル ── */}
                <motion.div
                    initial={{ opacity: 0, y: -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h2
                        className="text-4xl font-black leading-snug"
                        style={{
                            fontFamily: CHERRY_BOMB_FONT,
                            background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        むずかしさとろーるをきめよう。
                    </h2>
                    <p className="text-sm mt-1" style={{ fontFamily: CHERRY_BOMB_FONT, color: 'rgba(167,139,250,0.65)' }}>
                        ちがうろーるしかえらべないよ。
                    </p>
                </motion.div>

                {/* ── 2カラム: 難易度 + 役割説明 ── */}
                <div className="grid grid-cols-[1fr_1fr] gap-5">

                    {/* 難易度セレクター */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-2xl p-5 flex flex-col gap-3"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
                    >
                        <p className="text-[11px]" style={{ fontFamily: CHERRY_BOMB_FONT, color: 'rgba(129,140,248,0.6)' }}>
                            むずかしさ
                        </p>
                        <div className="flex flex-col gap-2">
                            {DIFFICULTIES.map((d) => {
                                const meta = DIFFICULTY_META[d]
                                const isActive = difficulty === d
                                return (
                                    <button
                                        key={d}
                                        onClick={() => isHost && onDifficultyChange(d)}
                                        disabled={!isHost}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 disabled:cursor-default cursor-pointer"
                                        style={{
                                            fontFamily: CHERRY_BOMB_FONT,
                                            background: isActive ? meta.bg : 'transparent',
                                            border: `1.5px solid ${isActive ? meta.border : 'rgba(255,255,255,0.07)'}`,
                                            boxShadow: isActive ? meta.glow : 'none',
                                            color: isActive ? meta.text : 'rgba(255,255,255,0.2)',
                                        }}
                                    >
                                        <span className="text-lg leading-none w-5 text-center shrink-0">{meta.emoji}</span>
                                        <span className="text-sm font-bold flex-1 text-left">{meta.label}</span>
                                        <span
                                            className="text-[10px] shrink-0 tabular-nums"
                                            style={{
                                                fontFamily: DOT_GOTHIC_FONT,
                                                color: isActive ? meta.text : 'rgba(255,255,255,0.15)',
                                            }}
                                        >
                                            {meta.rate}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>

                        {/* 難易度の説明 */}
                        <p
                            className="text-[10px] leading-relaxed mt-1"
                            style={{ fontFamily: CHERRY_BOMB_FONT, color: activeDiffMeta.text, opacity: 0.7 }}
                        >
                            せいこうしたとき {activeDiffMeta.rate} もらえるよ。
                        </p>

                        {!isHost && (
                            <p className="text-[10px] mt-1" style={{ fontFamily: CHERRY_BOMB_FONT, color: 'rgba(255,255,255,0.15)' }}>
                                ほすとがせんたくちゅう…
                            </p>
                        )}
                    </motion.div>

                    {/* 役割カード */}
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
                                    className="rounded-2xl p-4 text-left transition-all duration-200 flex-1"
                                    style={{
                                        background: isSelected ? meta.bg : 'rgba(255,255,255,0.02)',
                                        border: `1.5px solid ${isSelected ? meta.border : 'rgba(255,255,255,0.07)'}`,
                                        boxShadow: isSelected ? meta.glow : 'none',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-xl leading-none">{meta.emoji}</span>
                                        <span
                                            className="text-base font-bold"
                                            style={{ fontFamily: CHERRY_BOMB_FONT, color: isSelected ? meta.text : 'rgba(255,255,255,0.35)' }}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                    <p
                                        className="text-[11px] leading-snug mb-1"
                                        style={{ fontFamily: CHERRY_BOMB_FONT, color: isSelected ? meta.text : 'rgba(255,255,255,0.25)' }}
                                    >
                                        {meta.description}
                                    </p>
                                    <p
                                        className="text-[10px] leading-relaxed"
                                        style={{ fontFamily: CHERRY_BOMB_FONT, color: isSelected ? `${meta.text}99` : 'rgba(255,255,255,0.15)' }}
                                    >
                                        {meta.detail}
                                    </p>
                                </button>
                            )
                        })}
                    </motion.div>
                </div>

                {/* ── プレイヤーパネル ── */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-2xl px-5 py-4"
                    style={{ background: 'rgba(129,140,248,0.06)', border: '1px solid rgba(129,140,248,0.15)' }}
                >
                    {roleConflict && (
                        <p className="text-sm mb-3" style={{ fontFamily: CHERRY_BOMB_FONT, color: 'rgba(248,113,113,0.95)' }}>
                            ちがうろーるをえらんでね
                        </p>
                    )}
                    <div className="flex flex-col gap-3">
                        {room.users.map((u: RoomUserWithReadyStatus) => {
                            const isMe = u.userId === currentUserId
                            const role = roleChoices[u.userId]
                            const roleMeta = role ? ROLE_META[role] : null
                            return (
                                <div key={u.id} className="flex items-center gap-3">
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: roleMeta ? roleMeta.text : 'rgba(255,255,255,0.15)' }}
                                    />
                                    <span
                                        className="text-sm flex-1 truncate"
                                        style={{ fontFamily: DOT_GOTHIC_FONT, color: isMe ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
                                    >
                                        {u.user?.name ?? '...'}
                                        {isMe && (
                                            <span className="text-xs ml-1" style={{ fontFamily: DOT_GOTHIC_FONT, color: 'rgba(129,140,248,0.5)' }}>
                                                (あなた)
                                            </span>
                                        )}
                                    </span>
                                    {roleMeta ? (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full shrink-0"
                                            style={{
                                                fontFamily: CHERRY_BOMB_FONT,
                                                color: roleMeta.text,
                                                background: roleMeta.bg,
                                                border: `1px solid ${roleMeta.border}`,
                                            }}
                                        >
                                            {roleMeta.emoji} {roleMeta.label}
                                        </span>
                                    ) : (
                                        <span className="text-xs shrink-0" style={{ fontFamily: CHERRY_BOMB_FONT, color: 'rgba(255,255,255,0.2)' }}>
                                            せんたくちゅう…
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* ── ボタン ── */}
                <motion.div
                    className="flex gap-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                >
                    {isHost && (
                        <button
                            onClick={onBack}
                            className="py-3 px-5 rounded-2xl border border-white/15 bg-white/4 text-white/40 hover:text-white/60 hover:border-white/25 transition-all shrink-0"
                            style={{ fontFamily: CHERRY_BOMB_FONT, fontSize: '0.9rem' }}
                        >
                            ← もどる
                        </button>
                    )}
                    {isHost && (
                        <button
                            onClick={() => canProceed && onProceedToGame()}
                            disabled={!canProceed}
                            className={cn(
                                'flex-1 py-3 px-6 rounded-2xl font-bold transition-all',
                                canProceed
                                    ? 'bg-indigo-600/90 text-indigo-100 border border-indigo-500 hover:bg-indigo-500/90'
                                    : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 cursor-not-allowed'
                            )}
                            style={{ fontFamily: CHERRY_BOMB_FONT }}
                        >
                            {canProceed ? '🚀 げーむかいし' : '🔒 ろーるをきめてね'}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
