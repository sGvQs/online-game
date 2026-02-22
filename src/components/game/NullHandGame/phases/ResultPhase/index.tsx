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

    const MainArea = () => {
        const isHostDefault = hostChoice === 'STAY'

        // ゲスト視点かつ自分の手がある場合
        if (myHand && currentUserId !== jankenEvent.currentHostId) {
            const result = judgeHand(hostHand, myHand)
            const isGuestWin = result === 'GUEST_WIN'
            const isDraw = result === 'DRAW'

            return (
                <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                    <PhaseHeader
                        engLabel="ROUND RESULT"
                        title={isGuestWin ? "YOU WIN !!" : isDraw ? "DRAW GAME" : "YOU LOSE..."}
                        subLabel=""
                    />

                    <HostStatsDisplay />

                    <div className="flex-1 flex flex-col items-center justify-center -translate-y-4">
                        <div className="flex items-center justify-center gap-12 mb-8">
                            {/* ホスト */}
                            <div className="flex flex-col items-center">
                                <div className={cn(rpStyles.playerName())} style={{ color: '#FF4444' }}>{hostName}</div>
                                <div className="mt-4 mb-2">
                                    <div className={cn(rpStyles.handWrapper(), result === 'HOST_WIN' || isDraw ? rpStyles.handWrapperWin() : rpStyles.handWrapperLose())}>
                                        <Hand3D
                                            handType={hostHand}
                                            revealed={true}
                                            size={result === 'HOST_WIN' || isDraw ? "medium" : "small"}
                                            personalColor="#FF4444"
                                        />
                                    </div>
                                </div>
                                <div className={cn(
                                    "mt-2 text-[10px] font-black tracking-widest px-3 py-0.5 border skew-x-[-10deg]",
                                    isHostDefault ? 'text-[#44FFFF] border-[#44FFFF]/40 bg-[#44FFFF]/5' : 'text-gray-500 border-gray-800 bg-black/40'
                                )}>
                                    {isHostDefault ? 'DEFAULT CHOICE' : 'ANOTHER CHOICE'}
                                </div>
                            </div>

                            <div className="text-gray-800 font-black text-4xl italic px-4">VS</div>

                            {/* 自分 */}
                            <div className="flex flex-col items-center">
                                <div style={{ color: userColor }} className={cn(rpStyles.playerName(), rpStyles.myselfName())}>YOU</div>
                                <div className="mt-4 mb-2">
                                    <div className={cn(rpStyles.handWrapper(), isGuestWin || isDraw ? rpStyles.handWrapperWin() : rpStyles.handWrapperLose())}>
                                        <Hand3D
                                            handType={myHand}
                                            revealed={true}
                                            size={isGuestWin || isDraw ? "medium" : "small"}
                                            personalColor={userColor}
                                        />
                                    </div>
                                </div>
                                <div className="text-center font-black text-white tracking-widest text-lg">
                                    {getHandDisplayWithEmoji(myHand)}
                                </div>
                            </div>
                        </div>

                        {/* 答え合わせテキスト */}
                        <div className="text-center px-8 py-4 bg-white/5 rounded-xl border border-white/5 max-w-sm">
                            <p className="text-gray-400 text-xs leading-relaxed">
                                {isHostDefault
                                    ? <><span style={{ color: '#FF4444' }} className="font-bold">{hostName}</span> は誘惑を断ち切り、システムが提示した DEFAULT CHOICE をそのまま出しました。</>
                                    : <><span style={{ color: '#FF4444' }} className="font-bold">{hostName}</span> は土壇場で ANOTHER CHOICE を選び、裏をかこうとしました。</>
                                }
                            </p>
                        </div>
                    </div>

                    <div className="text-center pb-8">
                        <GameButton
                            onClick={onNextRound}
                            disabled={isProcessing || isReady}
                            variant="primary"
                            className="min-w-[240px]"
                        >
                            {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT ROUND'}
                        </GameButton>
                    </div>
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
        else if (!isGuestWin && !hasDraw) resultTitle = "YOU WIN"
        else resultTitle = "DRAW GAME"

        return (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <PhaseHeader
                    engLabel="ROUND RESULT"
                    title={resultTitle}
                    subLabel=""
                />

                <div className="flex-1 flex flex-col items-center justify-center -translate-y-4">
                    <div className="flex flex-col items-center">
                        <div className={rpStyles.handWrapperWin()}>
                            <Hand3D
                                handType={hostHand}
                                revealed={true}
                                size="medium"
                                personalColor={isCurrentHost ? userColor : "#FF4444"}
                            />
                        </div>
                        <div className="text-center font-black text-white tracking-widest text-2xl mt-4">
                            {getHandDisplayWithEmoji(hostHand)}
                        </div>
                        <div className={cn(
                            "mt-4 text-xs font-black tracking-widest px-6 py-1.5 border-2 skew-x-[-10deg]",
                            isHostDefault ? 'text-[#44FFFF] border-[#44FFFF]/40 bg-[#44FFFF]/5' : 'text-gray-400 border-gray-700 bg-black/40'
                        )}>
                            {isHostDefault ? 'DEFAULT CHOICE' : 'ANOTHER CHOICE'}
                        </div>
                    </div>

                    <div className="mt-8 text-center px-8 py-4 bg-white/5 rounded-xl border border-white/5 max-w-sm">
                        <p className="text-gray-400 text-xs leading-relaxed">
                            {isHostDefault
                                ? "あなたは DEFAULT CHOICE を押し通し、システムの提示に従いました。"
                                : "あなたは ANOTHER CHOICE を選び、土壇場でゲストの裏をかきました。"
                            }
                        </p>
                    </div>
                </div>

                <div className="text-center pb-8">
                    <GameButton
                        onClick={onNextRound}
                        disabled={isProcessing || isReady}
                        variant="primary"
                        className="min-w-[240px]"
                    >
                        {isReady ? `WAITING (${readyCount}/${totalCount})` : 'NEXT ROUND'}
                    </GameButton>
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
