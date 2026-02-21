import { HandType, JankenEventWithGuests, MatchScoreWithUser, HostStats } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji, judgeHand } from '../../utils'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { resultPhase } from './styles'
import { sideCard } from '../phaseCard.styles'
import type { RoomUserWithUser } from '@/shared/types'

import { useState } from 'react'
import { motion } from 'framer-motion'

type RoomUser = RoomUserWithUser

interface ResultPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    currentScores: MatchScoreWithUser[]
    isProcessing: boolean
    onNextRound: () => Promise<void>
    hostName: string
    currentUserId: string
    isCurrentHost: boolean
    hostStats: HostStats | null
    roomUsers: RoomUser[]
}

export function ResultPhase({
    jankenEvent,
    currentScores,
    isProcessing,
    onNextRound,
    hostName,
    currentUserId,
    isCurrentHost,
    hostStats,
    roomUsers
}: ResultPhaseProps) {
    const styles = nullHandGame()
    const rpStyles = resultPhase()
    const [step, setStep] = useState<'RESULT' | 'REVEAL'>('RESULT')

    const currentUser = roomUsers.find(u => u.userId === currentUserId)
    const isReady = currentUser?.isReady ?? false
    const readyCount = roomUsers.filter(u => u.isReady).length
    const totalCount = roomUsers.length

    if (!jankenEvent) return null

    const hostHand = jankenEvent.finalHostHand as HandType
    const hostChoice = jankenEvent.hostChoice
    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    const MainArea = () => {
        const myHandData = jankenEvent.guestHands.find(gh => gh.userId === currentUserId)
        const myHand = myHandData?.hand as HandType | undefined

        // ゲスト視点かつ自分の手がある場合、対決表示
        if (myHand && currentUserId !== jankenEvent.currentHostId) {
            const result = judgeHand(hostHand, myHand)
            const isHostWin = result === 'HOST_WIN'
            const isGuestWin = result === 'GUEST_WIN'
            const isDraw = result === 'DRAW'

            return (
                <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                    {step === 'RESULT' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            layout
                            className="w-full"
                        >
                            <div className="flex justify-center items-center gap-8 mt-8">
                                {/* ホスト */}
                                <div className="flex flex-col items-center">
                                    <div className={cn(rpStyles.playerName(), rpStyles.hostName())}>{hostName}</div>
                                    <div className="mb-4 h-8">
                                        {isHostWin && <span className="bg-[#FF4444] text-black font-bold px-4 py-1 rounded">WIN</span>}
                                        {isGuestWin && <span className="bg-gray-600 text-white font-bold px-4 py-1 rounded">LOSE</span>}
                                        {isDraw && <span className="bg-gray-500 text-white font-bold px-4 py-1 rounded">DRAW</span>}
                                    </div>
                                    <div className={cn(rpStyles.handWrapper(), isHostWin || isDraw ? rpStyles.handWrapperWin() : rpStyles.handWrapperLose())}>
                                        <Hand3D handType={hostHand} revealed={true} size={isHostWin || isDraw ? "medium" : "small"} />
                                    </div>
                                    <div className="text-center text-xl font-bold mt-2">
                                        {getHandDisplayWithEmoji(hostHand)}
                                    </div>
                                    {/* STAY/REVERSE バッジ */}
                                    {hostChoice && (
                                        <div className={`mt-1 text-xs font-black tracking-widest px-2 py-0.5 border ${hostChoice === 'STAY' ? 'text-[#44FFFF] border-[#44FFFF]/40' : 'text-[#FF4444] border-[#FF4444]/40'}`}>
                                            {hostChoice}
                                        </div>
                                    )}
                                </div>

                                <div className={rpStyles.vsText()}>VS</div>

                                {/* 自分 */}
                                <div className="flex flex-col items-center">
                                    <div className={cn(rpStyles.playerName(), rpStyles.myselfName())}>自分</div>
                                    <div className="mb-4 h-8">
                                        {isGuestWin && <span className="bg-[#44FFFF] text-black font-bold px-4 py-1 rounded">WIN</span>}
                                        {isHostWin && <span className="bg-gray-600 text-white font-bold px-4 py-1 rounded">LOSE</span>}
                                        {isDraw && <span className="bg-gray-500 text-white font-bold px-4 py-1 rounded">DRAW</span>}
                                    </div>
                                    <div className={cn(rpStyles.handWrapper(), isGuestWin || isDraw ? rpStyles.handWrapperWin() : rpStyles.handWrapperLose())}>
                                        <Hand3D handType={myHand} revealed={true} size={isGuestWin || isDraw ? "medium" : "small"} />
                                    </div>
                                    <div className="text-center text-xl font-bold mt-2">
                                        {getHandDisplayWithEmoji(myHand)}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-12">
                                <GameButton onClick={() => setStep('REVEAL')} disabled={isProcessing}>
                                    NEXT
                                </GameButton>
                            </div>
                        </motion.div>
                    )}

                    {step === 'REVEAL' && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            layout
                            className="w-full"
                        >
                            <div className="text-center mb-6">
                                <h3 className={rpStyles.revealTitle()}>HOST CHOSE</h3>
                                <p className={rpStyles.revealSubtitle()}>ホストの真の選択</p>
                            </div>

                            {/* STAY/REVERSE の開示 */}
                            <div className="flex flex-col items-center gap-4">
                                <div className={`text-4xl font-black tracking-widest ${hostChoice === 'STAY' ? 'text-[#44FFFF]' : 'text-[#FF4444]'}`}>
                                    {hostChoice ?? '-'}
                                </div>
                                <div className="text-gray-400 text-sm text-center">
                                    {hostChoice === 'STAY'
                                        ? `REALの ${realHand ? getHandDisplayWithEmoji(realHand) : '?'} をそのまま出しました`
                                        : `BLUFFの ${bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'} に変更しました`
                                    }
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <div className="text-center">
                                        <div className={`text-xs font-bold mb-1 ${hostChoice === 'STAY' ? 'text-[#44FFFF]' : 'text-gray-600'}`}>REAL</div>
                                        <div className={`text-sm ${hostChoice === 'STAY' ? 'text-white' : 'text-gray-600 line-through'}`}>
                                            {realHand ? getHandDisplayWithEmoji(realHand) : '?'}
                                        </div>
                                    </div>
                                    <div className="text-gray-600 font-bold">→</div>
                                    <div className="text-center">
                                        <div className={`text-xs font-bold mb-1 ${hostChoice === 'REVERSE' ? 'text-[#FF4444]' : 'text-gray-600'}`}>BLUFF</div>
                                        <div className={`text-sm ${hostChoice === 'REVERSE' ? 'text-white' : 'text-gray-600 line-through'}`}>
                                            {bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 mt-12">
                                <GameButton variant="secondary" onClick={() => setStep('RESULT')}>
                                    BACK
                                </GameButton>
                                <GameButton
                                    onClick={onNextRound}
                                    disabled={isProcessing || isReady}
                                >
                                    {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT'}
                                </GameButton>
                            </div>
                        </motion.div>
                    )}
                </motion.div>
            )
        }

        // ホスト視点 or 観戦者
        let hostStatus: 'WIN' | 'LOSE' | 'DRAW' = 'WIN'
        let hasGuestWin = false
        let hasDraw = false

        jankenEvent.guestHands.forEach(gh => {
            const res = judgeHand(hostHand, gh.hand as HandType)
            if (res === 'GUEST_WIN') hasGuestWin = true
            if (res === 'DRAW') hasDraw = true
        })

        // 新ルールに合わせた判定
        const guestCount = jankenEvent.guestHands.length

        // 1. NullHand判定: ゲストが2人以上かつ全員DRAW
        const isNullHand = guestCount > 1 && !hasGuestWin && jankenEvent.guestHands.every(gh => judgeHand(hostHand, gh.hand as HandType) === 'DRAW')

        // 2. ゲスト勝利判定: NullHandでなく、1人以上GUEST_WINがいる
        const isGuestWin = !isNullHand && hasGuestWin

        // 3. ホスト完全勝利判定: ゲストが2人以上かつNullHandでなく、GUEST_WINが0人かつDRAWが0人
        const isHostPerfectWin = guestCount > 1 && !isNullHand && !hasGuestWin && !hasDraw

        // hostStatusはUIのWIN/LOSE/DRAWバッジ表示用
        if (isNullHand) {
            hostStatus = 'WIN'
        } else if (isGuestWin) {
            hostStatus = 'LOSE'
        } else if (isHostPerfectWin) {
            hostStatus = 'WIN'
        } else {
            // ドロー（完全勝利でもNullHandでもない）
            hostStatus = 'DRAW'
        }

        const isSpectator = !isCurrentHost && !myHandData

        return (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                {step === 'RESULT' && (
                    <motion.div
                        key="host-result"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        layout
                        className="w-full"
                    >
                        {isNullHand && (
                            <div className="text-center mb-4">
                                <div className="text-2xl font-black text-[#44FFFF] tracking-[0.3em] animate-pulse">
                                    NULL HAND!
                                </div>
                                <div className="text-xs text-gray-400">全員があいこ → ホスト+5pt</div>
                            </div>
                        )}

                        <div className="flex justify-center mt-8">
                            <div className="flex flex-col items-center">
                                <div className={cn(rpStyles.playerName(), rpStyles.hostName(), "text-center mb-2")}>{hostName}</div>

                                {isCurrentHost && (
                                    <div className="mb-4 h-8 flex flex-col items-center">
                                        {hostStatus === 'WIN' && (
                                            <span className="bg-[#FF4444] text-black font-bold px-4 py-1 rounded">
                                                {isNullHand ? 'NULL HAND (+5pt)' : 'PERFECT WIN (+3pt)'}
                                            </span>
                                        )}
                                        {hostStatus === 'LOSE' && <span className="bg-gray-600 text-white font-bold px-4 py-1 rounded">LOSE</span>}
                                        {hostStatus === 'DRAW' && <span className="bg-gray-500 text-white font-bold px-4 py-1 rounded">DRAW (0pt)</span>}
                                    </div>
                                )}

                                <div className={cn(rpStyles.handWrapper(), isSpectator ? "w-64 mx-auto" : (hostStatus === 'LOSE' ? rpStyles.handWrapperLose() : rpStyles.handWrapperWin()))}>
                                    <Hand3D handType={hostHand} revealed={true} size={hostStatus === 'LOSE' ? 'small' : 'medium'} />
                                </div>
                                <div className="text-center text-xl font-bold mt-2">
                                    {getHandDisplayWithEmoji(hostHand)}
                                </div>
                                {hostChoice && (
                                    <div className={`mt-1 text-xs font-black tracking-widest px-2 py-0.5 border ${hostChoice === 'STAY' ? 'text-[#44FFFF] border-[#44FFFF]/40' : 'text-[#FF4444] border-[#FF4444]/40'}`}>
                                        {hostChoice}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <GameButton onClick={() => setStep('REVEAL')} disabled={isProcessing}>
                                NEXT
                            </GameButton>
                        </div>
                    </motion.div>
                )}

                {step === 'REVEAL' && (
                    <motion.div
                        key="host-reveal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        layout
                        className="w-full"
                    >
                        <div className="text-center mb-6">
                            <h3 className={rpStyles.revealTitle()}>
                                {isCurrentHost ? 'YOUR CHOICE' : 'HOST CHOSE'}
                            </h3>
                            <p className={rpStyles.revealSubtitle()}>
                                {isCurrentHost ? 'あなたの選択' : `${hostName}の選択`}
                            </p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <div className={`text-4xl font-black tracking-widest ${hostChoice === 'STAY' ? 'text-[#44FFFF]' : 'text-[#FF4444]'}`}>
                                {hostChoice ?? '-'}
                            </div>
                            <div className="text-gray-400 text-sm text-center">
                                {hostChoice === 'STAY'
                                    ? `REALの ${realHand ? getHandDisplayWithEmoji(realHand) : '?'} をそのまま出しました`
                                    : `BLUFFの ${bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'} に変更しました`
                                }
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 mt-8">
                            <GameButton variant="secondary" onClick={() => setStep('RESULT')}>
                                BACK
                            </GameButton>
                            <GameButton
                                onClick={onNextRound}
                                disabled={isProcessing || isReady}
                            >
                                {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT'}
                            </GameButton>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        )
    }

    const SideArea = () => (
        <motion.div
            className={styles.sideArea()}
            layout
            transition={{ duration: 0.3 }}
        >
            <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                <SideHeader
                    engLabel="ROUND RESULT"
                    label="ラウンド結果"
                    className="border-[#44FFFF]/30"
                />

                {currentScores.length > 0 && (
                    <motion.div className="space-y-3" layout>
                        {currentScores.map((score, index) => {
                            const isMe = score.userId === currentUserId
                            const isWinner = score.points > 0

                            const userHandData = jankenEvent.guestHands.find(g => g.userId === score.userId)
                            const handPlayed = userHandData?.hand as HandType | undefined
                            const showHand = isCurrentHost && handPlayed

                            return (
                                <motion.div
                                    key={score.userId}
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                    className={cn(
                                        "flex justify-between items-center p-4 rounded-lg transition-colors relative overflow-hidden border",
                                        isWinner ? "bg-black/30 border-[#FF4444]/20" : "bg-black/30 border-[#44FFFF]/10",
                                        isMe && !isWinner && "border-gray-600"
                                    )}
                                >
                                    {isWinner && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4444]" />
                                    )}

                                    <div className="flex flex-col gap-1 z-10 pl-2">
                                        <div className="flex items-center gap-2">
                                            <span className={cn("font-bold text-sm tracking-wide", isMe ? "text-white" : "text-gray-300")}>
                                                {score.user.name}
                                            </span>
                                            {isMe && (
                                                <span className={rpStyles.youBadge()}>YOU</span>
                                            )}
                                        </div>
                                        {showHand && (
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                <span className="text-lg leading-none">{getHandDisplayWithEmoji(handPlayed)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col items-end z-10 pr-2">
                                        <span className={cn("font-black font-mono text-xl", isWinner ? "text-[#FF4444]" : "text-gray-500")}>
                                            {score.points > 0 ? `+${score.points}` : '0'}
                                        </span>
                                        <span className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">PTS</span>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                )}

                <div className={rpStyles.sideFooter()}>
                    <div className={rpStyles.sideFooterContent()}>
                        <span>Host: {hostName}</span>
                        <span>Total: {currentScores.reduce((acc, curr) => acc + curr.points, 0)}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
