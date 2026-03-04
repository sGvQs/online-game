import { MatchScoreWithUser, UserRanking, HandType } from '@/types'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { Hand3D } from '../../Hand3D'
import { CurrentScores } from '../../common/CurrentScores'
import { PlayerFaceIcon } from '../../common/PlayerFaceIcon'
import { motion } from 'framer-motion'

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

                    const isSingleWinner = currentScores.filter(s => s.points === Math.max(...currentScores.map(sc => sc.points))).length === 1;

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
                            <div className="flex justify-center items-end mb-2 gap-1">
                                <PlayerFaceIcon
                                    faceIcon={currentUserScore.user.faceIcon}
                                    size="lg"
                                />
                                <div className="text-[#44FFFF] text-xl font-bold tracking-widest">のランキング</div>
                            </div>
                            <div className="flex items-center justify-center gap-8 text-4xl font-mono font-bold">
                                <span className="text-gray-500">{oldRank}位</span>
                                <span className="text-white">→</span>
                                <span className="text-[#FF4444] text-5xl">{newRank}位</span>
                            </div>
                            {oldPoints !== undefined && newPoints !== undefined && (
                                <div className="mt-4 flex items-center justify-center gap-4 text-xl font-mono pb-2">
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

                <div className='flex w-full items-center justify-center'>
                    <GameButton
                        onClick={onFinish}
                    >
                        BACK TO TITLE
                    </GameButton>

                </div>

            </div>
        </div>
    )

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <CurrentScores
                currentScores={currentScores}
                currentUserId={currentUserId}
                label="最終スコア"
                engLabel="FINAL SCORE"
                size="lg"
                userColor={userColor}
            />
        </div>
    )

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
