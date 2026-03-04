import { JankenEventWithGuests, HandType, MatchScoreWithUser } from '@/types'
import { Hand3D } from '@/components/game/nullHandGame/Hand3D'
import { nullHandGame } from '@/components/game/nullHandGame/styles'
import { getHandDisplayWithEmoji } from '@/components/game/nullHandGame/utils'
import { PhaseHeader } from '@/components/game/nullHandGame/common/PhaseHeader'
import { CurrentScores } from '@/components/game/nullHandGame/common/CurrentScores'
import { RewardSystem } from '@/components/game/nullHandGame/common/RewardSystem'
import { WaitingDisplay } from '@/components/game/nullHandGame/common/WaitingDisplay'
import { GameButton } from '@/components/game/nullHandGame/common/GameButton'
import { motion } from 'framer-motion'
import { useSE } from '@/hooks/useSE'

interface DealPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    isCurrentHost: boolean
    isProcessing: boolean
    onDeal: () => Promise<void>
    hostName: string
    titleHand: HandType
    currentScores: MatchScoreWithUser[]
    currentUserId: string
    userColor?: string
}

export function DealPhase({
    jankenEvent,
    isCurrentHost,
    isProcessing,
    onDeal,
    hostName,
    titleHand,
    currentScores,
    currentUserId,
    userColor,
}: DealPhaseProps) {
    const styles = nullHandGame()
    const { play } = useSE()

    const systemHandsRevealed = !!jankenEvent?.systemRealHand

    const HandDisplay = ({ hand, label, color }: { hand: HandType | null; label: string; color: 'cyan' | 'red' }) => (
        <div className={`flex flex-col items-center gap-3 p-6 border ${color === 'cyan' ? 'border-[#44FFFF]/30' : 'border-[#FF4444]/30'} bg-black/40`}>
            <div className={`text-xs font-black tracking-[0.3em] uppercase ${color === 'cyan' ? 'text-[#44FFFF]' : 'text-[#FF4444]'}`}>
                {label}
            </div>
            <div className="w-32 h-32 relative">
                {hand ? (
                    <Hand3D handType={hand} revealed={true} size="medium" personalColor={undefined} />
                ) : (
                    <Hand3D handType={null} revealed={false} size="medium" isRotating={true} />
                )}
            </div>
            {hand && (
                <div className="text-white font-bold text-lg">
                    {getHandDisplayWithEmoji(hand)}
                </div>
            )}
        </div>
    )

    const MainArea = () => (
        <motion.div className={styles.mainArea()} layout transition={{ duration: 0.3 }}>
            <PhaseHeader
                engLabel="SYSTEM DEAL"
                title="システムが手を配布"
                subLabel="OBSERVE THE DEAL"
                currentTurn={jankenEvent?.turnNumber}
                totalTurns={jankenEvent?.match.totalTurns}
            />

            <div className="flex-1 flex flex-col items-center justify-center gap-8">
                {!systemHandsRevealed ? (
                    // ホスト待機前（まだDEALされていない）
                    <div className="text-center space-y-4">
                        <div className="text-gray-400 text-sm tracking-widest">
                            {isCurrentHost ? 'ゲームを開始してください' : 'ホストがゲームを開始するのを待っています'}
                        </div>
                        <div className="flex gap-8 opacity-30">
                            <HandDisplay hand={null} label="REAL" color="cyan" />
                            <HandDisplay hand={null} label="BLUFF" color="red" />
                        </div>
                    </div>
                ) : (
                    // DEAL済み（全員に公開）
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex gap-8"
                    >
                        <HandDisplay hand={jankenEvent.systemRealHand as HandType} label="REAL" color="cyan" />
                        <HandDisplay hand={jankenEvent.systemBluffHand as HandType} label="BLUFF" color="red" />
                    </motion.div>
                )}

                {/* ルール説明 */}
                <div className="max-w-sm text-center space-y-2 text-xs text-gray-500 leading-relaxed border border-gray-800 p-4 bg-black/20">
                    <div className="text-[#44FFFF] font-bold text-xs mb-2">RULE</div>
                    <p>
                        <span className="text-[#44FFFF]">REAL</span> は <span className="text-[#FF4444]">BLUFF</span> に必ず勝ちます。
                    </p>
                    <p>
                        ホストは <span className="text-white font-bold">STAY</span>（REALを出す）か
                        <span className="text-white font-bold"> REVERSE</span>（BLUFFを出す）かを選択します。
                    </p>
                    <p>
                        過去のホストの <span className="text-white font-bold">REVERSE RATE</span> を参考に手を選んでください。
                    </p>
                </div>
            </div>

            {isCurrentHost && (
                <div className="mt-auto text-center">
                    <GameButton
                        disabled={isProcessing}
                        onClick={() => { play('submit'); onDeal() }}
                    >
                        NEXT
                    </GameButton>
                </div>
            )}
        </motion.div>
    )

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            <div className="flex flex-col gap-4 h-full">
                {/* 状態表示カード */}
                {isCurrentHost ? (
                    <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-xl p-4">
                        <div className="flex items-center gap-2 border-b border-[#44FFFF]/30 pb-2 mb-2">
                            <div className="w-1.5 h-1.5 bg-[#44FFFF] rounded-full animate-pulse" />
                            <span className="text-[10px] font-black tracking-widest text-[#44FFFF] uppercase">YOUR TURN</span>
                            <span className="text-[8px] bg-[#44FFFF] text-black px-1 font-black rounded-[2px] ml-auto">HOST</span>
                        </div>
                        <div className="space-y-2">
                            <div className="text-[10px] text-gray-400 leading-relaxed">
                                <span className="text-[#44FFFF] font-bold">STEP 1:</span> 手を確認し「NEXT」で進む
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="border border-gray-800 rounded bg-[#111] p-4 flex flex-col items-center justify-center">
                        <WaitingDisplay
                            engLabel="WAITING FOR"
                            text={hostName}
                            subText="ホストの確認待ち..."
                            handType={titleHand}
                            isRotating={true}
                        />
                    </div>
                )}

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
