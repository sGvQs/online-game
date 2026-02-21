import { HandType, JankenEventWithGuests, HostStats, MatchScoreWithUser } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { HandSelectionGrid } from '../../HandSelectionGrid'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { sideCard } from '../phaseCard.styles'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
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
    currentScores: MatchScoreWithUser[]
    currentUserId: string
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
    currentScores,
    currentUserId
}: BattlePhaseProps) {
    const styles = nullHandGame()


    if (!jankenEvent) return null

    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    if (!isCurrentHost) {
        // Guest View
        const MainArea = () => (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <PhaseHeader
                    engLabel="BATTLE PHASE"
                    title={`${hostName}に勝つ手を選べ`}
                    subLabel=""
                />

                {/* ホストの統計情報 (ChoicePhaseを踏襲したスタイル) */}
                {hostStats && (
                    <div className="flex flex-col items-center mt-6 mb-2 w-full">
                        <div className="inline-flex flex-col items-start text-gray-400 text-xs text-left">
                            <div className="flex items-center leading-relaxed">
                                <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2 flex-shrink-0" />
                                <span>
                                    {hostName}は過去に
                                    <span className="text-[#44FFFF] text-sm font-bold mx-1">
                                        {hostStats.reverseRate !== null ? 100 - hostStats.reverseRate : '???'}%
                                    </span>
                                    の確率で
                                    <span className="text-[#44FFFF] text-sm font-bold ml-1">DEFAULT CHOICE</span>
                                    を選びます
                                </span>
                            </div>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-[#44FFFF] rounded-full animate-pulse mr-2 flex-shrink-0" />
                                <span>
                                    {hostName}は下に<span className="text-[#44FFFF] text-sm font-bold">表示されている🖐️</span>しか選ぶことはできません
                                </span>
                            </div>

                        </div>
                    </div>
                )}

                {/* ホストの選択肢 (小型版フレーム演出) */}
                <div className="flex flex-col items-center justify-center gap-4 mb-8">
                    <div className="relative w-80 h-32 flex items-center justify-center scale-90">
                        {/* 固定レイヤー：3Dの手 */}
                        <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-32 h-32 flex items-center justify-center">
                                    {realHand && <Hand3D handType={realHand} revealed={true} size="small" />}
                                </div>
                                <p className="text-[10px] text-[#44FFFF] font-bold text-center -translate-y-4">DEFAULT CHOICE</p>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="w-32 h-32">
                                    {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" />}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    <HandSelectionGrid
                        selectedHand={selectedHand}
                        onSelectHand={onSelectHand}
                        isProcessing={isProcessing}
                        size="small"
                    />

                    <div className="text-center mt-8">
                        <GameButton
                            disabled={!selectedHand || isProcessing}
                            onClick={onSubmit}
                            variant="primary"
                        >
                            BATTLE !!
                        </GameButton>
                    </div>
                </div>
            </motion.div>
        )

        const SideArea = () => (
            <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
                <div className="flex flex-col gap-4 h-full">
                    {/* スコア表示カード (ChoicePhaseと共通) */}
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
                            label="バトル中"
                            variant="red"
                            className="border-[#FF4444]/30"
                            compact
                        />
                        <div className="text-[10px] text-gray-400 leading-relaxed mt-1 italic">
                            ホストの手を読み切り、勝利を掴め。
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
    } else {
        // Host View
        const MainArea = () => (
            <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
                <PhaseHeader
                    engLabel="WAITING..."
                    title="ゲストが選択しています"
                    subLabel="PREPARING FOR BATTLE"
                />

                <div className="flex-1 flex flex-col items-center justify-center">
                    {jankenEvent?.finalHostHand ? (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="w-56 h-56 mx-auto relative">
                                <Hand3D
                                    handType={jankenEvent.finalHostHand as HandType}
                                    revealed={true}
                                    size="medium"
                                />
                            </div>

                            <div className="mt-8 space-y-2">
                                <div className={cn(
                                    "px-8 py-2 border-2 text-xl font-black tracking-[0.5em] inline-block",
                                    jankenEvent.hostChoice === 'STAY' ? 'border-[#44FFFF] text-[#44FFFF] bg-[#44FFFF]/10' : 'border-[#FF4444] text-[#FF4444] bg-[#FF4444]/10'
                                )}>
                                    {jankenEvent.hostChoice === 'STAY' ? 'STAY' : 'REVERSE'}
                                </div>
                                <p className="text-gray-500 text-xs tracking-widest mt-2 uppercase">
                                    Your Final Hand: <span className="text-white font-bold ml-2">{getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)}</span>
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="w-48 h-48 mx-auto opacity-50">
                            <Hand3D handType={null} revealed={false} size="medium" isRotating={true} />
                        </div>
                    )}
                </div>
            </motion.div>
        )

        const SideArea = () => (
            <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
                <div className="flex flex-col gap-4 h-full">
                    <div className={sideCard({ variant: 'red', size: 'lg' }).card() + " flex-1 flex flex-col"}>
                        <SideHeader
                            engLabel="YOUR STATUS"
                            label="あなたの選択"
                            badge="PRIVATE"
                            variant="red"
                            className="border-[#FF4444]/30"
                        />

                        <div className="mt-6 space-y-6">
                            <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>CHOICE</div>
                                <div className={cn(
                                    "font-black text-2xl tracking-widest",
                                    jankenEvent.hostChoice === 'STAY' ? 'text-[#44FFFF]' : 'text-[#FF4444]'
                                )}>
                                    {jankenEvent.hostChoice ?? '-'}
                                </div>
                            </div>

                            <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>RESULT HAND</div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="text-3xl">
                                        {jankenEvent.finalHostHand ? getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType).split(' ')[0] : '-'}
                                    </div>
                                    <div className="text-lg font-black text-white">
                                        {jankenEvent.finalHostHand ? getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType).split(' ')[1] : '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-white/5">
                            <p className="text-[10px] text-gray-500 leading-relaxed italic text-center">
                                ゲストに悟られぬよう、冷静に待機してください。
                            </p>
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
}
