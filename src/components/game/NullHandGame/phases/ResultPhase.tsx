import { HandType, JankenEventWithGuests, MatchScoreWithUser, HostStats, FakeTarget } from '@/shared/types'
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
    isCurrentHost: boolean
    hostStats: HostStats | null
}

export function ResultPhase({
    jankenEvent,
    currentScores,
    isProcessing,
    onNextRound,
    hostName,
    currentUserId,
    isCurrentHost,
    hostStats
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

                    {/* ネタバラシ（嘘の公開） */}
                    <div className="mt-8 border-t border-gray-800 pt-8">
                        <div className="text-center mb-6">
                            <h3 className="text-[#FF4444] font-black text-2xl tracking-[0.2em] uppercase border-b-2 border-[#FF4444] inline-block pb-1">
                                TRUTH REVEAL
                            </h3>
                            <p className="text-gray-500 text-sm mt-2">ホストが仕掛けた「嘘」のおさらい</p>
                        </div>

                        {jankenEvent.fakeTarget === 'NONE' ? (
                            <div className="text-center text-gray-400 italic">
                                今回、ホストは嘘をつきませんでした... (正直者です)
                            </div>
                        ) : (
                            <div className="max-w-md mx-auto bg-[#111] border border-gray-800 rounded-lg p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 bg-[#FF4444] text-black text-xs font-bold px-3 py-1">
                                    LIE DETECTED
                                </div>

                                <div className="text-center mb-6">
                                    <div className="text-gray-400 text-xs uppercase mb-1">嘘をついていた項目</div>
                                    <div className="text-[#44FFFF] font-bold text-xl">
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && '最初に公開した手'}
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && '手を変える確率'}
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && '選ぶ確率の高い手'}
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-8">
                                    {/* 嘘の情報 */}
                                    <div className="flex flex-col items-center opacity-70 grayscale">
                                        <div className="text-[#FF4444] font-bold text-sm mb-2 uppercase line-through">SHOWN (LIE)</div>
                                        <div className="font-bold text-2xl text-white">
                                            {jankenEvent.fakeTarget === 'INITIAL_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                            {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                            {jankenEvent.fakeTarget === 'FAVORITE_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}
                                        </div>
                                    </div>

                                    <div className="text-gray-600 text-2xl">➔</div>

                                    {/* 真実の情報 */}
                                    <div className="flex flex-col items-center">
                                        <div className="text-[#44FFFF] font-bold text-sm mb-2 uppercase">REAL (TRUTH)</div>
                                        <div className="font-bold text-3xl text-white drop-shadow-[0_0_10px_rgba(68,255,255,0.5)]">
                                            {(() => {
                                                if (jankenEvent.fakeTarget === 'INITIAL_HAND') return getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)
                                                if (jankenEvent.fakeTarget === 'CHANGE_RATE' && hostStats) return `${hostStats.realChangeRate}%`
                                                if (jankenEvent.fakeTarget === 'FAVORITE_HAND' && hostStats) return getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)
                                                return '?'
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
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
        // ホストの勝敗を計算
        let hostStatus: 'WIN' | 'LOSE' | 'DRAW' = 'WIN'
        let hasGuestWin = false
        let hasDraw = false

        jankenEvent.guestHands.forEach(gh => {
            const res = judgeHand(hostHand, gh.hand as HandType)
            if (res === 'GUEST_WIN') hasGuestWin = true
            if (res === 'DRAW') hasDraw = true
        })

        if (hasGuestWin) {
            hostStatus = 'LOSE'
        } else if (hasDraw) {
            hostStatus = 'DRAW'
        } else {
            hostStatus = 'WIN'
        }

        // 観戦者の場合は勝敗を表示しない（常にMedium）
        const isSpectator = !isCurrentHost && !myHandData
        const showResult = isCurrentHost // ホストのみ勝敗表示

        // 観戦者ならサイズはmedium固定、ホストなら勝敗に応じて変更
        const handSize = isSpectator ? 'medium' :
            (hostStatus === 'LOSE' ? 'small' : 'medium')

        return (
            <div className={styles.mainArea()}>
                <div className={styles.vsContainer()}>
                    <div className="flex flex-col items-center">
                        <div className="text-[#FF4444] font-bold text-center mb-2 tracking-widest">{hostName}</div>

                        {/* ホスト用勝敗バッジ */}
                        {showResult && (
                            <div className="mb-4 h-8">
                                {hostStatus === 'WIN' && <span className="bg-[#FF4444] text-black font-bold px-4 py-1 rounded">WIN</span>}
                                {hostStatus === 'LOSE' && <span className="bg-gray-600 text-white font-bold px-4 py-1 rounded">LOSE</span>}
                                {hostStatus === 'DRAW' && <span className="bg-gray-500 text-white font-bold px-4 py-1 rounded">DRAW</span>}
                            </div>
                        )}

                        <div className={cn("transition-all duration-500", isSpectator ? "w-64 mx-auto" : (hostStatus === 'LOSE' ? "w-40 h-40 opacity-70" : "w-48 h-48"))}>
                            <Hand3D
                                handType={hostHand}
                                revealed={true}
                                size={handSize}
                            />
                        </div>
                        <div className="text-center text-xl font-bold mt-2">
                            {getHandDisplayWithEmoji(hostHand)}
                        </div>
                    </div>
                </div>

                {/* ネタバラシ（ホスト視点） */}
                <div className="mt-8 border-t border-gray-800 pt-8">
                    <div className="text-center mb-6">
                        <h3 className="text-[#FF4444] font-black text-2xl tracking-[0.2em] uppercase border-b-2 border-[#FF4444] inline-block pb-1">
                            YOU LIED ABOUT
                        </h3>
                        <p className="text-gray-500 text-sm mt-2">あなたのついた嘘の結果</p>
                    </div>

                    {jankenEvent.fakeTarget === 'NONE' ? (
                        <div className="text-center text-gray-400 italic">
                            あなたは嘘をつきませんでした
                        </div>
                    ) : (
                        <div className="max-w-md mx-auto bg-[#1a1a1a] border border-[#FF4444]/30 rounded-lg p-6">
                            <div className="text-center mb-4">
                                <div className="text-gray-400 text-xs uppercase mb-1">ターゲット</div>
                                <div className="text-[#FF4444] font-bold text-xl">
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && '最初に公開した手'}
                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' && '手を変える確率'}
                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' && '選ぶ確率の高い手'}
                                </div>
                            </div>

                            <div className="flex justify-center gap-8 text-center">
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">嘘（公開）</div>
                                    <div className="font-bold text-xl text-gray-300">
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}
                                    </div>
                                </div>
                                <div className="text-gray-600">vs</div>
                                <div>
                                    <div className="text-xs text-gray-500 mb-1">真実（隠蔽）</div>
                                    <div className="font-bold text-xl text-[#FF4444]">
                                        {(() => {
                                            if (jankenEvent.fakeTarget === 'INITIAL_HAND') return getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)
                                            if (jankenEvent.fakeTarget === 'CHANGE_RATE' && hostStats) return `${hostStats.realChangeRate}%`
                                            if (jankenEvent.fakeTarget === 'FAVORITE_HAND' && hostStats) return getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)
                                            return '?'
                                        })()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
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
                                {/* ホストの場合のみ、ゲストの手を表示 */}
                                {isCurrentHost && (
                                    <div className="text-sm text-gray-400 pl-2">
                                        {(() => {
                                            const guestHand = jankenEvent.guestHands.find(g => g.userId === score.userId)?.hand
                                            return guestHand ? getHandDisplayWithEmoji(guestHand as HandType) : '自分'
                                        })()}
                                    </div>
                                )}
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
