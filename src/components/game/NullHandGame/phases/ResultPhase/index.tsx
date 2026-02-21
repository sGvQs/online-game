import { HandType, JankenEventWithGuests, MatchScoreWithUser, HostStats } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji, judgeHand } from '../../utils'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { resultPhase } from './styles'
import { sideCard } from '../phaseCard.styles'
import type { RoomUserWithUser } from '@/shared/types'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

    const myHandData = jankenEvent.guestHands.find(gh => gh.userId === currentUserId)
    const myHand = myHandData?.hand as HandType | undefined

    // 共通のホスト統計表示コンポーネント
    const HostStatsDisplay = () => hostStats && (
        <div className="flex flex-col items-center mb-8 w-full">
            <div className="inline-flex flex-col items-start text-gray-400 text-[10px] text-left">
                <div className="flex items-center leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-[#44FFFF] rounded-full animate-pulse mr-2 flex-shrink-0" />
                    <span>
                        {hostName}は過去に
                        <span className="text-[#44FFFF] font-bold mx-1">
                            {hostStats.reverseRate !== null ? 100 - hostStats.reverseRate : '???'}%
                        </span>
                        の確率で
                        <span className="text-[#44FFFF] font-bold ml-1 uppercase tracking-tighter">DEFAULT CHOICE</span>
                        を選んでいます
                    </span>
                </div>
                {realHand && (
                    <div className="flex items-center leading-relaxed opacity-60">
                        <div className="w-1.5 h-1.5 bg-gray-600 rounded-full mr-2 flex-shrink-0" />
                        <span>今回の <span className="text-white font-bold">DEFAULT CHOICE</span> は {getHandDisplayWithEmoji(realHand)} でした</span>
                    </div>
                )}
            </div>
        </div>
    )

    const MainArea = () => {
        // ゲスト視点かつ自分の手がある場合、対決表示
        if (myHand && currentUserId !== jankenEvent.currentHostId) {
            const result = judgeHand(hostHand, myHand)
            const isHostWin = result === 'HOST_WIN'
            const isGuestWin = result === 'GUEST_WIN'
            const isDraw = result === 'DRAW'

            return (
                <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                    <AnimatePresence mode="wait">
                        {step === 'RESULT' ? (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="w-full flex flex-col h-full"
                            >
                                <PhaseHeader
                                    engLabel="ROUND RESULT"
                                    title={isGuestWin ? "YOU WIN !!" : isDraw ? "DRAW GAME" : "YOU LOSE..."}
                                    subLabel=""
                                />

                                <HostStatsDisplay />

                                <div className="flex-1 flex items-center justify-center gap-12 -translate-y-8">
                                    {/* ホスト */}
                                    <div className="flex flex-col items-center">
                                        <div className={cn(rpStyles.playerName(), rpStyles.hostName())}>{hostName}</div>
                                        <div className="mt-4 mb-2">
                                            <div className={cn(rpStyles.handWrapper(), isHostWin || isDraw ? rpStyles.handWrapperWin() : rpStyles.handWrapperLose())}>
                                                <Hand3D handType={hostHand} revealed={true} size={isHostWin || isDraw ? "medium" : "small"} />
                                            </div>
                                        </div>
                                        <div className="text-center font-black text-[#44FFFF] tracking-widest text-lg">
                                            {getHandDisplayWithEmoji(hostHand)}
                                        </div>
                                    </div>

                                    <div className="text-gray-700 font-black text-4xl italic px-4">VS</div>

                                    {/* 自分 */}
                                    <div className="flex flex-col items-center">
                                        <div className={cn(rpStyles.playerName(), rpStyles.myselfName())}>YOU</div>
                                        <div className="mt-4 mb-2">
                                            <div className={cn(rpStyles.handWrapper(), isGuestWin || isDraw ? rpStyles.handWrapperWin() : rpStyles.handWrapperLose())}>
                                                <Hand3D handType={myHand} revealed={true} size={isGuestWin || isDraw ? "medium" : "small"} />
                                            </div>
                                        </div>
                                        <div className="text-center font-black text-white tracking-widest text-lg">
                                            {getHandDisplayWithEmoji(myHand)}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-center pb-8">
                                    <GameButton variant="primary" onClick={() => setStep('REVEAL')} disabled={isProcessing}>
                                        CHECK HOST'S INTENT
                                    </GameButton>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reveal"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="w-full h-full flex flex-col"
                            >
                                <PhaseHeader
                                    engLabel="HOST INTENT REVEAL"
                                    title={`${hostName}は手を「変えた」のか？`}
                                    subLabel=""
                                />

                                <div className="flex-1 flex flex-col items-center justify-center -translate-y-8">
                                    <div className="flex flex-col items-center gap-6">
                                        <div className={cn(
                                            "text-6xl font-black tracking-[0.2em] py-4 px-12 border-4 bg-black/40 shadow-2xl skew-x-[-12deg]",
                                            hostChoice === 'STAY'
                                                ? 'border-[#44FFFF] text-[#44FFFF] shadow-[#44FFFF]/20'
                                                : 'border-[#FF4444] text-[#FF4444] shadow-[#FF4444]/20'
                                        )}>
                                            {hostChoice === 'STAY' ? 'STAY' : 'REVERSE'}
                                        </div>

                                        <div className="max-w-md text-center space-y-4">
                                            <p className="text-gray-400 text-sm font-bold leading-relaxed">
                                                {hostChoice === 'STAY'
                                                    ? `${hostName}は誘惑を断ち切り、DEFAULT CHOICEをそのまま押し通しました。`
                                                    : `${hostName}は土壇場で逆の手を選び、裏をかこうとしました。`
                                                }
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-8 mt-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Default</p>
                                                <div className={cn("text-xl font-bold", hostChoice === 'STAY' ? "text-white" : "text-gray-600 line-through")}>
                                                    {realHand ? getHandDisplayWithEmoji(realHand) : '?'}
                                                </div>
                                            </div>
                                            <div className="text-gray-700 text-2xl font-black">→</div>
                                            <div className="flex flex-col items-center gap-2">
                                                <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Bluff</p>
                                                <div className={cn("text-xl font-bold", hostChoice === 'REVERSE' ? "text-white" : "text-gray-600 line-through")}>
                                                    {bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center gap-6 pb-8">
                                    <GameButton variant="secondary" onClick={() => setStep('RESULT')}>
                                        BACK
                                    </GameButton>
                                    <GameButton
                                        onClick={onNextRound}
                                        disabled={isProcessing || isReady}
                                        variant="primary"
                                        className="min-w-[200px]"
                                    >
                                        {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT ROUND'}
                                    </GameButton>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )
        }

        // ホスト視点 or 観戦者
        let hasGuestWin = false
        let hasDraw = false

        jankenEvent.guestHands.forEach(gh => {
            const res = judgeHand(hostHand, gh.hand as HandType)
            if (res === 'GUEST_WIN') hasGuestWin = true
            if (res === 'DRAW') hasDraw = true
        })

        const guestCount = jankenEvent.guestHands.length
        const isNullHand = guestCount > 1 && !hasGuestWin && jankenEvent.guestHands.every(gh => judgeHand(hostHand, gh.hand as HandType) === 'DRAW')
        const isGuestWin = !isNullHand && hasGuestWin
        const isHostPerfectWin = guestCount > 1 && !isNullHand && !hasGuestWin && !hasDraw

        let resultTitle = "ROUND OVER"
        if (isNullHand) resultTitle = "NULL HAND! (+5pt)"
        else if (isHostPerfectWin) resultTitle = "PERFECT WIN! (+3pt)"
        else if (isGuestWin) resultTitle = "YOU LOSE..."
        else if (!isGuestWin && !hasDraw) resultTitle = "YOU WIN" // ホスト1人vsゲスト1人でホスト勝ち
        else resultTitle = "DRAW GAME"

        return (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <AnimatePresence mode="wait">
                    {step === 'RESULT' ? (
                        <motion.div
                            key="host-result"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="w-full h-full flex flex-col"
                        >
                            <PhaseHeader
                                engLabel="ROUND RESULT"
                                title={resultTitle}
                                subLabel=""
                            />

                            <div className="flex-1 flex flex-col items-center justify-center -translate-y-8">
                                <div className="flex flex-col items-center">
                                    <div className={cn(rpStyles.playerName(), rpStyles.hostName(), "mb-4")}>{hostName}</div>
                                    <div className={rpStyles.handWrapperWin()}>
                                        <Hand3D handType={hostHand} revealed={true} size="medium" />
                                    </div>
                                    <div className="text-center font-black text-[#44FFFF] tracking-widest text-2xl mt-4">
                                        {getHandDisplayWithEmoji(hostHand)}
                                    </div>
                                    <div className={cn(
                                        "mt-4 text-xs font-black tracking-widest px-4 py-1 border-2 skew-x-[-10deg]",
                                        hostChoice === 'STAY' ? 'text-[#44FFFF] border-[#44FFFF]/40 bg-[#44FFFF]/5' : 'text-[#FF4444] border-[#FF4444]/40 bg-[#FF4444]/5'
                                    )}>
                                        {hostChoice}
                                    </div>
                                </div>
                            </div>

                            <div className="text-center pb-8">
                                <GameButton variant="primary" onClick={() => setStep('REVEAL')} disabled={isProcessing}>
                                    REVEAL YOUR INTENT
                                </GameButton>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="host-reveal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="w-full h-full flex flex-col"
                        >
                            <PhaseHeader
                                engLabel="RESULT REVEAL"
                                title={isCurrentHost ? "あなたの意志" : "ホストの意志"}
                                subLabel=""
                            />

                            <div className="flex-1 flex flex-col items-center justify-center -translate-y-8">
                                <div className="flex flex-col items-center gap-6">
                                    <div className={cn(
                                        "text-6xl font-black tracking-[0.2em] py-4 px-12 border-4 bg-black/40 shadow-2xl skew-x-[-12deg]",
                                        hostChoice === 'STAY'
                                            ? 'border-[#44FFFF] text-[#44FFFF] shadow-[#44FFFF]/20'
                                            : 'border-[#FF4444] text-[#FF4444] shadow-[#FF4444]/20'
                                    )}>
                                        {hostChoice === 'STAY' ? 'STAY' : 'REVERSE'}
                                    </div>

                                    <div className="flex items-center gap-8 mt-4 bg-white/5 p-6 rounded-2xl border border-white/10">
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Default</p>
                                            <div className={cn("text-xl font-bold", hostChoice === 'STAY' ? "text-white" : "text-gray-600 line-through text-sm opacity-50")}>
                                                {realHand ? getHandDisplayWithEmoji(realHand) : '?'}
                                            </div>
                                        </div>
                                        <div className="text-gray-700 text-2xl font-black">→</div>
                                        <div className="flex flex-col items-center gap-2">
                                            <p className="text-[10px] text-gray-500 font-black tracking-widest uppercase">Bluff</p>
                                            <div className={cn("text-xl font-bold", hostChoice === 'REVERSE' ? "text-white" : "text-gray-600 line-through text-sm opacity-50")}>
                                                {bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center gap-4 pb-8">
                                <GameButton variant="secondary" onClick={() => setStep('RESULT')}>
                                    BACK
                                </GameButton>
                                <GameButton
                                    onClick={onNextRound}
                                    disabled={isProcessing || isReady}
                                    variant="primary"
                                    className="min-w-[200px]"
                                >
                                    {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT ROUND'}
                                </GameButton>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        )
    }

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">
                {/* ラウンド結果カード（他フェーズと統一） */}
                <div className={sideCard({ variant: 'cyan', size: 'lg' }).card() + " flex-1 overflow-hidden flex flex-col"}>
                    <SideHeader
                        engLabel="ROUND SCORES"
                        label="今回獲得したpt"
                        className="border-[#44FFFF]/30"
                    />
                    <div className="mt-4 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar scrollbar-hide">
                        {currentScores.length > 0 ? (
                            currentScores.map((score, index) => {
                                const isMe = score.userId === currentUserId
                                const isWinner = score.points > 0
                                const userHandData = jankenEvent.guestHands.find(g => g.userId === score.userId)
                                const handPlayed = userHandData?.hand as HandType | undefined

                                return (
                                    <div
                                        key={score.userId}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-lg border transition-all",
                                            isMe ? "bg-[#44FFFF]/10 border-[#44FFFF]/40 shadow-[0_0_15px_rgba(68,255,255,0.1)]" : "bg-black/40 border-white/5",
                                            isWinner && !isMe ? "border-white/20 bg-[#44FFFF]/5" : ""
                                        )}
                                    >
                                        <div className="flex flex-col min-w-0">
                                            <div className="flex items-center gap-2">
                                                <div className={cn("text-xs font-bold truncate", isMe ? "text-[#44FFFF]" : "text-gray-300")}>
                                                    {score.user.name}
                                                </div>
                                                {isMe && <span className="text-[8px] bg-[#44FFFF] text-black px-1 font-black rounded-[2px]">YOU</span>}
                                            </div>
                                            {(handPlayed || score.userId === jankenEvent.currentHostId) && (
                                                <div className="text-[10px] text-gray-500 mt-0.5">
                                                    {score.userId === jankenEvent.currentHostId ? "HOST" : getHandDisplayWithEmoji(handPlayed as HandType)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <div className={cn("text-lg font-black tabular-nums", isWinner ? "text-[#44FFFF]" : "text-gray-600")}>
                                                {isWinner ? `+${score.points}` : '0'}<span className="text-[10px] ml-0.5">pt</span>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className="text-center py-4 text-[10px] text-gray-600 italic">
                                No scores recorded
                            </div>
                        )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center px-1">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Host of this round</span>
                        <span className="text-xs text-white font-black">{hostName}</span>
                    </div>
                </div>

                <div className={sideCard({ variant: 'red', size: 'sm' }).card()}>
                    <SideHeader
                        engLabel="HISTORY"
                        label="これまでの傾向"
                        variant="red"
                        className="border-[#FF4444]/30"
                        compact
                    />
                    <div className="mt-2 space-y-2">
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">Total Rounds</span>
                            <span className="text-white font-bold">{jankenEvent.turnNumber}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px]">
                            <span className="text-gray-500">Average Stay Rate</span>
                            <span className="text-[#44FFFF] font-bold">50%</span>
                        </div>
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
