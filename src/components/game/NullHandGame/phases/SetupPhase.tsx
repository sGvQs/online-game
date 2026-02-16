import { HandType, FakeTarget, FakeDetails, HostStats, JankenPhase } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import React from 'react'

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
    hostName: string
    onReselectHand: () => void
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
    onSubmit,
    hostName,
    onReselectHand
}: SetupPhaseProps) {
    const styles = nullHandGame()

    const [showHelp, setShowHelp] = React.useState(false)

    const handleFakeOptionClick = (value: FakeTarget) => {
        if (selectedFake === value) {
            onSelectFake('NONE')
        } else {
            onSelectFake(value)
        }
    }

    const MainArea = () => {
        if (!isCurrentHost) {
            return (
                <div className={styles.mainArea()}>
                    <div className="flex flex-col items-center justify-center h-full">
                        <div className={styles.messageText()}>{hostName}の選択を待っています...</div>
                        <div className="w-48 h-48 mt-8">
                            <Hand3D handType={titleHand} revealed={true} size="medium" isRotating={true} />
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div className={styles.mainArea()}>
                <div className="w-full h-full flex flex-col relative">
                    {/* ヘルプボタン（右下に配置） */}
                    <button
                        onClick={() => setShowHelp(true)}
                        className="absolute bottom-0 left-0 w-10 h-10 rounded-full border border-[#44FFFF] text-[#44FFFF] font-bold flex items-center justify-center hover:bg-[#44FFFF]/20 transition-colors z-20 bg-black"
                    >
                        ?
                    </button>

                    {/* ヘルプモーダル */}
                    {showHelp && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setShowHelp(false)}>
                            <div className="bg-black border-[2px] border-[#44FFFF] p-6 max-w-md w-full shadow-[0_0_30px_rgba(68,255,255,0.2)]" onClick={e => e.stopPropagation()}>
                                <h3 className="text-xl font-black text-[#44FFFF] mb-4 border-b border-[#44FFFF] pb-2 uppercase tracking-widest">
                                    HOW TO PLAY
                                </h3>
                                <div className="space-y-3 text-gray-200 text-sm leading-relaxed">
                                    <p>
                                        <span className="text-[#FF4444] font-bold">1. 本当の『手』を選択</span><br />
                                        まずはあなたが本当に出す手を選んでください。
                                    </p>
                                    <p>
                                        <span className="text-[#44FFFF] font-bold">2. 偽装工作 (必須)</span><br />
                                        ゲストに表示される「事前予告」情報を偽装してください。<br />
                                        <span className="text-xs text-gray-400">※このゲームでは嘘をつくことが重要です。</span>
                                    </p>
                                    <p>
                                        <span className="text-white border-b border-gray-500">統計情報の活用</span><br />
                                        右側に表示されている「あなたのデータ」は全員に公開されています。裏をかくか、正直にいくか... 駆け引きを楽しんでください！
                                    </p>
                                </div>
                                <div className="mt-6 flex justify-end">
                                    <button
                                        className="px-6 py-1.5 bg-[#44FFFF] text-black font-bold text-sm uppercase tracking-widest hover:bg-white transition-colors"
                                        onClick={() => setShowHelp(false)}
                                    >
                                        CLOSE
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {!selectedHand ? (
                        /* STEP 1: 手の選択 */
                        <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                            <h2 className={styles.messageText()}>あなたの手を選択</h2>
                            <div className="flex-1 flex items-center justify-center">
                                <div className={styles.handGrid()}>
                                    {(['ROCK', 'SCISSORS', 'PAPER'] as const).map((hand) => (
                                        <div
                                            key={hand}
                                            className={cn(
                                                styles.hand3DWrapper(),
                                                "h-64", // 少し大きく
                                                selectedHand === hand && styles.hand3DWrapperSelected()
                                            )}
                                            onClick={() => onSelectHand(hand)}
                                        >
                                            <Hand3D handType={hand} revealed={true} size="medium" />
                                            <div className="absolute bottom-2 w-full text-center font-bold text-xl tracking-widest text-[#44FFFF]">
                                                {getHandDisplayWithEmoji(hand)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* STEP 2: 偽装の選択 */
                        <div className="flex flex-col h-full animate-in slide-in-from-right duration-300">
                            <h2 className={styles.messageText()}>どの情報を偽装する？</h2>

                            <div className="flex-1 flex flex-col justify-center">
                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    {([
                                        { value: 'INITIAL_HAND', label: '選択した手' },
                                        { value: 'CHANGE_RATE', label: '手を変える確率' },
                                        { value: 'FAVORITE_HAND', label: '選ぶ確率の高い手' },
                                    ] as const).map((option) => (
                                        <div
                                            key={option.value}
                                            className={cn(
                                                styles.fakeOption(),
                                                "py-6 text-lg", // 少し大きく
                                                selectedFake === option.value && styles.fakeOptionSelected()
                                            )}
                                            onClick={() => handleFakeOptionClick(option.value)}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>

                                {/* 偽装詳細入力 */}
                                <div className="h-32 flex items-center justify-center">
                                    {selectedFake !== 'NONE' && (
                                        <div className='w-full max-w-md animate-in fade-in slide-in-from-top-2 duration-300'>
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
                                                <div className="w-full">
                                                    <input
                                                        type="number"
                                                        className={styles.numberInput()}
                                                        value={fakeDetails.fakeChangeRateValue ?? ''}
                                                        onChange={(e) => onUpdateFakeDetails({ ...fakeDetails, fakeChangeRateValue: parseInt(e.target.value) || 0 })}
                                                        placeholder="偽装する確率 (0-100)"
                                                    />
                                                </div>
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
                                </div>
                            </div>

                            <div className="mt-auto pt-4 flex justify-end">
                                <button
                                    className={styles.button()}
                                    disabled={!selectedHand || selectedFake === 'NONE' || isProcessing}
                                    onClick={onSubmit}
                                >
                                    選択を確定
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )
    }

    const SideArea = () => {
        return (
            <div className={styles.sideArea()}>
                {isCurrentHost && hostStats && (
                    <>
                        <div className="text-[#44FFFF] font-bold text-lg mb-4 border-b-2 border-[#44FFFF] pb-1">あなたのデータ</div>

                        {/* ホスト用リアル統計 */}
                        <div className="mb-6">
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>最終的に選ぶ確率の高い手</span>
                                <span className={styles.statValue()}>{getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}</span>
                            </div>
                            <div className={styles.statRow()}>
                                <span className={styles.statLabel()}>最終的に手を変える確率</span>
                                <span className={styles.statValue()}>{hostStats.realChangeRate}%</span>
                            </div>
                        </div>

                        {/* 選択した手の表示（ステップ2のみ） */}
                        {selectedHand && (
                            <div className="animate-in fade-in slide-in-from-left duration-500">
                                <div className="text-[#FF4444] font-bold text-lg mb-2 border-b-2 border-[#FF4444] pb-1">選択した手</div>
                                <div
                                    className="cursor-pointer hover:opacity-80 transition-opacity relative group"
                                    onClick={onReselectHand}
                                >
                                    <div className="border border-[#FF4444] bg-black p-2">
                                        <div className="h-32 w-full">
                                            <Hand3D handType={selectedHand} revealed={true} size="small" />
                                        </div>
                                        <div className="text-center font-bold text-white mt-1">{getHandDisplayWithEmoji(selectedHand)}</div>

                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-[#FF4444] font-bold border border-[#FF4444] px-2 py-1">変更する</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* ゲスト用（今は待機中表示） */}
                {!isCurrentHost && (
                    <div className="text-gray-500 italic uppercase">
                        WAITING FOR {hostName}...
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
