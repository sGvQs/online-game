import { HandType, JankenEventWithGuests, HostStats, MatchScoreWithUser } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { PlayerFaceIcon } from '../../common/PlayerFaceIcon'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { HandSelectionGrid } from '../../HandSelectionGrid'
import { PhaseHeader } from '../../common/PhaseHeader'
import { CurrentScores } from '../../common/CurrentScores'
import { RewardSystem } from '../../common/RewardSystem'
import { GameButton } from '../../common/GameButton'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface BattlePhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    selectedHand: HandType | null
    isProcessing: boolean
    onSelectHand: (hand: HandType) => void
    onSubmit: () => void
    hostName: string
    hostFaceIcon?: import('@/shared/constants/faceIcon').FaceIcon | null
    currentScores: MatchScoreWithUser[]
    currentUserId: string
    userColor?: string
}

export function BattlePhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    selectedHand,
    isProcessing,
    onSelectHand,
    onSubmit,
    hostName,
    hostFaceIcon,
    currentScores,
    currentUserId,
    userColor,
}: BattlePhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    // 自分が既に手を送信済みか判定
    const hasSubmitted = jankenEvent.guestHands.some(gh => gh.userId === currentUserId)

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">
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

    if (!isCurrentHost) {
        // Guest View
        const MainArea = () => (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <PhaseHeader
                    engLabel={hasSubmitted ? "他の人の選択を待っています..." : "あなたのターンです"}
                    title={hasSubmitted ? "しばらくお待ちください" : `${hostName}に勝つ手を選んでください`}
                    subLabel={""}
                    currentTurn={jankenEvent?.turnNumber}
                    totalTurns={jankenEvent?.match.totalTurns}
                />

                {/* ホストの統計情報 (ChoicePhaseを踏襲したスタイル) */}
                {hostStats && (
                    <div className="flex flex-col items-center mt-6 mb-2 w-full">
                        <div className="inline-flex flex-col items-start text-gray-400 text-xs text-left">
                            <div className="flex items-center gap-2 leading-relaxed">
                                <PlayerFaceIcon faceIcon={hostFaceIcon} size="sm" />
                                <span>
                                    {hostName}は過去に
                                    <span className="text-[#FF4444] text-sm font-bold mx-1">
                                        {hostStats.reverseRate !== null ? 100 - hostStats.reverseRate : '???'}%
                                    </span>
                                    の確率で
                                    <span className="text-[#44FFFF] text-sm font-bold ml-1">SYSTEM SELECTION</span>
                                    を選んでいます
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ホストの選択肢 (小型版フレーム演出) */}
                <div className="flex flex-col items-center justify-center gap-4 mb-8 mt-4">
                    <div className="relative w-80 h-32 flex items-center justify-center scale-90">
                        {/* 固定レイヤー：3Dの手 */}
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-32 h-32 flex items-center justify-center">
                                    {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                </div>
                                <p className="text-[10px] text-[#44FFFF] font-bold text-center -translate-y-8">SYSTEM SELECTION</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-32 h-32 flex items-center justify-center">
                                    {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                </div>
                                <div className='h-8' />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center">
                    <HandSelectionGrid
                        selectedHand={selectedHand}
                        onSelectHand={onSelectHand}
                        isProcessing={isProcessing || hasSubmitted}
                        personalColor={userColor}
                        size="small"
                    />

                    <div className="text-center mt-8">
                        <GameButton
                            disabled={!selectedHand || isProcessing || hasSubmitted}
                            onClick={onSubmit}
                            variant={hasSubmitted ? "cyan" : "primary"}
                            className={cn(hasSubmitted && "pointer-events-none")}
                        >
                            {hasSubmitted ? "SUBMITTED" : "BATTLE !!"}
                        </GameButton>
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
    } else {
        // Host View
        const MainArea = () => (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <PhaseHeader
                    engLabel={hasSubmitted ? "他の人の選択を待っています..." : "ゲストが選択しています..."}
                    title="しばらくお待ちください"
                    subLabel=""
                    currentTurn={jankenEvent?.turnNumber}
                    totalTurns={jankenEvent?.match.totalTurns}
                />

                <div className="flex flex-col items-center mt-6 mb-2 w-full">
                    <div className="inline-flex flex-col items-start text-gray-400 text-xs text-left">
                        {hostStats && (
                            <div className="flex items-center leading-relaxed">
                                <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2 flex-shrink-0" />
                                <span className="text-[#44FFFF] font-bold ml-1">SYSTEM SELECTIONを選ぶ確率 </span>
                                <span className="text-white font-bold ml-1">
                                    :
                                </span>
                                <span className="text-[#FF4444] text-sm font-bold mx-1">
                                    {hostStats.reverseRate !== null ? 100 - hostStats.reverseRate : '???'}%
                                </span>
                                <span className="text-gray-400 text-[10px] ml-1 animate-pulse">(この情報は公開されています)</span>
                            </div>
                        )}
                        {realHand && (
                            <div className="flex items-center leading-relaxed">
                                <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2 flex-shrink-0" />
                                <span className="text-[#44FFFF] font-bold ml-1">SYSTEM SELECTION </span>
                                <span className="text-white font-bold ml-1">
                                    : {getHandDisplayWithEmoji(realHand)}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center leading-relaxed">
                            <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2 flex-shrink-0" />
                            <span>
                                <span className="text-[#44FFFF] font-bold ml-1">あなたが選んだ手</span>
                                <span className="text-white font-bold ml-1">
                                    : {getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)}
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {jankenEvent?.finalHostHand ? (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="w-100 h-100 mx-auto relative">
                                <Hand3D
                                    handType={jankenEvent.finalHostHand as HandType}
                                    revealed={true}
                                    size="large"
                                    personalColor={userColor}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="w-100 h-100 mx-auto opacity-50">
                            <Hand3D handType={null} revealed={false} size="large" isRotating={true} />
                        </div>
                    )}
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
}
