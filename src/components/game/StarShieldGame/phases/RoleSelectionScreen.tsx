'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import { cn } from '@/lib/utils'
import { ProtectedStar } from './playing/ProtectedStar'
import { DinosaurWithBalls, AuroraGlow } from '../shared'
import {
    FONTS,
    COLORS,
    DIFFICULTIES,
    DIFFICULTY_META,
    ROLE_META,
    type Difficulty,
    type RoleChoice,
} from '../constants'

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

export function RoleSelectionScreen({
    room,
    roleChoices,
    onRoleChange,
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
            <DinosaurWithBalls size="w-28 h-28" />
            <AuroraGlow width={800} height={400} opacity={0.2} blur={60} />

            <div className="relative z-10 w-full max-w-2xl mx-auto px-6 py-10 flex flex-col gap-7">
                <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h2
                        className="text-4xl font-black leading-snug"
                        style={{
                            fontFamily: FONTS.CHERRY_BOMB,
                            background: 'linear-gradient(135deg, #c084fc 0%, #f472b6 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        [むずかしさ]と[やくわり]をきめよう。
                    </h2>
                </motion.div>

                <div className="grid grid-cols-[1fr_1fr] gap-5">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className={cn('rounded-2xl p-5 flex flex-col gap-3 transition-opacity', !isHost && 'opacity-70')}
                        style={{ background: COLORS.WHITE_03, border: `1px solid ${COLORS.WHITE_08}` }}
                    >
                        <p className="text-[11px]" style={{ fontFamily: FONTS.CHERRY_BOMB, color: COLORS.BRAND_6 }}>
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
                                        className={cn(
                                            'flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200',
                                            isHost ? 'cursor-pointer hover:scale-[1.02] hover:brightness-110' : 'cursor-default',
                                        )}
                                        style={{
                                            fontFamily: FONTS.CHERRY_BOMB,
                                            background: isActive ? meta.bg : 'transparent',
                                            border: `1.5px solid ${isActive ? meta.border : 'rgba(255,255,255,0.07)'}`,
                                            boxShadow: isActive ? meta.glow : 'none',
                                            color: isActive ? meta.text : COLORS.WHITE_2,
                                        }}
                                    >
                                        <span className="text-lg leading-none w-5 text-center shrink-0">{meta.emoji}</span>
                                        <span className="text-sm font-bold flex-1 text-left">{meta.label}</span>
                                        <span
                                            className="text-[10px] shrink-0 tabular-nums"
                                            style={{ fontFamily: FONTS.DOT_GOTHIC, color: isActive ? meta.text : COLORS.WHITE_15 }}
                                        >
                                            {meta.rate}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                        <p className="text-[10px] leading-relaxed mt-1" style={{ fontFamily: FONTS.CHERRY_BOMB, color: activeDiffMeta.text, opacity: 0.7 }}>
                            せいこうしたとき {activeDiffMeta.rate} もらえるよ。
                        </p>
                        {!isHost && (
                            <p className="text-[10px] mt-1" style={{ fontFamily: FONTS.CHERRY_BOMB, color: COLORS.WHITE_15 }}>
                                ほすとがせんたくちゅう…
                            </p>
                        )}
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
                                    className="rounded-2xl p-4 text-left transition-all duration-200 flex-1 cursor-pointer hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]"
                                    style={{
                                        background: isSelected ? meta.bg : 'rgba(255,255,255,0.02)',
                                        border: `1.5px solid ${isSelected ? meta.border : 'rgba(255,255,255,0.07)'}`,
                                        boxShadow: isSelected ? meta.glow : 'none',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <div className="relative w-6 h-6 shrink-0">
                                            <Image
                                                src={meta.iconSrc}
                                                alt={meta.label}
                                                fill
                                                className="object-contain"
                                                style={{ filter: isSelected ? undefined : 'opacity(0.35)' }}
                                            />
                                        </div>
                                        <span
                                            className="text-base font-bold"
                                            style={{ fontFamily: FONTS.CHERRY_BOMB, color: isSelected ? meta.text : COLORS.WHITE_35 }}
                                        >
                                            {meta.label}
                                        </span>
                                    </div>
                                    <p
                                        className="text-[11px] leading-snug mb-1"
                                        style={{ fontFamily: FONTS.DOT_GOTHIC, color: isSelected ? meta.text : COLORS.WHITE_25 }}
                                    >
                                        {meta.description}
                                    </p>
                                    <p
                                        className="text-[10px] leading-relaxed"
                                        style={{ fontFamily: FONTS.DOT_GOTHIC, color: isSelected ? `${meta.text}99` : COLORS.WHITE_15 }}
                                    >
                                        {meta.detail}
                                    </p>
                                </button>
                            )
                        })}
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="rounded-2xl px-5 py-4"
                    style={{
                        background: COLORS.BRAND_06,
                        border: canProceed ? `1px solid rgba(129,140,248,0.15)` : '1px solid rgba(248,113,113,0.4)',
                    }}
                >
                    <p
                        className="text-sm mb-3 min-h-5"
                        style={{
                            fontFamily: FONTS.CHERRY_BOMB,
                            color: canProceed ? 'rgba(134,239,172,0.95)' : 'rgba(248,113,113,0.95)',
                        }}
                    >
                        {canProceed ? 'じゅんびがととのったよ' : 'ちがうやくわりをえらんでね'}
                    </p>
                    <div className="flex flex-col gap-3">
                        {room.users.map((u: RoomUserWithReadyStatus) => {
                            const isMe = u.userId === currentUserId
                            const role = roleChoices[u.userId]
                            const roleMeta = role ? ROLE_META[role] : null
                            return (
                                <div key={u.id} className="flex items-center gap-3">
                                    <div
                                        className="w-2 h-2 rounded-full shrink-0"
                                        style={{ backgroundColor: roleMeta ? roleMeta.text : COLORS.WHITE_15 }}
                                    />
                                    <span
                                        className="text-sm flex-1 truncate"
                                        style={{ fontFamily: FONTS.DOT_GOTHIC, color: isMe ? '#ffffff' : COLORS.WHITE_5 }}
                                    >
                                        {u.user?.name ?? '...'}
                                        {isMe && (
                                            <span className="text-xs ml-1" style={{ fontFamily: FONTS.DOT_GOTHIC, color: COLORS.BRAND_5 }}>
                                                (あなた)
                                            </span>
                                        )}
                                    </span>
                                    {roleMeta ? (
                                        <span
                                            className="text-xs px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1"
                                            style={{
                                                fontFamily: FONTS.CHERRY_BOMB,
                                                color: roleMeta.text,
                                                background: roleMeta.bg,
                                                border: `1px solid ${roleMeta.border}`,
                                            }}
                                        >
                                            <span className="relative w-3.5 h-3.5 shrink-0 block">
                                                <Image src={roleMeta.iconSrc} alt="" fill className="object-contain" />
                                            </span>
                                            {roleMeta.label}
                                        </span>
                                    ) : (
                                        <span className="text-xs shrink-0" style={{ fontFamily: FONTS.CHERRY_BOMB, color: COLORS.WHITE_2 }}>
                                            せんたくちゅう…
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                <motion.div className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.25 }}>
                    {isHost && (
                        <button
                            onClick={onBack}
                            className="py-3 px-6 rounded-2xl border-2 border-green-500 bg-green-600/90 text-green-50 hover:bg-green-500 hover:border-green-400 hover:scale-105 active:scale-95 transition-all shrink-0 shadow-[0_0_20px_rgba(34,197,94,0.5)] cursor-pointer"
                            style={{ fontFamily: FONTS.CHERRY_BOMB, fontSize: '1rem' }}
                        >
                            ← EXIT
                        </button>
                    )}
                    {isHost && (
                        <button
                            onClick={() => canProceed && onProceedToGame()}
                            disabled={!canProceed}
                            className={cn(
                                'flex-1 py-3 px-6 rounded-2xl font-bold transition-all',
                                canProceed
                                    ? 'bg-indigo-600/90 text-indigo-100 border border-indigo-500 hover:bg-indigo-500/90 hover:scale-[1.02] active:scale-[0.98] cursor-pointer'
                                    : 'bg-gray-800/60 text-gray-500 border border-gray-700/50 cursor-not-allowed',
                            )}
                            style={{ fontFamily: FONTS.CHERRY_BOMB }}
                        >
                            {canProceed ? '🚀 START GAME' : '🔒 START GAME'}
                        </button>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
