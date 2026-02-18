import { HandType, JankenEventWithGuests, MatchScoreWithUser, HostStats, FakeTarget, RoomUser } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji, judgeHand } from '../utils'
import { LieRevealCard } from '../LieRevealCard'
import { SideHeader } from '../common/SideHeader'
import { GameButton } from '../common/GameButton'

import { useState } from 'react'
import { motion } from 'framer-motion'

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
    roomUsers
}: ResultPhaseProps) {
    const styles = nullHandGame()
    const [step, setStep] = useState<'RESULT' | 'REVEAL'>('RESULT')

    const currentUser = roomUsers.find(u => u.userId === currentUserId)
    const isReady = currentUser?.isReady ?? false
    const readyCount = roomUsers.filter(u => u.isReady).length
    const totalCount = roomUsers.length

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
                <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                    {/* 結果画面（バトル） - STEP 1 */}
                    {step === 'RESULT' && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3 }}
                            layout
                            className="w-full"
                        >
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
                                <GameButton
                                    onClick={() => setStep('REVEAL')}
                                    disabled={isProcessing}
                                >
                                    ネタバラシを見る
                                </GameButton>
                            </div>
                        </motion.div>
                    )}

                    {/* ネタバラシ（嘘の公開） - STEP 2 */}
                    {step === 'REVEAL' && (
                        <motion.div
                            key="reveal"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            layout
                            className="w-full"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-[#FF4444] font-black text-2xl tracking-[0.2em] uppercase border-b-2 border-[#FF4444] inline-block pb-1">
                                    HOST LIED ABOUT
                                </h3>
                                <p className="text-gray-500 text-sm mt-2">ホストが仕掛けた「嘘」のおさらい</p>
                            </div>

                            {jankenEvent.fakeTarget === 'NONE' ? (
                                <div className="text-center text-gray-400 italic">
                                    今回、ホストは嘘をつきませんでした... (正直者です)
                                </div>
                            ) : (
                                <LieRevealCard jankenEvent={jankenEvent} hostStats={hostStats} />
                            )}

                            <div className="flex justify-center gap-4 mt-12">
                                <GameButton
                                    variant="secondary"
                                    onClick={() => setStep('RESULT')}
                                >
                                    結果に戻る
                                </GameButton>
                                <GameButton
                                    onClick={onNextRound}
                                    disabled={isProcessing || isReady}
                                >
                                    {isReady ? `待機中 (${readyCount}/${totalCount})` : '次のラウンドへ'}
                                </GameButton>
                            </div>
                        </motion.div>
                    )}
                </motion.div >

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
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                {/* 結果画面（バトル） - STEP 1 */}
                {step === 'RESULT' && (
                    <motion.div
                        key="host-result"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        layout
                        className="w-full"
                    >
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

                        <div className="text-center mt-8">
                            <GameButton
                                onClick={() => setStep('REVEAL')}
                                disabled={isProcessing}
                            >
                                ネタバラシを見る
                            </GameButton>
                        </div>
                    </motion.div>
                )}

                {/* ネタバラシ（ホスト視点） - STEP 2 */}
                {step === 'REVEAL' && (
                    <motion.div
                        key="host-reveal"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        layout
                        className="w-full"
                    >
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
                            <LieRevealCard jankenEvent={jankenEvent} hostStats={hostStats} />
                        )}

                        <div className="flex justify-center gap-4 mt-8">
                            <GameButton
                                variant="secondary"
                                onClick={() => setStep('RESULT')}
                            >
                                結果に戻る
                            </GameButton>
                            <GameButton
                                onClick={onNextRound}
                                disabled={isProcessing || isReady}
                            >
                                {isReady ? `待機中 (${readyCount}/${totalCount})` : '次のラウンドへ'}
                            </GameButton>
                        </div>
                    </motion.div>
                )}
            </motion.div >

        )
    }

    const SideArea = () => (
        <motion.div
            className={styles.sideArea()}
            layout
            transition={{ duration: 0.3 }}
        >
            <SideHeader
                engLabel="ROUND RESULT"
                label="ラウンド結果"
            />

            {currentScores.length > 0 && (
                <motion.div className="space-y-3" layout>
                    {currentScores.map((score, index) => {
                        const isMe = score.userId === currentUserId
                        const isWinner = score.points > 0

                        // Find hand played by this user (only relevant for host view or self)
                        const userHandData = jankenEvent.guestHands.find(g => g.userId === score.userId)
                        const handPlayed = userHandData?.hand as HandType | undefined

                        // Host sees everyone's hands. Guests see only their own if needed (though current logic only shows for host).
                        const showHand = isCurrentHost && handPlayed

                        return (
                            <motion.div
                                key={score.userId}
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className={cn(
                                    "flex justify-between items-center p-3 rounded transition-colors relative overflow-hidden group",
                                    isWinner
                                        ? "bg-[#FF4444]/10"
                                        : "bg-white/5",
                                    isMe && !isWinner && "border border-gray-600"
                                )}
                            >
                                {/* Winner highlight effect */}
                                {isWinner && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#FF4444]" />
                                )}

                                <div className="flex flex-col gap-1 z-10 pl-2">
                                    <div className="flex items-center gap-2">
                                        <span className={cn("font-bold text-sm tracking-wide", isMe ? "text-white" : "text-gray-300")}>
                                            {score.user.name}
                                        </span>
                                        {isMe && (
                                            <span className="text-[10px] bg-gray-800 text-gray-400 border border-gray-700 px-1.5 py-0.5 rounded font-mono">YOU</span>
                                        )}
                                    </div>

                                    {showHand && (
                                        <div className="text-sm text-gray-500 flex items-center gap-2">
                                            <span className="text-lg leading-none">{getHandDisplayWithEmoji(handPlayed)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col items-end z-10 pr-2">
                                    <span className={cn("font-black font-mono text-xl", isWinner ? "text-[#FF4444]" : "text-gray-500")}>
                                        {score.points > 0 ? `+${score.points}` : '0'}
                                    </span>
                                    <span className="text-[10px] text-gray-700 font-bold uppercase tracking-wider">PTS</span>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>
            )}

            {/* Footer with game info */}
            <div className="mt-auto pt-4 border-t border-gray-800">
                <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                    <span>Host: {hostName}</span>
                    <span>Total: {currentScores.reduce((acc, curr) => acc + curr.points, 0)}</span>
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
}
