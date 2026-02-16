import { MatchScoreWithUser, UserRanking } from '@/shared/types'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'

interface GameOverPhaseProps {
    currentUserId: string
    newRankings: UserRanking[]
    initialRankings: UserRanking[]
    currentScores: MatchScoreWithUser[]
    onFinish: () => void
}

export function GameOverPhase({
    currentUserId,
    newRankings,
    initialRankings,
    currentScores,
    onFinish
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

                <button
                    className={cn(styles.button(), styles.buttonPrimary())}
                    onClick={onFinish}
                >
                    タイトルに戻る
                </button>
            </div>
        </div>
    )

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">最終順位</div>
            {currentScores.length > 0 && (
                <div className="space-y-4">
                    {(() => {
                        // ポイント順にソート（念のため）
                        const sortedScores = [...currentScores].sort((a, b) => b.points - a.points)

                        return sortedScores.map((score, index) => {
                            const oldRank = initialRankings.find(r => r.userId === score.userId)?.rank
                            const newRank = newRankings.find(r => r.userId === score.userId)?.rank ?? oldRank

                            // 同率順位の計算 (1, 1, 3方式)
                            // 前の人と同じポイントなら同じ順位、そうでなければ index + 1
                            let rank = index + 1
                            if (index > 0 && score.points === sortedScores[index - 1].points) {
                                // 前の人と同じランクを探す（再帰的にこれまでの人を確認する必要はない、直前の人の計算済みランクを使えばよいが
                                // mapの中なので単純に配列から比較）
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
                                        "flex justify-between items-center p-4 border-l-4",
                                        rank === 1 ? "bg-[#FF4444]/20 border-[#FF4444]" : "bg-gray-900 border-gray-700"
                                    )}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-3">
                                            <span className={cn(styles.rankBadge(), rank === 1 ? "bg-[#FF4444] text-black" : "")}>{rank}位</span>
                                            <span className="text-white font-mono text-lg">{score.user.name}</span>
                                        </div>
                                        {oldRank && newRank && (
                                            <div className={styles.rankingChange()}>
                                                World Rank: #{oldRank} <span className="text-[#44FFFF]">→ #{newRank}</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[#44FFFF] font-bold font-mono text-2xl">{score.points}点</span>
                                </div>
                            )
                        })
                    })()}
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
