import { MatchScoreWithUser, UserRanking, HandType } from '@/shared/types'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { Hand3D } from '../../Hand3D'

interface GameOverPhaseProps {
    currentUserId: string
    newRankings: UserRanking[]
    initialRankings: UserRanking[]
    currentScores: MatchScoreWithUser[]
    onFinish: () => void
    userColor?: string
    hostId?: string
}

export function GameOverPhase({
    currentUserId,
    newRankings,
    initialRankings,
    currentScores,
    onFinish,
    userColor,
    hostId,
}: GameOverPhaseProps) {
    const styles = nullHandGame()

    const MainArea = () => (
        <div className={styles.mainArea()}>
            {/* <h1 className="text-5xl font-bold text-[#FF4444] mb-8 tracking-[0.2em] text-center border-b-4 border-[#FF4444] pb-4">GAME OVER</h1> */}

            <div className="text-center mt-12">
                {(() => {
                    const currentUserScore = currentScores.find(s => s.userId === currentUserId)
                    if (!currentUserScore) return null

                    const oldRanking = initialRankings.find(r => r.userId === currentUserId)
                    const oldRank = oldRanking?.rank
                    const oldPoints = oldRanking?.points

                    const newRanking = newRankings.find(r => r.userId === currentUserId)
                    // newRankingsがまだ空の場合はoldRankを表示あるいはLoading...？
                    // ここではnewRankingsがあればそれを、なければoldRankを表示
                    const newRank = newRanking?.rank ?? oldRank
                    const newPoints = newRanking?.points ?? oldPoints

                    if (!oldRank) return null

                    return (
                        <div className="mb-12">
                            <div className="w-48 h-48 mx-auto mb-4">
                                <Hand3D
                                    handType={currentScores.find(s => s.userId === currentUserId)?.userId ? HandType.ROCK : null} // とりあえずROCKかタイトル手を表示
                                    revealed={true}
                                    size="medium"
                                    personalColor={userColor}
                                />
                            </div>
                            <div className="text-[#44FFFF] text-xl font-bold mb-2 tracking-widest">世界順位</div>
                            <div className="flex items-center justify-center gap-8 text-4xl font-mono font-bold">
                                <span className="text-gray-500">{oldRank}位</span>
                                <span className="text-white">→</span>
                                <span className="text-[#FF4444] text-5xl">{newRank}位</span>
                            </div>
                            {oldPoints !== undefined && newPoints !== undefined && (
                                <div className="mt-4 flex items-center justify-center gap-4 text-xl font-mono">
                                    <div className="text-gray-400">合計ポイント:</div>
                                    <div className="flex items-center gap-4">
                                        <span className="text-gray-500">{Math.floor(oldPoints)}pt</span>
                                        <span className="text-white">→</span>
                                        <span className="text-[#44FFFF] font-bold text-2xl">{Math.floor(newPoints)}pt</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })()}

                <GameButton
                    onClick={onFinish}
                >
                    BACK TO TITLE
                </GameButton>
            </div>
        </div>
    )

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-xl p-6 flex-1 flex flex-col">
                <SideHeader
                    engLabel="FINAL RANKING"
                    label="最終順位"
                    className="border-[#44FFFF]/30"
                />
                {currentScores.length > 0 && (
                    <div className="space-y-3">
                        {(() => {
                            const sortedScores = [...currentScores].sort((a, b) => b.points - a.points)

                            return sortedScores.map((score, index) => {
                                const oldRank = initialRankings.find(r => r.userId === score.userId)?.rank
                                const newRank = newRankings.find(r => r.userId === score.userId)?.rank ?? oldRank

                                let rank = index + 1
                                if (index > 0 && score.points === sortedScores[index - 1].points) {
                                    let prevIndex = index - 1
                                    while (prevIndex >= 0 && sortedScores[prevIndex].points === score.points) {
                                        rank = prevIndex + 1
                                        prevIndex--
                                    }
                                }

                                return (
                                    <div
                                        key={score.userId}
                                        className={cn(
                                            "flex justify-between items-center p-3 rounded-lg border",
                                            score.userId === currentUserId
                                                ? "bg-[#44FFFF]/10 border-[#44FFFF]/30"
                                                : score.userId === hostId
                                                    ? "bg-[#FF4444]/10 border-[#FF4444]/30"
                                                    : "bg-black/30 border-[#44FFFF]/10"
                                        )}
                                    >
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    styles.rankBadge(),
                                                    rank === 1 ? "bg-[#FF4444] text-black" : "",
                                                    score.userId === currentUserId && "shadow-[0_0_10px_rgba(68,255,255,0.5)]"
                                                )}>
                                                    {rank}位
                                                </span>
                                                <span
                                                    className="font-mono text-lg"
                                                    style={{
                                                        color: score.userId === currentUserId
                                                            ? userColor
                                                            : score.userId === hostId
                                                                ? "#FF4444"
                                                                : "#44FFFF"
                                                    }}
                                                >
                                                    {score.user.name}
                                                </span>
                                            </div>
                                        </div>
                                        <span
                                            className="font-bold font-mono text-1xl"
                                            style={{
                                                color: score.userId === currentUserId
                                                    ? userColor
                                                    : score.userId === hostId
                                                        ? "#FF4444"
                                                        : "#44FFFF"
                                            }}
                                        >
                                            {score.points}点
                                        </span>
                                    </div>
                                )
                            })
                        })()}
                    </div>
                )}
            </div>
        </div >
    )

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
