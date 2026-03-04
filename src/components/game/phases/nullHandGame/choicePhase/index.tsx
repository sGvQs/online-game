import { JankenEventWithGuests, HostStats, HostChoice, HandType, MatchScoreWithUser } from '@/types'
import { Hand3D } from '@/components/game/common/nullHand/hand3D'
import { PlayerFaceIcon } from '@/components/game/common/nullHand/playerFaceIcon'
import { choicePhase } from './styles'
import { PhaseHeader } from '@/components/game/common/nullHand/phaseHeader'
import { CurrentScores } from '@/components/game/common/nullHand/currentScores'
import { RewardSystem } from '@/components/game/common/nullHand/rewardSystem'
import { motion } from 'framer-motion'
import { useSE } from '@/hooks/useSE'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { GameButton } from '@/components/game/common/nullHand/gameButton'

interface ChoicePhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    isProcessing: boolean
    onChoice: (choice: HostChoice) => Promise<void>
    hostName: string
    hostFaceIcon?: import('@/constants/common/faceIcon').FaceIcon | null
    /** カスタムホストアイコン（恐竜など）。hostFaceIcon より優先 */
    hostCustomIconSrc?: string | null
    currentScores: MatchScoreWithUser[]
    currentUserId: string
    userColor?: string
}

