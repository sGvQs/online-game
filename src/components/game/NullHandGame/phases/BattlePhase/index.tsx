import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { getHandDisplayWithEmoji } from '../../utils'
import { HandSelectionGrid } from '../../HandSelectionGrid'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { sideCard } from '../phaseCard.styles'
import { battlePhase } from './styles'

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
    const bpStyles = battlePhase()

    if (!jankenEvent) return null

    if (!isCurrentHost) {
        // Guest View
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <PhaseHeader
                    engLabel="BATTLE PHASE"
                    title={`${hostName}に勝つ手を選べ`}
                    subLabel="OBSERVE & DECIDE"
                />

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
                        engLabel="DATA ANALYSIS"
                        label={`${hostName}のデータ`}
                        badge="PUBLIC"
                        className="border-[#44FFFF]/30"
                    />

                    <div className="space-y-4">
                        {/* ホストの初期手 */}
                        {jankenEvent && (
                            <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                <div className={sideCard().cardTitle()}>選択した手</div>
                                <div className={sideCard({ size: 'lg' }).cardValue()}>
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue
                                        ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                        : getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                </div>
                            </div>
                        )}

                        {/* ホストの統計（公開用） */}
                        {hostStats && (
                            <>
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>お気に入り</div>
                                    <div className={sideCard({ size: 'lg' }).cardValue()}>
                                        {getHandDisplayWithEmoji(
                                            (jankenEvent?.fakeTarget === 'FAVORITE_HAND' && jankenEvent?.fakeFavoriteHandValue
                                                ? jankenEvent.fakeFavoriteHandValue
                                                : hostStats.favoriteHand) as HandType
                                        )}
                                    </div>
                                </div>

                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>変える確率</div>
                                    <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>
                                        {jankenEvent?.fakeTarget === 'CHANGE_RATE' && jankenEvent?.fakeChangeRateValue !== null && jankenEvent?.fakeChangeRateValue !== undefined
                                            ? jankenEvent.fakeChangeRateValue
                                            : hostStats.changeRate}<span className="text-lg text-gray-500 font-bold ml-1">%</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {hostStats && (
                        <div className="mt-auto pt-4 text-[10px] text-gray-500 leading-relaxed border-t border-[#44FFFF]/10">
                            <span className="text-[#44FFFF]">Note:</span> 全てのデータは{hostName}の過去の動向を正確に表していますが、<span className="text-[#FF4444] font-bold">嘘の情報</span>が紛れています。
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
                                <p className="text-[12px] text-gray-500 text-center">
                                    {(() => {
                                        switch (jankenEvent.finalHostHand as HandType) {
                                            case HandType.ROCK: return 'ゲストがチョキならあなたの勝ちです'
                                            case HandType.SCISSORS: return 'ゲストがパーならあなたの勝ちです'
                                            case HandType.PAPER: return 'ゲストがグーならあなたの勝ちです'
                                            default: return ''
                                        }
                                    })()}
                                </p>
                            </div>

                            <div className="mt-6">
                                <span className="text-[#44FFFF] text-xs font-bold tracking-[0.2em] block mb-1">YOUR DECISION</span>
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
                    {/* 選択した手 + 嘘の情報カード */}
                    {jankenEvent && (
                        <div className={sideCard({ variant: 'red', size: 'lg' }).card()}>
                            <SideHeader
                                engLabel="STATUS MONITOR"
                                label="あなたの状況"
                                badge="PRIVATE"
                                variant="red"
                                className="border-[#FF4444]/30"
                            />

                            <div className="space-y-4">
                                <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>選択した手</div>
                                    <div className={sideCard({ size: 'lg' }).cardValue()}>
                                        {getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </div>
                                </div>

                                <div className={sideCard({ variant: 'red', size: 'sm' }).dataBlock()}>
                                    <div className="flex justify-between items-center mb-2">
                                        <div className={sideCard().cardTitle()}>嘘の情報</div>
                                        <span className="text-[#FF4444] font-bold text-[10px] border border-[#FF4444]/30 px-1.5 py-0.5 rounded">ACTIVE</span>
                                    </div>
                                    <div className="text-white font-bold text-sm">
                                        {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && '選択した手'}
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && '変える確率'}
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'お気に入り'}
                                    </div>
                                    {jankenEvent.fakeTarget !== 'NONE' && (
                                        <div className="mt-2 pt-2 border-t border-[#FF4444]/10 flex justify-between items-center">
                                            <span className="text-[#FF4444] text-xs font-bold">嘘の値</span>
                                            <span className="text-white font-bold font-mono">
                                                {jankenEvent.fakeTarget === 'INITIAL_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                                {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                                {jankenEvent.fakeTarget === 'FAVORITE_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* リアル統計カード */}
                    {hostStats && (
                        <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                            <div className="text-[#44FFFF] font-bold mb-3 text-xs uppercase tracking-wider opacity-70">あなたの情報</div>
                            <div className="space-y-3">
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>お気に入り</div>
                                    <div className={sideCard({ size: 'lg' }).cardValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</div>
                                </div>
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>変える確率</div>
                                    <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>{hostStats.realChangeRate}%</div>
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
