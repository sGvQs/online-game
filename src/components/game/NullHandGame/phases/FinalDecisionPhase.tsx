import { HandType, JankenEventWithGuests, HostStats } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'

interface FinalDecisionPhaseProps {
    jankenEvent: JankenEventWithGuests | null
    hostStats: HostStats | null
    isCurrentHost: boolean
    selectedHand: HandType | null
    isProcessing: boolean
    onSelectHand: (hand: HandType) => void
    onSubmit: () => void
    hostName: string
}

export function FinalDecisionPhase({
    jankenEvent,
    hostStats,
    isCurrentHost,
    selectedHand,
    isProcessing,
    onSelectHand,
    onSubmit,
    hostName
}: FinalDecisionPhaseProps) {
    const styles = nullHandGame()

    if (!jankenEvent) return null

    if (isCurrentHost) {
        // Host View
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <h2 className={styles.messageText()}>最終決断: 変えるか、そのままか？</h2>
                <div className={styles.handGrid()}>
                    {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                        <div
                            key={hand}
                            className={cn(
                                styles.hand3DWrapper(),
                                selectedHand === hand && styles.hand3DWrapperSelected()
                            )}
                            onClick={() => onSelectHand(hand)}
                        >
                            <Hand3D handType={hand} revealed={true} size="medium" />
                        </div>
                    ))}
                </div>
                <div className="text-center mt-8">
                    <button
                        className={cn(styles.button(), styles.buttonPrimary())}
                        disabled={!selectedHand || isProcessing}
                        onClick={onSubmit}
                    >
                        最終手を決定
                    </button>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">あなたの状況</div>

                {/* 初期手 */}
                <div className="mb-6">
                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">最初に公開した 🖐️</div>
                    <div className="flex items-center gap-2">
                        <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                    </div>
                </div>

                {/* 嘘の情報 */}
                <div className="mb-6">
                    <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">偽装工作（公開済み） 🤫</div>
                    <div className={styles.statRow()}>
                        <span className={styles.statLabel()}>偽造した情報</span>
                        <span className={styles.statValue()}>
                            {jankenEvent.fakeTarget === 'NONE' && 'なし'}
                            {jankenEvent.fakeTarget === 'INITIAL_HAND' && '手を偽装'}
                            {jankenEvent.fakeTarget === 'CHANGE_RATE' && '手を変える確率'}
                            {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'よく出す手を偽装'}
                        </span>
                    </div>
                    {jankenEvent.fakeTarget !== 'NONE' && (
                        <div className={styles.statRow()}>
                            <span className={styles.statLabel()}>偽造した値</span>
                            <span className="text-white font-bold">
                                {jankenEvent.fakeTarget === 'INITIAL_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}
                                {jankenEvent.fakeTarget === 'CHANGE_RATE' && `${jankenEvent.fakeChangeRateValue}%`}
                                {jankenEvent.fakeTarget === 'FAVORITE_HAND' && getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}
                            </span>
                        </div>
                    )}
                </div>

                {/* リアル統計 */}
                {hostStats && (
                    <div>
                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">あなたの情報</div>
                        <div className={styles.statRow()}>
                            <span className={styles.statLabel()}>本当のよく出す手</span>
                            <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                        </div>
                        <div className={styles.statRow()}>
                            <span className={styles.statLabel()}>本当の変える確率</span>
                            <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
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
    } else {
        // Guest View
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <div className={styles.messageText()}>
                    <p>{hostName}が最終決断を下しています...</p>
                    <div className="w-48 h-48 mx-auto mt-8">
                        {jankenEvent && <>
                            {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue ?
                                <Hand3D handType={jankenEvent.fakeHandValue as HandType} revealed={true} size="medium" isRotating={true} />
                                :
                                <Hand3D handType={jankenEvent.initialHand as HandType} revealed={true} size="medium" isRotating={true} />
                            }
                        </>
                        }
                    </div>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="text-[#44FFFF] font-bold text-xl mb-4 border-b-2 border-[#44FFFF] pb-2">{hostName}の情報</div>

                {/* ホストの初期手 */}
                {jankenEvent &&
                    (
                        <div className="mb-6">
                            <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">初回の手</div>

                            {jankenEvent.fakeTarget === 'INITIAL_HAND' && jankenEvent.fakeHandValue ?
                                <div className="flex items-center gap-2">
                                    <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}</span>
                                </div>
                                :
                                <div className="flex items-center gap-2">
                                    <span className={styles.statValue()}>{getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}</span>
                                </div>
                            }
                        </div>
                    )
                }

                {/* ホストの統計（公開用） */}
                {hostStats && (
                    <div>
                        <div className="text-[#FF4444] font-bold mb-2 text-sm uppercase">{hostName}の情報</div>
                        <div className={styles.statRow()}>
                            <span className={styles.statLabel()}>一番選ぶ可能性が高い手</span>

                            <span className={styles.statValue()}>
                                {getHandDisplayWithEmoji(hostStats.favoriteHand)}
                            </span>
                        </div>
                        <div className={styles.statRow()}>
                            <span className={styles.statLabel()}>変える確率</span>
                            <span className={styles.statValue()}>{hostStats.changeRate}%</span>
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
}
