import { HandType, JankenEventWithGuests, MatchScoreWithUser } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji, judgeHand } from '../utils'

interface ResultPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    currentScores: MatchScoreWithUser[]
    isProcessing: boolean
    onNextRound: () => void
    hostName: string
    currentUserId: string
}

export function ResultPhase({
    jankenEvent,
    currentScores,
    isProcessing,
    onNextRound,
    hostName,
    currentUserId
}: ResultPhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    const MainArea = () => {
        // 現在のユーザーがゲストの場合、自分の手を取得
        const myHandData = jankenEvent.guestHands.find(gh => gh.userId === currentUserId)
        const myHand = myHandData?.hand as HandType | undefined
        const hostHand = jankenEvent.finalHostHand as HandType

        // ゲスト視点かつ自分の手がある場合、対決表示
        if (myHand && currentUserId !== jankenEvent.currentHostId) {
            const result = judgeHand(hostHand, myHand)
            const isHostWin = result === 'HOST_WIN'
            const isGuestWin = result === 'GUEST_WIN'
            const isDraw = result === 'DRAW'

            return (
                <div className={styles.mainArea()}>
                    <h2 className={styles.messageText()}>結果発表</h2>
                    <div className="flex justify-center items-center gap-8 mt-8">
                        {/* ホスト */}
                        <div className="flex flex-col items-center">
                            <div className="text-[#FF4444] font-bold text-xl mb-4 tracking-widest">{hostName}</div>

                            {/* 勝敗バッジ */}
                            <div className="mb-4 h-8">
                                {isHostWin && <span className="bg-[#FF4444] text-black font-bold px-4 py-1 rounded">WIN</span>}
                                {isGuestWin && <span className="bg-gray-600 text-white font-bold px-4 py-1 rounded">LOSE</span>}
                                {isDraw && <span className="bg-gray-500 text-white font-bold px-4 py-1 rounded">DRAW</span>}
                            </div>

                            <div className={cn("transition-all duration-500", isHostWin || isDraw ? "w-48 h-48" : "w-40 h-40 opacity-70")}>
                                <Hand3D
                                    handType={hostHand}
                                    revealed={true}
                                    size={isHostWin || isDraw ? "medium" : "small"}
                                />
                            </div>
                            <div className="text-center text-xl font-bold mt-2">
                                {getHandDisplayWithEmoji(hostHand)}
                            </div>
                        </div>

                        {/* VS */}
                        <div className="text-4xl font-bold text-white italic opacity-50">VS</div>

                        {/* 自分 */}
                        <div className="flex flex-col items-center">
                            <div className="text-[#44FFFF] font-bold text-xl mb-4 tracking-widest">自分</div>

                            {/* 勝敗バッジ */}
                            <div className="mb-4 h-8">
                                {isGuestWin && <span className="bg-[#44FFFF] text-black font-bold px-4 py-1 rounded">WIN</span>}
                                {isHostWin && <span className="bg-gray-600 text-white font-bold px-4 py-1 rounded">LOSE</span>}
                                {isDraw && <span className="bg-gray-500 text-white font-bold px-4 py-1 rounded">DRAW</span>}
                            </div>

                            <div className={cn("transition-all duration-500", isGuestWin || isDraw ? "w-48 h-48" : "w-40 h-40 opacity-70")}>
                                <Hand3D
                                    handType={myHand}
                                    revealed={true}
                                    size={isGuestWin || isDraw ? "medium" : "small"}
                                />
                            </div>
                            <div className="text-center text-xl font-bold mt-2">
                                {getHandDisplayWithEmoji(myHand)}
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <button
                            className={cn(styles.button(), styles.buttonPrimary())}
                            onClick={onNextRound}
                            disabled={isProcessing}
                        >
                            次のラウンドへ
                        </button>
                    </div>
                </div>
            )
        }

        // ホスト視点または観戦者（フォールバック）
        return (
            <div className={styles.mainArea()}>
                <h2 className={styles.messageText()}>{hostName}の最終手</h2>
                <div className={styles.vsContainer()}>
                    <div>
                        <div className="text-[#FF4444] font-bold text-center mb-2 tracking-widest">{hostName}</div>
                        <div className="w-64 mx-auto">
                            <Hand3D
                                handType={hostHand}
                                revealed={true}
                                size="medium"
                            />
                        </div>
                        <div className="text-center text-xl font-bold mt-2">
                            {getHandDisplayWithEmoji(hostHand)}
                        </div>
                    </div>
                </div>
                <div className="text-center mt-8">
                    <button
                        className={cn(styles.button(), styles.buttonPrimary())}
                        onClick={onNextRound}
                        disabled={isProcessing}
                    >
                        次のラウンドへ
                    </button>
                </div>
            </div>
        )
    }

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">ラウンド結果</div>
            {currentScores.length > 0 && (
                <div className="space-y-4">
                    {currentScores.map((score, index) => (
                        <div
                            key={score.userId}
                            className={cn(
                                "flex justify-between items-center p-4 border-l-4",
                                score.points > 0 ? "bg-[#FF4444]/20 border-[#FF4444]" : "bg-gray-900 border-gray-700"
                            )}
                        >
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-3">
                                    <span className="text-white font-mono text-lg">{score.user.name}</span>
                                </div>
                            </div>
                            <span className="text-[#44FFFF] font-bold font-mono text-2xl">
                                {score.points > 0 ? `+${score.points}` : '0'} 点
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
