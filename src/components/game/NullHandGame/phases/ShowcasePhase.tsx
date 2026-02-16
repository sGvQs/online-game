import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'

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
            <h2 className={styles.messageText()}>{hostName}の手を観察</h2>
            <div className={styles.handDisplay()}>
                <div className="w-64 mx-auto">
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

            {!isCurrentHost && (
                <div className="text-center mt-8">
                    {isConfirmed ? (
                        <p className={styles.messageText()}>他のゲストを待っています...</p>
                    ) : (
                        <button
                            className={cn(styles.button(), styles.buttonPrimary())}
                            disabled={isProcessing}
                            onClick={onConfirm}
                        >
                            確認して次へ
                        </button>
                    )}
                </div>
            )}

            {isCurrentHost && (
                <p className={styles.messageText()}>ゲストの確認を待っています...</p>
            )}
        </div>
    )

    const SideArea = () => (
        <div className={styles.sideArea()}>
            <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">{hostName}のデータ (公開)</div>
            {hostStats && (
                <div>
                    <div className={styles.statRow()}>
                        <span className={styles.statLabel()}>よく出す手</span>

                        {jankenEvent.fakeTarget === 'FAVORITE_HAND' && jankenEvent.fakeHandValue
                            ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                            : getHandDisplayWithEmoji(hostStats.favoriteHand as HandType)}
                    </div>
                    <div className={styles.statRow()}>
                        <span className={styles.statLabel()}>手を変える可能性</span>
                        {jankenEvent.fakeTarget === 'CHANGE_RATE' && jankenEvent.fakeChangeRateValue
                            ? jankenEvent.fakeChangeRateValue
                            : hostStats.changeRate}%
                    </div>
                    <div className="mt-4 text-xs text-gray-500">
                        * 全てのデータは{hostName}の過去の動向を正確に表していますが、嘘の情報が紛れています。（初回の手、一番選ぶ可能性が高い手、変える確率、のどれか一つは嘘の可能性が高いです）
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
