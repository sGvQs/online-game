import { JankenEventWithGuests, HandType } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { WaitingDisplay } from '../../common/WaitingDisplay'
import { GameButton } from '../../common/GameButton'
import { sideCard } from '../phaseCard.styles'
import { motion } from 'framer-motion'
import { useSE } from '@/hooks/useSE'

interface DealPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    isCurrentHost: boolean
    isProcessing: boolean
    onDeal: () => Promise<void>
    hostName: string
    titleHand: HandType
}

export function DealPhase({
    jankenEvent,
    isCurrentHost,
    isProcessing,
    onDeal,
    hostName,
    titleHand,
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
                    <Hand3D handType={hand} revealed={true} size="medium" />
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
                        START DEAL
                    </GameButton>
                </div>
            )}
        </motion.div>
    )

    const SideArea = () => (
        <motion.div className={styles.sideArea()} layout transition={{ duration: 0.3 }}>
            {isCurrentHost ? (
                <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                    <SideHeader
                        engLabel="YOUR TURN"
                        label="あなたがホストです"
                        badge="HOST"
                        className="border-[#44FFFF]/30"
                    />
                    <div className="space-y-4 mt-4">
                        <div className="text-xs text-gray-400 leading-relaxed">
                            <span className="text-[#44FFFF] font-bold">STEP 1:</span> 「START DEAL」を押してシステムに手を配布させる
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed">
                            <span className="text-[#44FFFF] font-bold">STEP 2:</span> STAY（REALをそのまま）かREVERSE（BLUFFに変更）かを選択する
                        </div>
                        <div className="text-xs text-gray-400 leading-relaxed">
                            <span className="text-white font-bold">ヒント:</span> REVERSEを選んだ場合、BLUFFで出すため他のゲストに負ける可能性が高いですが、相手の裏をかくことができます。
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-full border border-gray-800 rounded bg-[#111]">
                    <WaitingDisplay
                        engLabel="WAITING FOR"
                        text={hostName}
                        subText="ホストがゲームを開始するのを待っています..."
                        handType={titleHand}
                        isRotating={true}
                    />
                </div>
            )}
        </motion.div>
    )

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
