import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { HandSelectionGrid } from '../../HandSelectionGrid'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { sideCard } from '../phaseCard.styles'

interface BattlePhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    selectedHand: HandType | null
    isProcessing: boolean
    onSelectHand: (hand: HandType) => void
    onSubmit: () => void
    hostName: string
}

export function BattlePhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    selectedHand,
    isProcessing,
    onSelectHand,
    onSubmit,
    hostName
}: BattlePhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    const realHand = jankenEvent.systemRealHand as HandType | null
    const bluffHand = jankenEvent.systemBluffHand as HandType | null

    if (!isCurrentHost) {
        // Guest View
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <PhaseHeader
                    engLabel="BATTLE PHASE"
                    title={`${hostName}に勝つ手を選べ`}
                    subLabel="OBSERVE & DECIDE"
                />

                {/* REAL / BLUFF のラベル表示 */}
                {realHand && bluffHand && (
                    <div className="flex gap-4 justify-center mb-4">
                        <div className="text-center">
                            <div className="text-xs font-bold text-[#44FFFF] tracking-widest mb-1">REAL</div>
                            <div className="text-sm text-gray-300">{getHandDisplayWithEmoji(realHand)}</div>
                        </div>
                        <div className="text-gray-600 font-bold">|</div>
                        <div className="text-center">
                            <div className="text-xs font-bold text-[#FF4444] tracking-widest mb-1">BLUFF</div>
                            <div className="text-sm text-gray-300">{getHandDisplayWithEmoji(bluffHand)}</div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center w-full mb-8">
                    <HandSelectionGrid
                        selectedHand={selectedHand}
                        onSelectHand={onSelectHand}
                        isProcessing={isProcessing}
                        size="small"
                    />
                </div>
                <div className="text-center mt-auto">
                    <GameButton
                        disabled={!selectedHand || isProcessing}
                        onClick={onSubmit}
                    >
                        BATTLE
                    </GameButton>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                    <SideHeader
                        engLabel="HOST ANALYSIS"
                        label={`${hostName}の分析`}
                        badge="PUBLIC"
                        className="border-[#44FFFF]/30"
                    />

                    <div className="space-y-4">
                        {/* REVERSE RATE */}
                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>REVERSE RATE</div>
                            <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>
                                {hostStats?.reverseRate !== null && hostStats?.reverseRate !== undefined
                                    ? <>{hostStats.reverseRate}<span className="text-lg text-gray-500 font-bold ml-1">%</span></>
                                    : '???'
                                }
                            </div>
                            {hostStats && hostStats.totalHostCount > 0 && (
                                <div className="text-xs text-gray-600 mt-1">過去 {hostStats.totalHostCount} 回</div>
                            )}
                        </div>

                        {/* 今回の手 */}
                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>REAL 手</div>
                            <div className={sideCard({ size: 'lg' }).cardValue()}>
                                {realHand ? getHandDisplayWithEmoji(realHand) : '?'}
                            </div>
                        </div>
                        <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>BLUFF 手</div>
                            <div className={sideCard({ size: 'lg' }).cardValue()}>
                                {bluffHand ? getHandDisplayWithEmoji(bluffHand) : '?'}
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto pt-4 text-[10px] text-gray-500 leading-relaxed border-t border-[#44FFFF]/10">
                        <span className="text-[#44FFFF]">Note:</span> REVERSE RATEは{hostName}の過去のホスト時におけるREVERSE選択率です。
                    </div>
                </div>
            </div>
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
            <div className={styles.mainArea()}>
                <PhaseHeader
                    engLabel="WAITING..."
                    title="ゲストの選択を待機中"
                    subLabel="WAITING FOR GUESTS"
                />

                <div className="flex-1 flex flex-col items-center justify-center">
                    {jankenEvent?.finalHostHand ? (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="w-48 h-48 mx-auto relative group">
                                <div className="relative z-10">
                                    <Hand3D
                                        handType={jankenEvent.finalHostHand as HandType}
                                        revealed={true}
                                        size="medium"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 space-y-1">
                                <span className={`text-xs font-bold tracking-[0.2em] block ${jankenEvent.hostChoice === 'STAY' ? 'text-[#44FFFF]' : 'text-[#FF4444]'}`}>
                                    {jankenEvent.hostChoice === 'STAY' ? 'STAY を選択' : 'REVERSE を選択'}
                                </span>
                                <span className="text-gray-500 text-xs">
                                    最終的な手: {getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="w-48 h-48 mx-auto opacity-50">
                            <Hand3D handType={null} revealed={false} size="medium" isRotating={true} />
                        </div>
                    )}
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="flex flex-col gap-4 h-full">
                    <div className={sideCard({ variant: 'red', size: 'lg' }).card()}>
                        <SideHeader
                            engLabel="YOUR STATUS"
                            label="あなたの状況"
                            badge="PRIVATE"
                            variant="red"
                            className="border-[#FF4444]/30"
                        />

                        <div className="space-y-4">
                            <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>選択</div>
                                <div className={`font-black text-xl ${jankenEvent.hostChoice === 'STAY' ? 'text-[#44FFFF]' : 'text-[#FF4444]'}`}>
                                    {jankenEvent.hostChoice ?? '-'}
                                </div>
                            </div>

                            <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>最終的な手</div>
                                <div className={sideCard({ size: 'lg' }).cardValue()}>
                                    {jankenEvent.finalHostHand
                                        ? getHandDisplayWithEmoji(jankenEvent.finalHostHand as HandType)
                                        : '-'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    {hostStats && (
                        <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                            <div className="text-[#44FFFF] font-bold mb-3 text-xs uppercase tracking-wider opacity-70">あなたの統計</div>
                            <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>REVERSE RATE</div>
                                <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>
                                    {hostStats.reverseRate !== null
                                        ? `${hostStats.reverseRate}%`
                                        : '???'
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )

        return (
            <>
                {MainArea()}
                {SideArea()}
            </>
        )
    }
}
