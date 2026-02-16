import { HandType, FakeTarget, FakeDetails, HostStats, JankenPhase } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'

interface SetupPhaseProps {
    isCurrentHost: boolean
    titleHand: HandType
    hostStats: HostStats | null
    selectedHand: HandType | null
    selectedFake: FakeTarget
    fakeDetails: FakeDetails
    isProcessing: boolean
    onSelectHand: (hand: HandType) => void
    onSelectFake: (fake: FakeTarget) => void
    onUpdateFakeDetails: (details: FakeDetails) => void
    onSubmit: () => void
}

export function SetupPhase({
    isCurrentHost,
    titleHand,
    hostStats,
    selectedHand,
    selectedFake,
    fakeDetails,
    isProcessing,
    onSelectHand,
    onSelectFake,
    onUpdateFakeDetails,
    onSubmit
}: SetupPhaseProps) {
    const styles = nullHandGame()

    const MainArea = () => {
        if (!isCurrentHost) {
            return (
                <div className={styles.mainArea()}>
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className={styles.messageText()}>ホストの選択を待っています...</div>
                        <div className="w-48 h-48 mt-8">
                            <Hand3D handType={titleHand} revealed={true} size="medium" isRotating={true} />
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.mainArea()}>
                <div className="w-full h-full flex flex-col">
                    <h2 className={styles.messageText()}>あなたの手を選択</h2>

                    {/* 手選択（3D） */}
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

                    <div className="border-t border-gray-700 my-2"></div>

                    {/* 偽装選択 */}
                    <h3 className="text-[#FF4444] font-bold mb-1 uppercase text-lg">偽装工作: {selectedFake === 'NONE' ? 'なし' :
                        selectedFake === 'INITIAL_HAND' ? '手' :
                            selectedFake === 'CHANGE_RATE' ? '確率' : 'よく出す手'}</h3>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                        {([
                            { value: 'NONE', label: '偽装なし' },
                            { value: 'INITIAL_HAND', label: '手を偽装' },
                            { value: 'CHANGE_RATE', label: '変える確率を偽装' },
                            { value: 'FAVORITE_HAND', label: 'よく出す手を偽装' },
                        ] as const).map((option) => (
                            <div
                                key={option.value}
                                className={cn(
                                    styles.fakeOption(),
                                    selectedFake === option.value && styles.fakeOptionSelected()
                                )}
                                onClick={() => onSelectFake(option.value)}
                            >
                                {option.label}
                            </div>
                        ))}
                    </div>

                    {/* 偽装詳細入力 */}
                    {selectedFake !== 'NONE' && (
                        <div className='mt-2'>
                            {selectedFake === 'INITIAL_HAND' && (
                                <select
                                    className={styles.select()}
                                    value={fakeDetails.fakeHandValue || ''}
                                    onChange={(e) => onUpdateFakeDetails({ ...fakeDetails, fakeHandValue: e.target.value as HandType })}
                                >
                                    <option value="">偽装する手を選択...</option>
                                    <option value="ROCK">✊ グー</option>
                                    <option value="SCISSORS">✌️ チョキ</option>
                                    <option value="PAPER">✋ パー</option>
                                </select>
                            )}
                            {selectedFake === 'CHANGE_RATE' && (
                                <input
                                    type="number"
                                    className={styles.numberInput()}
                                    value={fakeDetails.fakeChangeRateValue ?? ''}
                                    onChange={(e) => onUpdateFakeDetails({ ...fakeDetails, fakeChangeRateValue: parseInt(e.target.value) || 0 })}
                                    placeholder="偽装する確率 (0-100)"
                                />
                            )}
                            {selectedFake === 'FAVORITE_HAND' && (
                                <select
                                    className={styles.select()}
                                    value={fakeDetails.fakeFavoriteHandValue || ''}
                                    onChange={(e) => onUpdateFakeDetails({ ...fakeDetails, fakeFavoriteHandValue: e.target.value as HandType })}
                                >
                                    <option value="">偽装するよく出す手を選択...</option>
                                    <option value="ROCK">✊ グー</option>
                                    <option value="SCISSORS">✌️ チョキ</option>
                                    <option value="PAPER">✋ パー</option>
                                </select>
                            )}
                        </div>
                    )}

                    <div className="mt-auto pt-4 flex justify-end">
                        <button
                            className={styles.button()}
                            disabled={!selectedHand || isProcessing}
                            onClick={onSubmit}
                        >
                            選択を確定
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const SideArea = () => {
        return (
            <div className={styles.sideArea()}>
                <div className="text-[#44FFFF] font-bold text-lg mb-2 border-b-2 border-[#44FFFF] pb-1">あなたのデータ</div>

                {/* ホスト用リアル統計 */}
                {isCurrentHost && hostStats && (
                    <div>
                        <div className="mb-4">
                            <div className="text-[#FF4444] font-bold mb-2">あなたの情報</div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>本当のよく出す手</span>
                                <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                            </div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>本当の変える確率</span>
                                <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
                            </div>
                        </div>

                        <div>
                            <div className="text-gray-400 font-bold mb-2">公開データ (プレビュー)</div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>試合数</span>
                                <span className={styles.statValue()}>{hostStats.totalGames}</span>
                            </div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>よく出す手</span>
                                <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.favoriteHand as HandType)}</span>
                            </div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>変える確率</span>
                                <span className={styles.statValue()}>{hostStats.changeRate}%</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ゲスト用（今は待機中表示） */}
                {!isCurrentHost && (
                    <div className="text-gray-500 italic">
                        WAITING FOR HOST...
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            {MainArea()}
            {SideArea()}
        </>
    )
}
