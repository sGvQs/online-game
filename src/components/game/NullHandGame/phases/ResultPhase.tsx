import { HandType, JankenEventWithGuests, MatchScoreWithUser } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'

interface ResultPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    currentScores: MatchScoreWithUser[]
    isProcessing: boolean
    onNextRound: () => void
    hostName: string
}

export function ResultPhase({
    jankenEvent,
    currentScores,
    isProcessing,
    onNextRound,
    hostName
}: ResultPhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    const MainArea = () => (
        <div className={styles.mainArea()}>
            <h2 className={styles.messageText()}>{hostName}の最終手</h2>
            <div className={styles.vsContainer()}>
                <div>
                    <div className="text-[#FF4444] font-bold text-center mb-2 tracking-widest">{hostName}</div>
                    <div className="w-64 mx-auto">
                        <Hand3D
                            handType={jankenEvent.finalHostHand as HandType}
                            revealed={true}
                            size="medium"
                        />
                    </div>
                    <div className="text-center text-xl font-bold mt-2">
                        {getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)}
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
                                    <span className={cn(styles.rankBadge(), score.points > 0 ? "bg-[#FF4444] text-black" : "")}>
                                        {score.points > 0 ? 'WIN' : 'LOSE'}
                                    </span>
                                    <span className="text-white font-mono text-lg">{score.user.name}</span>
                                </div>
                                {/* ゲストの手を表示 */}
                                <div className="text-sm text-gray-400 pl-2">
                                    手: {(() => {
                                        const guestHand = jankenEvent.guestHands.find(g => g.userId === score.userId)?.hand
                                        return guestHand ? getHandDisplayWithEmoji(guestHand as HandType) : '未選択'
                                    })()}
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
