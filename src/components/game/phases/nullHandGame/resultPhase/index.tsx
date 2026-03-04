import { HandType, JankenEventWithGuests, MatchScoreWithUser, HostStats } from '@/types'
import { Hand3D } from '@/components/game/nullHandGame/Hand3D'
import { PlayerFaceIcon } from '@/components/game/nullHandGame/PlayerFaceIcon'
import { nullHandGame } from '@/components/game/nullHandGame/styles'
import { cn } from '@/lib/utils'
import { judgeHand } from '@/components/game/nullHandGame/utils'
import { PhaseHeader } from '@/components/game/nullHandGame/PhaseHeader'
import { RewardSystem } from '@/components/game/nullHandGame/RewardSystem'
import { GameButton } from '@/components/game/nullHandGame/GameButton'
import { resultPhase } from './styles'
import type { RoomUserWithUser } from '@/types'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CurrentScores } from '@/components/game/nullHandGame/CurrentScores'
import { HandCard } from '@/components/game/nullHandGame/HandCard'

type RoomUser = RoomUserWithUser

interface ResultPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    currentScores: MatchScoreWithUser[]
    isProcessing: boolean
    onNextRound: () => Promise<void>
    hostName: string
    currentUserId: string
    isCurrentHost: boolean
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

    const myHandData = jankenEvent.guestHands.find((gh: (typeof jankenEvent.guestHands)[number]) => gh.userId === currentUserId)
    const myHand = myHandData?.hand as HandType | undefined

    const hostUser = roomUsers.find(u => u.userId === jankenEvent.currentHostId)
    const currentUserData = roomUsers.find(u => u.userId === currentUserId)

    // 決着状況の判定ロジックを共通化
    const guestHands = jankenEvent.guestHands
    const guestCount = guestHands.length
    type GuestHandItem = (typeof guestHands)[number]
    let hasGuestWin = false
    let hasDraw = false
    guestHands.forEach((gh: GuestHandItem) => {
        const res = judgeHand(hostHand, gh.hand as HandType)
        if (res === 'GUEST_WIN') hasGuestWin = true
        if (res === 'DRAW') hasDraw = true
    })

    const isNullHand = guestCount > 1 && !hasGuestWin && guestHands.every((gh: GuestHandItem) => judgeHand(hostHand, gh.hand as HandType) === 'DRAW')
    const isHostPerfectWin = guestCount > 1 && !isNullHand && !hasGuestWin && !hasDraw

    // 報酬フィードバック（個別の獲得スコア報告）
    const RewardFeedback = () => {
        let earnedPoints = 0
        if (isCurrentHost) {
            if (isNullHand) earnedPoints = 5
            else if (isHostPerfectWin) earnedPoints = 3
        } else if (myHand) {
            const isMyWin = judgeHand(hostHand, myHand) === 'GUEST_WIN'
            if (!isNullHand && isMyWin) earnedPoints = 3
        }

        return (
            <div className="flex flex-col items-center mb-4 w-full h-8 justify-center mt-8">
                <div className="flex justify-center items-center gap-2 text-gray-400 text-xs font-mono tracking-widest">
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse mr-1", earnedPoints > 0 ? "bg-[#44FFFF]" : "bg-gray-600")} />

                    {earnedPoints === 0 ? (
                        <span>あなたはこのラウンドでなにも獲得できませんでした</span>

                    ) : (
                        <>
                            <span>あなたはこのラウンドで</span>
                            <span className={"font-bold text-[#44FFFF]"}>
                                {earnedPoints}pt
                            </span>
                            <span>獲得しました</span>
                        </>

                    )}
                </div>
            </div>
        )
    }

    const [showSystemSelection, setShowSystemSelection] = useState(false)

    const MainArea = () => {
        const isHostDefault = hostChoice === 'STAY'

        return (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                {!showSystemSelection ? (
                    <motion.div
                        key="result-overview"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex-1 flex flex-col w-full"
                    >
                        <PhaseHeader
                            engLabel="このラウンドの結果"
                            title={
                                (() => {
                                    if (isNullHand) return "NULL HAND"
                                    if (isHostPerfectWin) return "HOST PERFECT"

                                    if (myHand && currentUserId !== jankenEvent.currentHostId) {
                                        const result = judgeHand(hostHand, myHand)
                                        return result === 'GUEST_WIN' ? "YOU WIN !!" : result === 'DRAW' ? "DRAW GAME" : "YOU LOSE..."
                                    } else {
                                        const isGuestWin = !isNullHand && hasGuestWin
                                        if (isGuestWin) return "YOU LOSE..."
                                        if (!isGuestWin && !hasDraw) return "GUEST WIN"
                                        return "DRAW GAME"
                                    }
                                })()
                            }
                            subLabel={
                                (isNullHand || isHostPerfectWin) && !isCurrentHost
                                    ? `${hostName} は ${isNullHand ? 5 : 3}PT 獲得しました`
                                    : ""
                            }
                            titleVariant={
                                (isNullHand || isHostPerfectWin) && !isCurrentHost ? 'red' : 'cyan'
                            }
                            currentTurn={jankenEvent?.turnNumber}
                            totalTurns={jankenEvent?.match.totalTurns}
                        />

                        <RewardFeedback />

                        <div className="flex-1 flex flex-col items-center justify-center">
                            {myHand && currentUserId !== jankenEvent.currentHostId ? (
                                /* 対戦結果ビュー (GUEST) */
                                <div className="flex items-center justify-center gap-12 mb-8">
                                    <div className="flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <PlayerFaceIcon faceIcon={hostUser?.user?.faceIcon} size="lg" />
                                            <div className={cn(rpStyles.playerName())} style={{ color: '#FF4444' }}>{hostName}</div>
                                        </div>
                                        <HandCard
                                            handType={hostHand}
                                            color="red"
                                            size={"small"}
                                            className="mt-4"
                                        />
                                    </div>

                                    <div className="text-gray-800 font-black text-4xl italic px-4 translate-y-4">VS</div>

                                    <div className="flex flex-col items-center">
                                        <div className="flex flex-col items-center gap-2">
                                            <PlayerFaceIcon faceIcon={currentUserData?.user?.faceIcon} size="lg" />
                                            <div style={{ color: userColor }} className={cn(rpStyles.playerName(), rpStyles.myselfName())}>YOU</div>
                                        </div>
                                        <HandCard
                                            handType={myHand}
                                            personalColor={userColor}
                                            size={"small"}
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
                            engLabel="答え合わせ"
                            title={isCurrentHost ? "あなたは何を選んだのか" : `${hostName}は何を選んだのか`}
                            subLabel=""
                            currentTurn={jankenEvent?.turnNumber}
                            totalTurns={jankenEvent?.match.totalTurns}
                        />


                        <div className="flex-1 flex flex-col items-center justify-center">
                            {/* ChoicePhaseと共通の部品・レイアウト */}
                            <div className="relative w-120 h-48 flex items-center justify-center">
                                {/* 固定レイヤー：3Dの手 */}
                                <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                                    {/* REAL (Left) */}
                                    <div className="flex flex-col items-center gap-1 translate-y-2">
                                        <div className="w-48 h-48 flex items-center justify-center">
                                            {realHand && (
                                                <Hand3D
                                                    handType={realHand as HandType}
                                                    revealed={true}
                                                    size="small"
                                                    personalColor={isCurrentHost ? userColor : "#FF4444"}
                                                />
                                            )}
                                        </div>
                                        <div className="h-6">
                                            <p className="text-xs text-[#44FFFF] font-black tracking-widest text-center translate-y-2 px-3 py-2">
                                                SYSTEM SELECTION
                                            </p>
                                        </div>
                                    </div>

                                    {/* BLUFF (Right) */}
                                    <div className="flex flex-col items-center gap-1 translate-y-2">
                                        <div className="w-48 h-48 flex items-center justify-center">
                                            {bluffHand && (
                                                <Hand3D
                                                    handType={bluffHand as HandType}
                                                    revealed={true}
                                                    size="small"
                                                    personalColor={isCurrentHost ? userColor : "#FF4444"}
                                                />
                                            )}
                                        </div>
                                        <div className="h-6 mt-4" />
                                    </div>
                                </div>

                                {/* 枠（CHOICEフレーム）レイヤー */}
                                <div className="absolute inset-0 flex items-center justify-between px-4">
                                    {/* Selection Frame */}
                                    <div className={cn("flex flex-col items-center gap-1", isHostDefault ? "order-1" : "order-3")}>
                                        <div className='flex items-end gap-2'>
                                            <PlayerFaceIcon faceIcon={hostUser?.user?.faceIcon} size="sm" />
                                            <div
                                                className="text-xs font-black tracking-[0.3em]"
                                                style={{ color: isCurrentHost ? (userColor || '#FF4444') : '#FF4444' }}
                                            >
                                                {hostName}
                                            </div>
                                        </div>
                                        <div
                                            className="w-48 h-48 border-2"
                                            style={{ borderColor: isCurrentHost ? (userColor || '#FF4444') : '#FF4444' }}
                                        />
                                        <div className="h-4" />
                                    </div>

                                    <div className="order-2 text-gray-500 font-black text-xl translate-y-4">OR</div>

                                    {/* 空のプレースホルダー（反対側） */}
                                    <div className={cn("flex flex-col items-center gap-1", isHostDefault ? "order-3" : "order-1")}>
                                        <div className="w-48 h-48" />
                                        <div className="h-4" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                <div className="flex flex-col items-center gap-4 pb-8">
                    <div className="flex gap-6">
                        <GameButton
                            onClick={() => setShowSystemSelection(!showSystemSelection)}
                            variant="secondary"
                            className="min-w-[240px]"
                        >
                            {showSystemSelection ? 'VIEW RESULT' : 'VIEW ANSWER'}
                        </GameButton>

                        <GameButton
                            onClick={onNextRound}
                            disabled={isProcessing || isReady}
                            variant="primary"
                            className="min-w-[240px]"
                        >
                            {isReady
                                ? `WAITING (${readyCount}/${totalCount})`
                                : (jankenEvent?.turnNumber === jankenEvent?.match.totalTurns ? 'FINAL RESULT' : 'NEXT ROUND')}
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
