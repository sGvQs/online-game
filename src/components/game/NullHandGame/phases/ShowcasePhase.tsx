import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import { PhaseHeader } from '../common/PhaseHeader'
import { SideHeader } from '../common/SideHeader'
import { GameButton } from '../common/GameButton'

interface ShowcasePhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    isProcessing: boolean
    onConfirm: () => void
    hostName: string
    currentUserId: string
}

export function ShowcasePhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    isProcessing,
    onConfirm,
    hostName,
    currentUserId
}: ShowcasePhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    const isConfirmed = jankenEvent.guestHands.some(gh => gh.userId === currentUserId && gh.isConfirmed)

    const MainArea = () => (
        <div className={styles.mainArea()}>
            <PhaseHeader
                engLabel="OBSERVATION"
                title={`${hostName}の手を観察`}
                subLabel="CHECK THE ENEMY"
            />

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className="relative group w-64 h-64 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 bg-[#44FFFF]/5 rounded-full blur-2xl group-hover:bg-[#44FFFF]/10 transition-all duration-500" />
                    <div className="relative z-10 w-full h-full">
                        <Hand3D
                            handType={
                                (jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue
                                    ? jankenEvent.fakeHandValue
                                    : jankenEvent.initialHand) as HandType
                            }
                            revealed={!!jankenEvent.initialHand}
                            size="medium"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-8">
                {!isCurrentHost && (
                    <div className="text-center">
                        {isConfirmed ? (
                            <div className="flex flex-col items-center gap-2 animate-pulse">
                                <span className="text-[#44FFFF] font-bold tracking-widest text-sm">WAITING FOR OTHERS...</span>
                                <span className="text-gray-500 text-xs">他のゲストの確認を待っています</span>
                            </div>
                        ) : (
                            <GameButton
                                className="w-full max-w-sm mx-auto"
                                disabled={isProcessing}
                                onClick={onConfirm}
                            >
                                Confirm and Next
                            </GameButton>
                        )}
                    </div>
                )}

                {isCurrentHost && (
                    <div className="flex flex-col items-center gap-2 animate-pulse text-center">
                        <span className="text-[#44FFFF] font-bold tracking-widest text-sm">WAITING FOR GUESTS...</span>
                        <span className="text-gray-500 text-xs">ゲストの確認を待っています</span>
                    </div>
                )}
            </div>
        </div >
    )

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-xl p-6 flex-1 flex flex-col">
                <SideHeader
                    engLabel="DATA ANALYSIS"
                    label={`${hostName}のデータ`}
                    badge="PUBLIC"
                    className="border-[#44FFFF]/30 mb-6"
                />

                {hostStats && (
                    <div className="space-y-4">
                        <div className="bg-black/30 rounded-lg p-4 border border-[#44FFFF]/10">
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">お気に入り</div>
                            <div className="text-2xl font-bold text-white">
                                {jankenEvent.fakeTarget === 'FAVORITE_HAND' && jankenEvent.fakeFavoriteHandValue
                                    ? getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)
                                    : getHandDisplayWithEmoji(hostStats.favoriteHand as HandType)}
                            </div>
                        </div>

                        <div className="bg-black/30 rounded-lg p-4 border border-[#44FFFF]/10">
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-1">変える確率</div>
                            <div className="text-2xl font-bold text-white font-mono">
                                {jankenEvent.fakeTarget === 'CHANGE_RATE' && jankenEvent.fakeChangeRateValue
                                    ? jankenEvent.fakeChangeRateValue
                                    : hostStats.changeRate}<span className="text-lg text-gray-500 font-bold ml-1">%</span>
                            </div>
                        </div>

                        <div className="mt-auto pt-6 text-[10px] text-gray-500 leading-relaxed border-t border-[#44FFFF]/10">
                            <span className="text-[#44FFFF]">Note:</span> 全てのデータは{hostName}の過去の動向を正確に表していますが、<span className="text-[#FF4444] font-bold">嘘の情報</span>が紛れています。
                            <br />
                            <span className="text-[9px] text-gray-600 block mt-1">（選択した手、お気に入り、変える確率、のどれか一つは嘘です）</span>
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
