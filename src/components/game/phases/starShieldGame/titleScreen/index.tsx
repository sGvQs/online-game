'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/types'
import type { UserRanking } from '@/types'
import type { PairRanking } from '@/server/actions/game/starShieldRankingActions'
import { Button } from '@/components/ui/button'
import { ProtectedStar } from '../playing/protectedStar'
import { DinosaurWithBalls } from '@/components/game/common/starShield/dinosaurWithBalls'
import { AuroraGlow } from '@/components/game/common/starShield/auroraGlow'
import { titleScreen } from './styles'
import { Typography } from '@/components/ui/typography'
import { ICONS } from '@/constants/starShieldGame/constants'
import { getMyStarShieldProgress } from '@/server/actions/game'

interface TitleScreenProps {
    room: RoomWithUsersAndReadyStatus
    roomId: string
    isHost: boolean
    isReady: boolean
    allUsersReady: boolean
    canStart: boolean
    onToggleReady: () => void | Promise<void>
    onStartGame: () => void
    onExit: () => void
    currentUserId: string
    initialRankings: UserRanking[]
    memberPairRank?: PairRanking | null
}

const HOW_TO_PLAY = [
    { iconSrc: ICONS.TARGET_CIRCLE, text: '「シューター」は照準を隕石に合わせてエイム。' },
    { iconSrc: ICONS.TYPIST, text: '「タイピスト」はワードをタイプして弾を発射。' },
    { iconSrc: ICONS.DINO, text: '90秒間、隕石の猛攻から星を守り抜けばクリア！' },
    { iconSrc: ICONS.FIRE, text: '隕石が星に直撃するとゲームオーバー' },
]

export function TitleScreen({
    room,
    roomId,
    isHost,
    isReady,
    canStart,
    onToggleReady,
    onStartGame,
    onExit,
    currentUserId,
    initialRankings,
    memberPairRank,
}: TitleScreenProps) {
    const router = useRouter()
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const styles = titleScreen()
    const [typingCount, setTypingCount] = useState<number>(0)

    useEffect(() => {
        getMyStarShieldProgress()
            .then((p) => setTypingCount(p.totalTypingCount ?? 0))
            .catch(() => {})
    }, [])

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
                            <Typography variant="display" className="leading-none select-none">
                                <span className={styles.titleStar()}>STAR</span>
                                <span className={styles.titleShield()}>SHIELD</span>
                            </Typography>
                            <Typography variant="small" className={styles.subtitle()}>
                                <Image src={ICONS.TARGET_CIRCLE} alt="" width={18} height={18} className="shrink-0 opacity-80" />
                                と
                                <Image src={ICONS.TYPIST} alt="" width={18} height={18} className="shrink-0 opacity-80" />
                                で役割分担して隕石から星を守りぬけ
                            </Typography>
                        </motion.div>

                        <motion.div
                            className="flex flex-col gap-3"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <Button
                                screen="star-shield"
                                variant={isReady ? 'primary' : 'solid'}
                                size="lg"
                                onClick={() => !isReady && onToggleReady()}
                                disabled={isReady}
                                className="w-full justify-start"
                            >
                                {isReady ? '✓ READY' : '▶ READY'}
                            </Button>
                            <Link
                                href={`/game/${roomId}/star-shield/skill`}
                                onClick={async (e) => {
                                    if (isReady) {
                                        e.preventDefault()
                                        await onToggleReady()
                                        router.push(`/game/${roomId}/star-shield/skill`)
                                    }
                                }}
                                className="flex w-full items-center justify-start gap-2 py-3 px-6 rounded-2xl font-bold transition-all font-cherry-bomb-one text-left bg-amber-600/30 border-2 border-amber-500/50 text-amber-200 hover:bg-amber-500/40 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                            >
                                <span>⚙️</span>
                                <span>SKILL</span>
                            </Link>
                            {isHost && (
                                <Button
                                    screen="star-shield"
                                    variant={canStart ? 'primary' : 'solid'}
                                    size="lg"
                                    onClick={() => canStart && onStartGame()}
                                    disabled={!canStart}
                                    className="w-full justify-start"
                                >
                                    {canStart ? '🚀 START' : '🔒 START'}
                                </Button>
                            )}
                            {isHost && (
                                <Button
                                    screen="star-shield"
                                    variant="success"
                                    size="lg"
                                    onClick={onExit}
                                    className="w-full justify-start"
                                >
                                    ← EXIT
                                </Button>
                            )}
                        </motion.div>
                    </div>

                    <div className="w-px self-stretch bg-linear-to-b from-transparent via-brand-500/30 to-transparent" />

                    <motion.div
                        className="flex flex-col gap-2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                    >
                        <div className="rounded-2xl p-4 bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)] flex items-center gap-3">
                            <Image src={ICONS.TYPIST} alt="Typing" width={28} height={28} className="shrink-0 opacity-90" />
                            <span className="text-xl font-bold tabular-nums text-white/90">{typingCount.toLocaleString()}</span>
                        </div>
                        <Link href={`/game/${roomId}/star-shield/ranking`} className={styles.pairRankBadge()}>
                            <span className="text-base shrink-0">🏆</span>
                            {memberPairRank ? (
                                <>
                                    <span className="text-xs font-bold tabular-nums text-purple-300 shrink-0">#{memberPairRank.rank}位</span>
                                    <span className="text-xs text-white/70 truncate">
                                        {memberPairRank.shooterName} &amp; {memberPairRank.typistName}
                                    </span>
                                    <span className="text-xs font-bold tabular-nums text-white/90 shrink-0 ml-auto">{memberPairRank.bestDestroyedCount}個</span>
                                </>
                            ) : (
                                <span className="text-xs text-white/60 group-hover:text-white/80 transition-colors">ランキングを見る →</span>
                            )}
                        </Link>
                        <div className={styles.playerCard()}>
                            <Typography variant="h4" className={styles.playerCardTitle()}>Players {readyCount}/{totalUsers}</Typography>
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
                                            <Typography variant="small" as="span" className={styles.playerName()}>
                                                {u.user?.name ?? '...'}
                                                {isMe && <Typography variant="caption" as="span" className={styles.playerNameSuffix()}>(あなた)</Typography>}
                                            </Typography>
                                            <Typography variant="label" as="span" className={styles.playerRank()}>{rankDisplay}</Typography>
                                            {u.isReady ? (
                                                <Typography variant="label" as="span" className={styles.readyBadge()}>READY</Typography>
                                            ) : (
                                                <Typography variant="label" as="span" className={styles.waitingBadge()}>---</Typography>
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
                            <Typography variant="h4" className={styles.howToTitle()}>How to Play</Typography>
                            <div className="flex flex-col gap-2.5">
                                {HOW_TO_PLAY.map(({ iconSrc, text }) => (
                                    <div key={text} className="flex items-start gap-2.5">
                                        <Image src={iconSrc} alt="" width={20} height={20} className="mt-0.5 shrink-0 opacity-90" />
                                        <Typography variant="body" as="span" className={styles.howToText()}>{text}</Typography>
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

