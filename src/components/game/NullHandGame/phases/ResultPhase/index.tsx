import { HandType, JankenEventWithGuests, MatchScoreWithUser, HostStats } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji, judgeHand } from '../../utils'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { RewardSystem } from '../../common/RewardSystem'
import { GameButton } from '../../common/GameButton'
import { resultPhase } from './styles'
import { sideCard } from '../phaseCard.styles'
import type { RoomUserWithUser } from '@/shared/types'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CurrentScores } from '../../common/CurrentScores'
import { HandCard } from '../../common/HandCard'

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
    userColor?: string
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
    roomUsers,
    userColor
}: ResultPhaseProps) {
    const styles = nullHandGame()
    const rpStyles = resultPhase()

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
        <div className="flex flex-col items-center mb-6 w-full">
            <div className="inline-flex flex-col items-start text-gray-400 text-[10px] text-left">
                <div className="flex items-center leading-relaxed">
                    <div className="w-1.5 h-1.5 bg-[#FF4444] rounded-full animate-pulse mr-2 flex-shrink-0" />
                    <span>
                        {hostName}は過去に
                        <span className="text-[#FF4444] font-bold mx-1">
                            {hostStats.reverseRate !== null ? 100 - hostStats.reverseRate : '???'}%
                        </span>
                        の確率で
                        <span className="text-[#44FFFF] font-bold ml-1 uppercase tracking-tighter">DEFAULT CHOICE</span>
                        を選んでいました
                    </span>
                </div>
            </div>
        </div>
    )

    const [showSystemSelection, setShowSystemSelection] = useState(false)

    const MainArea = () => {
        const isHostDefault = hostChoice === 'STAY'

        return (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <AnimatePresence mode="wait">
                    {!showSystemSelection ? (
                        <motion.div
                            key="result-overview"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col w-full"
                        >
                            <PhaseHeader
                                engLabel="ROUND RESULT"
                                title={
                                    myHand && currentUserId !== jankenEvent.currentHostId
                                        ? (() => {
                                            const result = judgeHand(hostHand, myHand)
                                            return result === 'GUEST_WIN' ? "YOU WIN !!" : result === 'DRAW' ? "DRAW GAME" : "YOU LOSE..."
                                        })()
                                        : (() => {
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

                                            if (isNullHand) return "NULL HAND! (+5pt)"
                                            if (isHostPerfectWin) return "PERFECT WIN! (+3pt)"
                                            if (isGuestWin) return "YOU LOSE..."
                                            if (!isGuestWin && !hasDraw) return "YOU WIN"
                                            return "DRAW GAME"
                                        })()
                                }
                                subLabel=""
                            />

                            <HostStatsDisplay />

                            <div className="flex-1 flex flex-col items-center justify-center">
                                {myHand && currentUserId !== jankenEvent.currentHostId ? (
                                    /* 対戦結果ビュー (GUEST) */
                                    <div className="flex items-center justify-center gap-12 mb-8">
                                        <div className="flex flex-col items-center">
                                            <div className={cn(rpStyles.playerName())} style={{ color: '#FF4444' }}>{hostName}</div>
                                            <HandCard
                                                handType={hostHand}
                                                color="red"
                                                size={judgeHand(hostHand, myHand) === 'HOST_WIN' || judgeHand(hostHand, myHand) === 'DRAW' ? "medium" : "small"}
                                                className="mt-4"
                                            />
                                        </div>

                                        <div className="text-gray-800 font-black text-4xl italic px-4 translate-y-4">VS</div>

                                        <div className="flex flex-col items-center">
                                            <div style={{ color: userColor }} className={cn(rpStyles.playerName(), rpStyles.myselfName())}>YOU</div>
                                            <HandCard
                                                handType={myHand}
                                                personalColor={userColor}
                                                size={judgeHand(hostHand, myHand) === 'GUEST_WIN' || judgeHand(hostHand, myHand) === 'DRAW' ? "small" : "small"}
                                                active={judgeHand(hostHand, myHand) === 'GUEST_WIN' || judgeHand(hostHand, myHand) === 'DRAW'}
                                                className="mt-4"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    /* ホスト/観戦者向け単一表示 */
                                    <div className="flex flex-col items-center">
                                        <HandCard
                                            handType={hostHand}
                                            color={isCurrentHost ? 'cyan' : 'red'}
                                            personalColor={isCurrentHost ? userColor : undefined}
                                            size="medium"
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        /* システム選択 (答え合わせ) ビュー */
                        <motion.div
                            key="system-selection"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex flex-col w-full"
                        >
                            <PhaseHeader
                                engLabel="SYSTEM SELECTION"
                                title="答え合わせ"
                                subLabel="ORIGINAL OPTIONS"
                            />

                            <div className="flex flex-col items-center justify-center gap-4 mb-8 mt-4 h-full">
                                <div className="relative w-80 h-32 flex items-center justify-center scale-90">
                                    {/* 固定レイヤー：3Dの手 */}
                                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-32 h-32 flex items-center justify-center">
                                                {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                            </div>
                                            <p className="text-[10px] text-[#44FFFF] font-bold text-center -translate-y-8">DEFAULT CHOICE</p>
                                        </div>
                                        <div className="text-gray-800 font-black text-4xl italic px-4 translate-y-4">OR</div>
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="w-32 h-32 flex items-center justify-center">
                                                {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                            </div>
                                            <div className="h-8 -translate-y-8" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex flex-col items-center gap-4 pb-8">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setShowSystemSelection(!showSystemSelection)}
                            className="px-6 py-2 border border-white/10 bg-black/40 hover:bg-white/5 text-[10px] font-black tracking-widest text-gray-500 hover:text-white transition-all rounded"
                        >
                            {showSystemSelection ? 'SHOW RESULT' : 'SHOW SYSTEM SELECTION'}
                        </button>

                        <GameButton
                            onClick={onNextRound}
                            disabled={isProcessing || isReady}
                            variant="primary"
                            className="min-w-[200px]"
                        >
                            {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT ROUND'}
                        </GameButton>
                    </div>
                </div>
            </motion.div>
        )
    }

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">
                {/* ラウンド結果カード（他フェーズと統一） */}
                <CurrentScores
                    currentScores={currentScores}
                    currentUserId={currentUserId}
                    hostId={jankenEvent?.currentHostId}
                    size="md"
                    userColor={userColor}
                />
                <RewardSystem
                    guestCount={currentScores.length - 1}
                    isHost={isCurrentHost}
                    userColor={userColor}
                    size="md"
                />
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
