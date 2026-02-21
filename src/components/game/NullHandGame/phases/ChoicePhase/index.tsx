import { JankenEventWithGuests, HostStats, HostChoice, HandType, MatchScoreWithUser } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { WaitingDisplay } from '../../common/WaitingDisplay'
import { sideCard } from '../phaseCard.styles'
import { motion } from 'framer-motion'
import { useSE } from '@/hooks/useSE'

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

    if (!jankenEvent) return null

    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    const MainArea = () => (
        <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
            {isCurrentHost ? (
                <>
                    <PhaseHeader
                        engLabel="YOUR CHOICE"
                        title="STAY か REVERSE か"
                        subLabel="MAKE YOUR DECISION"
                    />

                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        {/* REAL vs BLUFF の表示 */}
                        <div className="flex gap-6 items-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-xs font-black tracking-[0.3em] text-[#44FFFF]">REAL</div>
                                <div className="w-24 h-24 relative border border-[#44FFFF]/30">
                                    {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                </div>
                                {realHand && <div className="text-sm text-white font-bold">{getHandDisplayWithEmoji(realHand)}</div>}
                            </div>

                            <div className="text-gray-500 font-black text-xl">VS</div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-xs font-black tracking-[0.3em] text-[#FF4444]">BLUFF</div>
                                <div className="w-24 h-24 relative border border-[#FF4444]/30">
                                    {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                </div>
                                {bluffHand && <div className="text-sm text-white font-bold">{getHandDisplayWithEmoji(bluffHand)}</div>}
                            </div>
                        </div>

                        {/* STAY / REVERSE ボタン */}
                        <div className="flex gap-6">
                            <motion.button
                                onClick={() => { play('submit'); onChoice('STAY') }}
                                disabled={isProcessing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center gap-3 px-10 py-6 border-2 border-[#44FFFF] bg-black hover:bg-[#44FFFF]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-[#44FFFF] font-black text-2xl tracking-widest">STAY</span>
                                <span className="text-gray-400 text-xs text-center">
                                    REAL手<br />
                                    <span className="text-white font-bold">{realHand ? getHandDisplayWithEmoji(realHand) : '?'}</span>
                                    をそのまま出す
                                </span>
                            </motion.button>

                            <motion.button
                                onClick={() => { play('submit'); onChoice('REVERSE') }}
                                disabled={isProcessing}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="flex flex-col items-center gap-3 px-10 py-6 border-2 border-[#FF4444] bg-black hover:bg-[#FF4444]/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <span className="text-[#FF4444] font-black text-2xl tracking-widest">REVERSE</span>
                                <span className="text-gray-400 text-xs text-center">
                                    BLUFF手<br />
                                    <span className="text-white font-bold">{bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'}</span>
                                    に変更する
                                </span>
                            </motion.button>
                        </div>

                        <div className="text-xs text-gray-600 text-center">
                            ゲストはあなたの選択を読もうとしています
                        </div>
                    </div>
                </>
            ) : (
                // Guest View
                <>
                    <PhaseHeader
                        engLabel="WAITING..."
                        title={`${hostName}の選択を待機中`}
                        subLabel="HOST IS DECIDING"
                    />

                    <div className="flex-1 flex flex-col items-center justify-center gap-8">
                        <div className="flex gap-6 items-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="text-xs font-black tracking-[0.3em] text-[#44FFFF]">REAL</div>
                                <div className="w-24 h-24 relative border border-[#44FFFF]/30">
                                    {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                </div>
                                {realHand && <div className="text-sm text-white font-bold">{getHandDisplayWithEmoji(realHand)}</div>}
                            </div>

                            <div className="text-gray-500 font-black text-xl">VS</div>

                            <div className="flex flex-col items-center gap-2">
                                <div className="text-xs font-black tracking-[0.3em] text-[#FF4444]">BLUFF</div>
                                <div className="w-24 h-24 relative border border-[#FF4444]/30">
                                    {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                </div>
                                {bluffHand && <div className="text-sm text-white font-bold">{getHandDisplayWithEmoji(bluffHand)}</div>}
                            </div>
                        </div>

                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse" />
                            {hostName} が STAY か REVERSE かを選択中...
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    )

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">
                {/* 統計データカード */}
                <div className={sideCard({ variant: 'cyan', size: 'md' }).card()}>
                    <SideHeader
                        engLabel="HOST STATS"
                        label={`${hostName}の統計`}
                        badge="PUBLIC"
                        className="border-[#44FFFF]/30"
                    />

                    {hostStats ? (
                        <div className="space-y-3 mt-3">
                            <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>REVERSE RATE</div>
                                <div className={sideCard({ size: 'md' }).cardValueWithUnit()}>
                                    {hostStats.reverseRate !== null
                                        ? <>{hostStats.reverseRate}<span className="text-sm text-gray-500 font-bold ml-1">%</span></>
                                        : <span className="text-xl">???</span>
                                    }
                                </div>
                            </div>
                            <div className="text-[10px] text-gray-600 leading-tight">
                                {hostStats.totalHostCount > 0
                                    ? `過去 ${hostStats.totalHostCount} 回のホスト実績に基づく`
                                    : '初回ホストのため統計なし'}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 text-gray-600 text-xs text-center italic">読み込み中...</div>
                    )}
                </div>

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

                {/* 戦略ヒント（ゲストのみ） */}
                {!isCurrentHost && (
                    <div className={sideCard({ variant: 'red', size: 'sm' }).card()}>
                        <SideHeader
                            engLabel="STRATEGY"
                            label="ヒント"
                            badge="HINT"
                            variant="red"
                            className="border-[#FF4444]/30"
                            compact
                        />
                        <div className="text-[10px] text-gray-400 leading-relaxed mt-1">
                            REAL手勝負か、REVERSE読みか...
                        </div>
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
