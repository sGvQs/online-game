import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import { HandSelectionGrid } from '../HandSelectionGrid'

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

    if (!isCurrentHost) {
        // Guest View
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <div className="text-center mb-8">
                    <h2 className="text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono">BATTLE PHASE</h2>
                    <h3 className="text-white text-3xl font-bold tracking-wider">{hostName}に勝つ手を選べ</h3>
                    <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] font-mono">OBSERVE & DECIDE</p>
                </div>

                <div className="flex justify-center w-full mb-8">
                    <HandSelectionGrid
                        selectedHand={selectedHand}
                        onSelectHand={onSelectHand}
                        isProcessing={isProcessing}
                        size="small"
                    />
                </div>
                <div className="text-center mt-auto">
                    <button
                        className={cn(styles.button(), styles.buttonPrimary())}
                        disabled={!selectedHand || isProcessing}
                        onClick={onSubmit}
                    >
                        勝負する
                    </button>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="mb-4 border-b-2 border-[#44FFFF] pb-2">
                    <h2 className="text-[#44FFFF] text-xs font-bold tracking-[0.2em] mb-1">DATA ANALYSIS</h2>
                    <h3 className="text-white text-xl font-bold">{hostName}のデータ</h3>
                </div>

                <div className="space-y-4">
                    {/* ホストの初期手 */}
                    {jankenEvent && (
                        <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[#FF4444] font-bold text-xs uppercase tracking-wider">選択した手</span>
                                <span className="text-gray-500 text-[10px] font-mono">INITIAL HAND</span>
                            </div>

                            <div className="flex items-center justify-center gap-2">
                                {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue ? (
                                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                        {getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                    </span>
                                ) : (
                                    <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                                        {getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ホストの統計（公開用） */}
                    {hostStats && (
                        <div className="space-y-1">
                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <div className="flex flex-col">
                                    <span className="text-gray-300 text-sm font-bold">お気に入り</span>
                                    <span className="text-[#44FFFF] text-[10px] uppercase tracking-wider opacity-70">FAVORITE HAND</span>
                                </div>
                                <span className="text-xl font-bold text-white">
                                    {getHandDisplayWithEmoji(
                                        (jankenEvent?.fakeTarget === 'FAVORITE_HAND' && jankenEvent?.fakeFavoriteHandValue
                                            ? jankenEvent.fakeFavoriteHandValue
                                            : hostStats.favoriteHand) as HandType
                                    )}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-gray-800">
                                <div className="flex flex-col">
                                    <span className="text-gray-300 text-sm font-bold">変える確率</span>
                                    <span className="text-[#44FFFF] text-[10px] uppercase tracking-wider opacity-70">CHANGE RATE</span>
                                </div>
                                <span className="text-xl font-bold text-white font-mono">
                                    {jankenEvent?.fakeTarget === 'CHANGE_RATE' && jankenEvent?.fakeChangeRateValue !== null && jankenEvent?.fakeChangeRateValue !== undefined
                                        ? jankenEvent.fakeChangeRateValue
                                        : hostStats.changeRate}%
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {hostStats && (
                    <div className="mt-auto pt-4 text-[10px] text-gray-500 leading-relaxed border-t border-gray-900">
                        * 全てのデータは{hostName}の過去の動向を正確に表していますが、<span className="text-[#FF4444]">嘘の情報</span>が紛れています。
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
    } else {
        // Host View
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <div className="text-center mb-8">
                    <h2 className="text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-mono">WAITING...</h2>
                    <h3 className="text-white text-3xl font-bold tracking-wider">ゲストの選択を待機中</h3>
                    <p className="text-gray-500 text-xs mt-1 tracking-[0.2em] font-mono">WAITING FOR GUESTS</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center">
                    {jankenEvent?.finalHostHand ? (
                        <div className="text-center animate-in zoom-in duration-500">
                            <div className="w-48 h-48 mx-auto relative group">
                                <div className="relative z-10">
                                    <Hand3D
                                        handType={jankenEvent.finalHostHand as HandType}
                                        revealed={true}
                                        size="small"
                                    />
                                </div>
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
                <div className="mb-4 border-b-2 border-[#44FFFF] pb-2">
                    <h2 className="text-[#44FFFF] text-xs font-bold tracking-[0.2em] mb-1">STATUS MONITOR</h2>
                    <h3 className="text-white text-xl font-bold">あなたの状況</h3>
                </div>

                {jankenEvent && (
                    <div className="space-y-6">
                        {/* 初期手 */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[#FF4444] font-bold text-xs uppercase tracking-wider">選択した手</span>
                            </div>
                            <div className="bg-[#1a1a1a] p-3 rounded border border-gray-800 flex items-center gap-3">
                                <span className="text-2xl">{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                            </div>
                        </div>

                        {/* 嘘の情報 */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[#FF4444] font-bold text-xs uppercase tracking-wider">偽装工作</span>
                                <span className="text-[#FF4444] font-bold text-[10px] border border-[#FF4444] px-1 rounded">ACTIVE</span>
                            </div>

                            <div className="bg-[#1a1a1a] rounded border border-gray-800 overflow-hidden">
                                <div className="flex justify-between items-center p-3 border-b border-gray-800">
                                    <span className="text-gray-400 text-xs font-bold">偽装ターゲット</span>
                                    <span className="text-white text-sm font-bold">
                                        {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND' && '選択した手'}
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && '変える確率'}
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'お気に入り'}
                                    </span>
                                </div>

                                {jankenEvent.fakeTarget !== 'NONE' && (
                                    <div className="flex justify-between items-center p-3 bg-[#FF4444]/5">
                                        <span className="text-[#FF4444] text-xs font-bold">偽装値 (公開中)</span>
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

                {/* リアル統計 */}
                {hostStats && (
                    <div className="mt-8 pt-4 border-t border-gray-800">
                        <div className="text-[#44FFFF] font-bold mb-3 text-xs uppercase tracking-wider opacity-70">REAL DATA reference</div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Real Favorite</span>
                                <span>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Real Change Rate</span>
                                <span>{hostStats.realChangeRate}%</span>
                            </div>
                        </div>
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
}
