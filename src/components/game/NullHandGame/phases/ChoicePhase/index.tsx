import { JankenEventWithGuests, HostStats, HostChoice, HandType, MatchScoreWithUser } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { sideCard } from '../phaseCard.styles'
import { motion } from 'framer-motion'
import { useSE } from '@/hooks/useSE'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ChoicePhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    isProcessing: boolean
    onChoice: (choice: HostChoice) => Promise<void>
    hostName: string
    currentScores: MatchScoreWithUser[]
    currentUserId: string
}

export function ChoicePhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    isProcessing,
    onChoice,
    hostName,
    currentScores,
    currentUserId,
}: ChoicePhaseProps) {
    const styles = nullHandGame()
    const { play } = useSE()

    // CHOICEとBLUFFの枠を入れ替えるためのアニメーション状態
    const [isSwapped, setIsSwapped] = useState(false)

    useEffect(() => {
        // ゲストの場合のみ、2秒ごとに自動で入れ替える（ホストの迷いを表現）
        if (isCurrentHost) return

        const interval = setInterval(() => {
            setIsSwapped(prev => !prev)
        }, 2000)
        return () => clearInterval(interval)
    }, [isCurrentHost])

    if (!jankenEvent) return null

    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    const MainArea = () => (
        <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
            {isCurrentHost ? (
                <>
                    <PhaseHeader
                        engLabel="あなたはホストです"
                        title="勝負に出す手を選んでください"
                        subLabel=""
                    />

                    {/* ホストの統計情報 */}
                    {hostStats && (
                        <div className="flex flex-col items-center gap-2">
                            <div className="flex justify-center items-center gap-2 text-gray-400 text-xs">
                                <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2" />
                                あなたは過去に <span className="text-[#44FFFF] text-sm font-bold">{hostStats.reverseRate !== null
                                    ? 100 - hostStats.reverseRate
                                    : '???'
                                }%</span> の確率で <span className="text-[#44FFFF] text-sm font-bold"> DEFAULT CHOICE </span> を選んでいます
                            </div>
                            <p className="flex justify-center items-center gap-2 text-gray-400 text-xs animate-pulse">
                                上記のデータはゲストに公開されています...
                            </p>
                        </div>
                    )}

                    <div className="flex flex-col items-center justify-center gap-8">
                        {/* CHOICE vs BLUFF のコンテナ（高さ固定、大型化） */}
                        <div className="relative w-120 h-48 flex items-center justify-center">
                            {/* 固定レイヤー：3Dの手 */}
                            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                                <div className="flex flex-col items-center gap-1 translate-y-2">
                                    <div className="w-48 h-48 flex items-center justify-center">
                                        {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                    </div>
                                    <p className="text-xs text-[#44FFFF] font-bold text-center translate-y-2">DEFAULT CHOICE</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 translate-y-2">
                                    <div className="w-48 h-48">
                                        {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                    </div>
                                </div>
                            </div>

                            {/* アニメーションレイヤー：動く枠 */}
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                <motion.div
                                    layout
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                    style={{ order: isSwapped ? 3 : 1 }}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="text-xs font-black tracking-[0.3em] text-[#44FFFF] mb-1">CHOICE</div>
                                    <div className="w-48 h-48 border-2 border-[#44FFFF] shadow-[0_0_15px_rgba(68,255,255,0.2)] bg-[#44FFFF]/5" />
                                    <div className="h-4" />
                                </motion.div>
                                <div className="order-2 text-gray-500 font-black text-xl translate-y-4">OR</div>

                                <motion.div
                                    layout
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                    style={{ order: isSwapped ? 1 : 3 }}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="w-48 h-48" />
                                    <div className="h-4" />
                                </motion.div>
                            </div>
                        </div>

                        <div className="flex gap-6 mt-10">
                            <motion.button
                                onClick={() => { play('select'); setIsSwapped(prev => !prev) }}
                                disabled={isProcessing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center gap-3 px-10 py-3 border-2 border-white/20 bg-black hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-white font-black text-sm tracking-widest">CHANGE</span>
                            </motion.button>
                            <motion.button
                                onClick={() => {
                                    play('submit')
                                    onChoice(isSwapped ? 'REVERSE' : 'STAY')
                                }}
                                disabled={isProcessing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className={cn(
                                    "flex flex-col items-center gap-3 px-10 py-3 border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed",
                                    "border-[#44FFFF] bg-[#44FFFF]/10"
                                )}
                            >
                                <span className={cn("font-black text-sm tracking-[0.3em]", "text-[#44FFFF]")}>SUBMIT</span>
                            </motion.button>
                        </div>
                    </div>
                </>
            ) : (
                // Guest View
                <>
                    <PhaseHeader
                        engLabel={`あなたはゲストです`}
                        title={`しばらくお待ちください...`}
                        subLabel={`${hostName}がホストです `}
                    />

                    {hostStats && (
                        <div className="flex flex-col items-center mt-6 mb-2 w-full mt-12">
                            <div className="inline-flex flex-col items-start text-gray-400 text-xs text-left">
                                <div className="flex justify-center items-center gap-2 text-gray-400 text-xs">
                                    <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2" />
                                    {hostName}は<span className="text-[#44FFFF] text-sm font-bold">{hostStats.reverseRate !== null
                                        ? 100 - hostStats.reverseRate
                                        : '???'
                                    }%</span> の確率で <span className="text-[#44FFFF] text-sm font-bold"> DEFAULT CHOICE </span>を選びます
                                </div>
                                <div className="flex justify-center items-center gap-2 text-gray-400 text-xs">
                                    <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2" />
                                    {hostName}は下に<span className="text-[#44FFFF] text-sm font-bold">表示されている🖐️</span>しか選ぶことはできません
                                </div>
                            </div>
                            <div className="flex justify-center items-center gap-2 text-gray-400 animate-pulse text-xs mt-1">
                                {hostName}は現在選択中です...
                            </div>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <div className="relative w-120 h-48 flex items-center justify-center">
                            {/* 固定レイヤー：3Dの手 */}
                            <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                                <div className="flex flex-col items-center gap-1 translate-y-2">
                                    <div className="w-48 h-48 flex items-center justify-center">
                                        {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                    </div>
                                    <p className="text-xs text-[#44FFFF] font-bold text-center translate-y-2">DEFAULT CHOICE</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 translate-y-2">
                                    <div className="w-48 h-48">
                                        {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                    </div>
                                </div>
                            </div>

                            {/* アニメーションレイヤー：動く枠 */}
                            <div className="absolute inset-0 flex items-center justify-between px-4">
                                <motion.div
                                    layout
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                    style={{ order: isSwapped ? 3 : 1 }}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="text-xs font-black tracking-[0.3em] text-[#44FFFF] mb-1">CHOICE</div>
                                    <div className="w-48 h-48 border-2 border-[#44FFFF] shadow-[0_0_15px_rgba(68,255,255,0.2)] bg-[#44FFFF]/5" />
                                    <div className="h-4" />
                                </motion.div>

                                <div className="order-2 text-gray-500 font-black text-xl translate-y-4">OR</div>

                                <motion.div
                                    layout
                                    transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                    style={{ order: isSwapped ? 1 : 3 }}
                                    className="flex flex-col items-center gap-1"
                                >
                                    <div className="text-xs font-black tracking-[0.3em] text-[#FF4444] mb-1 opacity-50">BLUFF</div>
                                    <div className="w-48 h-48 border-2 border-[#FF4444] shadow-[0_0_15px_rgba(255,68,68,0.2)] bg-[#FF4444]/5 opacity-50" />
                                    <div className="h-4" />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </>
            )
            }
        </motion.div >
    )

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">

                {/* スコア表示カード */}
                <div className={sideCard({ variant: 'cyan', size: 'lg' }).card() + " flex-1 overflow-hidden flex flex-col"}>
                    <SideHeader
                        engLabel="CURRENT SCORES"
                        label="現在のスコア"
                        className="border-[#44FFFF]/30"
                    />
                    <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar scrollbar-hide">
                        {currentScores.length > 0 ? (
                            currentScores.map((score, index) => (
                                <div
                                    key={score.userId}
                                    className={`flex items-center justify-between p-2 rounded ${score.userId === currentUserId ? 'bg-[#44FFFF]/10 border border-[#44FFFF]/30' : 'bg-black/20 border border-gray-800'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="text-[10px] font-black text-gray-500 w-4">
                                            {index + 1}
                                        </div>
                                        <div className={`text-xs font-bold truncate ${score.userId === currentUserId ? 'text-[#44FFFF]' : 'text-gray-300'}`}>
                                            {score.user.name}
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-white tabular-nums">
                                        {score.points}<span className="text-[10px] text-gray-500 ml-1">pt</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-[10px] text-gray-600 italic">
                                No scores recorded
                            </div>
                        )}
                    </div>
                </div>


                <div className={sideCard({ variant: 'red', size: 'sm' }).card()}>
                    <SideHeader
                        engLabel="RULE"
                        label="ルール"
                        variant="red"
                        className="border-[#FF4444]/30"
                        compact
                    />
                    <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        CHOICE手勝負か、REVERSE読みか...
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        CHOICE手勝負か、REVERSE読みか...
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        CHOICE手勝負か、REVERSE読みか...
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        CHOICE手勝負か、REVERSE読みか...
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        CHOICE手勝負か、REVERSE読みか...
                    </div>
                    <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                        CHOICE手勝負か、REVERSE読みか...
                    </div>
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