export function ChoicePhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    isProcessing,
    onChoice,
    hostName,
    hostFaceIcon,
    hostCustomIconSrc,
    currentScores,
    currentUserId,
    userColor,
}: ChoicePhaseProps) {
    const styles = choicePhase()
    const { play } = useSE()

    // CHOICEとBLUFFの枠を入れ替えるためのアニメーション状態
    const [isSwapped, setIsSwapped] = useState(false)

    // システム選択演出用ステート
    const [selectionStep, setSelectionStep] = useState(0)

    // 演出タイマー
    useEffect(() => {
        if (selectionStep === 0) {
            const t = setTimeout(() => {
                setSelectionStep(1)
                play('select')
            }, 4000) // 2s: Real Hand フェードイン
            return () => clearTimeout(t)
        } else if (selectionStep === 1) {
            const t = setTimeout(() => {
                setSelectionStep(2)
                play('select')
            }, 2000) // 4s: Bluff Hand フェードイン
            return () => clearTimeout(t)
        } else if (selectionStep === 2) {
            const t = setTimeout(() => {
                setSelectionStep(3)
                play('submit')
            }, 2000) // 6s: SYSTEM SELECTION ラベル点灯
            return () => clearTimeout(t)
        } else if (selectionStep === 3) {
            const t = setTimeout(() => {
                setSelectionStep(4)
            }, 1000) // 7s: 通常UIへ
            return () => clearTimeout(t)
        }
    }, [selectionStep, play])

    useEffect(() => {
        // 演出中（step 4未満）またはホスト自身の場合は自動入れ替えを停止
        if (isCurrentHost || selectionStep < 4) return

        const interval = setInterval(() => {
            setIsSwapped(prev => !prev)
        }, 2000)
        return () => clearInterval(interval)
    }, [isCurrentHost, selectionStep])

    if (!jankenEvent) return null

    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    const MainArea = () => (
        <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
            <PhaseHeader
                engLabel={isCurrentHost ? "あなたはホストです" : "あなたはゲストです"}
                title={isCurrentHost ? "勝負に出す手を選んでください" : "しばらくお待ちください..."}
                subLabel={selectionStep < 4 ? "システムが選択肢を生成しています..." : (!isCurrentHost ? `${hostName}がホストです` : "")}
                currentTurn={jankenEvent?.turnNumber}
                totalTurns={jankenEvent?.match.totalTurns}
            />

            {/* ホストの統計情報 / 演出中のテキスト */}
            <div className="h-16 flex items-center justify-center">
                {selectionStep < 4 ? (
                    <motion.div
                        key="generating"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-center items-center gap-2 text-gray-500 text-xs font-mono tracking-widest animate-pulse"
                    >
                        <span className="w-2 h-2 bg-[#FF4444] rounded-full" />
                        SYSTEM: GENERATING HANDS...
                    </motion.div>
                ) : (
                    hostStats && (
                        <motion.div
                            key="stats"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-2"
                        >
                            <div className="flex justify-center items-center gap-2 text-gray-400 text-xs">
                                <div className={cn("w-2 h-2 rounded-full animate-pulse mr-2", isCurrentHost ? "bg-[#44FFFF]" : "bg-[#FF4444]")} />
                                {isCurrentHost ? "あなたは" : `${hostName}は`}過去に <span className="text-[#FF4444] text-sm font-bold">{hostStats.reverseRate !== null
                                    ? 100 - hostStats.reverseRate
                                    : '???'
                                }%</span> の確率で <span className="text-[#44FFFF] text-sm font-bold"> SYSTEM SELECTION </span> を選んでいます
                            </div>
                            {isCurrentHost ? (
                                <p className="flex justify-center items-center gap-2 text-gray-400 animate-pulse text-xs">
                                    上記のデータはゲストに公開されています...
                                </p>
                            ) : (
                                <p className="flex justify-center items-center gap-2 text-gray-400 animate-pulse text-xs">
                                    {hostName}は現在選択中です...
                                </p>

                            )}
                        </motion.div>
                    )
                )}
            </div>

            <div className="flex flex-col items-center justify-center gap-8 mt-4">
                {/* CHOICE vs BLUFF のコンテナ（高さ固定、大型化） */}
                <div className="relative w-120 h-48 flex items-center justify-center">
                    {/* 固定レイヤー：3Dの手 */}
                    <div className="absolute inset-0 flex items-center justify-between pointer-events-none px-4">
                        {/* REAL (Left) */}
                        <motion.div
                            layoutId="hand-slot-left"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: selectionStep >= 1 ? 1 : 0 }}
                            className="flex flex-col items-center gap-1 translate-y-2"
                        >
                            <div className="w-48 h-48 flex items-center justify-center">
                                {realHand && <Hand3D handType={realHand} revealed={true} size="small" personalColor={isCurrentHost ? userColor : undefined} />}
                            </div>
                            <div className="h-6">
                                {selectionStep >= 3 && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs text-[#44FFFF] font-black tracking-widest text-center translate-y-2 px-3 py-2"
                                    >
                                        SYSTEM SELECTION
                                    </motion.p>
                                )}
                            </div>
                        </motion.div>

                        {/* BLUFF (Right) */}
                        <motion.div
                            layoutId="hand-slot-right"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: selectionStep >= 2 ? 1 : 0 }}
                            className="flex flex-col items-center gap-1 translate-y-2"
                        >
                            <div className="w-48 h-48 flex items-center justify-center">
                                {bluffHand && <Hand3D handType={bluffHand} revealed={true} size="small" personalColor={isCurrentHost ? userColor : undefined} />}
                            </div>
                            <div className="h-6 mt-4" />
                        </motion.div>
                    </div>

                    {/* アニメーションレイヤー：動く枠 */}
                    {selectionStep === 4 && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-between px-4"
                        >
                            <motion.div
                                layout
                                layoutId="hand-slot-left-frame"
                                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                className={cn("flex flex-col items-center gap-1 cursor-pointer", isSwapped ? 'order-3' : 'order-1')}
                                onClick={() => {
                                    if (isCurrentHost && !isProcessing) {
                                        play('select')
                                        setIsSwapped(prev => !prev)
                                    }
                                }}
                            >
                                <div className="flex items-end gap-2">
                                    <PlayerFaceIcon faceIcon={hostFaceIcon} customSrc={hostCustomIconSrc} size="sm" />
                                    <div
                                        className="text-xs font-black tracking-[0.3em] [color:var(--choice-color)]"
                                        style={{ ['--choice-color' as string]: isCurrentHost ? (userColor || '#FF4444') : '#FF4444' }}
                                    >
                                        {hostName}
                                    </div>
                                </div>
                                <div
                                    className="w-48 h-48 border-2 [border-color:var(--choice-color)]"
                                    style={{ ['--choice-color' as string]: isCurrentHost ? (userColor || '#FF4444') : '#FF4444' }}
                                />
                                <div className="h-4" />
                            </motion.div>
                            <div className="order-2 text-gray-500 font-black text-xl translate-y-4">OR</div>

                            <motion.div
                                layout
                                layoutId="hand-slot-right-frame"
                                transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
                                className={cn("flex flex-col items-center gap-1 cursor-pointer", isSwapped ? 'order-1' : 'order-3')}
                                onClick={() => {
                                    if (isCurrentHost && !isProcessing) {
                                        play('select')
                                        setIsSwapped(prev => !prev)
                                    }
                                }}
                            >
                                <div className="w-48 h-48" />
                                <div className="h-4" />
                            </motion.div>
                        </motion.div>
                    )}
                </div>

                {/* ボタンエリア */}
                <div className="h-20 flex items-center justify-center mt-12">
                    {selectionStep === 4 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex gap-6"
                        >
                            {isCurrentHost && (
                                <div className="flex gap-6">
                                    <GameButton
                                        variant="secondary"
                                        onClick={() => { setIsSwapped(prev => !prev) }}
                                        disabled={isProcessing}
                                    >
                                        CHANGE
                                    </GameButton>
                                    <GameButton
                                        variant="cyan"
                                        onClick={() => {
                                            onChoice(isSwapped ? 'REVERSE' : 'STAY')
                                        }}
                                        disabled={isProcessing}
                                    >
                                        SUBMIT
                                    </GameButton>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    )

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">
                <CurrentScores
                    currentScores={currentScores}
                    currentUserId={currentUserId}
                    hostId={jankenEvent?.currentHostId}
                    size="md"
                    userColor={userColor}
                />
                <RewardSystem
                    isHost={isCurrentHost}
                    userColor={userColor}
                    size="md"
                />
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
