import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../../utils'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { GameButton } from '../../common/GameButton'
import { showcasePhase } from './styles'
import { sideCard } from '../phaseCard.styles'

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
    const scStyles = showcasePhase()

    if (!jankenEvent) return null

    const isConfirmed = jankenEvent.guestHands.some(gh => gh.userId === currentUserId)

    const MainArea = () => (
        <div className={styles.mainArea()}>
            <PhaseHeader
                engLabel="OBSERVATION"
                title={`${hostName}の手を観察`}
                subLabel="CHECK THE ENEMY"
            />

            <div className="flex-1 flex flex-col items-center justify-center">
                <div className={scStyles.handContainer()}>
                    <div className={scStyles.handGlow()} />
                    <div className={scStyles.handInner()}>
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
                            <div className={scStyles.waitingPulse()}>
                                <span className={scStyles.waitingLabel()}>WAITING FOR OTHERS...</span>
                                <span className={scStyles.waitingSubLabel()}>他のゲストの確認を待っています</span>
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
                    <div className={cn(scStyles.waitingPulse(), "text-center")}>
                        <span className={scStyles.waitingLabel()}>WAITING FOR GUESTS...</span>
                        <span className={scStyles.waitingSubLabel()}>ゲストの確認を待っています</span>
                    </div>
                )}
            </div>
        </div >
    )

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                <SideHeader
                    engLabel="DATA ANALYSIS"
                    label={`${hostName}のデータ`}
                    badge="PUBLIC"
                    className="border-[#44FFFF]/30 mb-6"
                />

                {hostStats && (
                    <div className="space-y-4">
                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>お気に入り</div>
                            <div className={sideCard({ size: 'lg' }).cardValue()}>
                                {hostStats.favoriteHand === null
                                    ? '???'
                                    : jankenEvent.fakeTarget === 'FAVORITE_HAND' && jankenEvent.fakeFavoriteHandValue
                                        ? getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)
                                        : getHandDisplayWithEmoji(hostStats.favoriteHand as HandType)}
                            </div>
                        </div>

                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>変える確率</div>
                            <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>
                                {hostStats.changeRate === null
                                    ? '???'
                                    : <>{jankenEvent.fakeTarget === 'CHANGE_RATE' && jankenEvent.fakeChangeRateValue !== null && jankenEvent.fakeChangeRateValue !== undefined
                                        ? jankenEvent.fakeChangeRateValue
                                        : hostStats.changeRate}<span className="text-lg text-gray-500 font-bold ml-1">%</span></>}
                            </div>
                        </div>

                        <div className={scStyles.noteText()}>
                            <span className={scStyles.noteHighlight()}>Note:</span> 全てのデータは{hostName}の過去の動向を正確に表していますが、<span className={scStyles.noteDanger()}>嘘の情報</span>が紛れています。
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
