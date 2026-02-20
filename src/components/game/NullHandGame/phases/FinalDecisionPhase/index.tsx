import { HandType, JankenEventWithGuests, HostStats, FakeTarget } from '@/shared/types'
import { Hand3D } from '../../Hand3D'
import { nullHandGame } from '../../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../../utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { HandSelectionGrid } from '../../HandSelectionGrid'
import { PhaseHeader } from '../../common/PhaseHeader'
import { SideHeader } from '../../common/SideHeader'
import { WaitingDisplay } from '../../common/WaitingDisplay'
import { GameButton } from '../../common/GameButton'
import { finalDecisionPhase } from './styles'
import { sideCard } from '../phaseCard.styles'

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
    const fdpStyles = finalDecisionPhase()

    if (!jankenEvent) return null

    // ------------------------------------------------------------------
    // HOST VIEW
    // ------------------------------------------------------------------
    if (isCurrentHost) {
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <div className="flex flex-col h-full animate-in fade-in zoom-in duration-300">
                    <PhaseHeader
                        engLabel="FINAL SELECTION"
                        title="最終決断"
                        subLabel="CHANGE OR KEEP YOUR HAND?"
                    />

                    <div className="flex-1 flex flex-col items-center justify-center gap-4">
                        <HandSelectionGrid
                            selectedHand={selectedHand}
                            onSelectHand={onSelectHand}
                            isProcessing={isProcessing}
                        />

                        {/* Strategy Tip - Moved to Main Area */}
                        {hostStats && (
                            <div className={fdpStyles.strategyTip()}>
                                <div className={fdpStyles.strategyTipHeader()}>
                                    <span className={fdpStyles.strategyTipTitle()}>🧠 Strategy Tip</span>
                                    <span className={fdpStyles.strategyTipMeta()}>ADVICE</span>
                                </div>
                                <p className={fdpStyles.strategyTipBody()}>
                                    ゲストは上の「FAKE DATA」を見て予想しています。<br />
                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' &&
                                        <>
                                            「変える確率」を <span className={fdpStyles.strategyTipHighlight()}>{jankenEvent.fakeChangeRateValue ?? 0}%</span> と偽装中。
                                            ゲストは<span className={fdpStyles.strategyTipUnderline()}>{(jankenEvent.fakeChangeRateValue ?? 0) > 50 ? '変えてくる' : '変えない'}</span>と予想するでしょう。
                                        </>
                                    }
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' &&
                                        <>
                                            「選択した手」を <span className={fdpStyles.strategyTipHighlight()}>{getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}</span> と偽装中。
                                            ゲストはこれに<span className={fdpStyles.strategyTipUnderline()}>勝てる手</span>を出すかもしれません。
                                        </>
                                    }
                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' &&
                                        <>
                                            「お気に入り」を <span className={fdpStyles.strategyTipHighlight()}>{getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}</span> と偽装中。
                                            ゲストはこれに<span className={fdpStyles.strategyTipUnderline()}>勝てる手</span>を出すかもしれません。
                                        </>
                                    }
                                    {jankenEvent.fakeTarget === 'NONE' &&
                                        <>
                                            今回は正直に全ての情報を公開しています。<br />あえて<span className={fdpStyles.strategyTipUnderline()}>裏の裏</span>をかくチャンスです。
                                        </>
                                    }
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 mb-4 text-center">
                        <GameButton
                            className="px-16 py-4 text-lg"
                            disabled={!selectedHand || isProcessing}
                            onClick={onSubmit}
                        >
                            DECIDE FINAL HAND
                        </GameButton>
                    </div>
                </div>
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className="h-full flex flex-col gap-2 overflow-y-auto">

                    {/* Publicly Shown Fake Info */}
                    <div className={sideCard({ variant: 'red', size: 'sm' }).card()}>
                        <SideHeader
                            engLabel="YOUR FAKE DATA"
                            label="公開中のデータ"
                            badge="PUBLIC"
                            variant="red"
                            className="border-[#FF4444]/30"
                            compact
                        />

                        <div className="space-y-1.5">
                            <div className="bg-black/30 rounded-lg px-3 py-2 border border-[#FF4444]/10 flex justify-between items-center">
                                <span className="text-gray-500 text-[10px] uppercase tracking-wider">嘘の対象</span>
                                <span className="text-white font-bold text-xs">
                                    {jankenEvent.fakeTarget === 'NONE' && 'NONE'}
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' && '選択した手'}
                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' && '変える確率'}
                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' && 'お気に入り'}
                                </span>
                            </div>

                            <div className="bg-black/30 rounded-lg px-3 py-2 border border-[#FF4444]/10 space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-[10px]">選択した手</span>
                                    <span className={cn("font-bold text-xs", jankenEvent.fakeTarget === 'INITIAL_HAND' ? "text-[#FF4444]" : "text-gray-300")}>
                                        {jankenEvent.fakeTarget === 'INITIAL_HAND'
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                            : getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-[10px]">変える確率</span>
                                    <span className={cn("font-bold text-xs", jankenEvent.fakeTarget === 'CHANGE_RATE' ? "text-[#FF4444]" : "text-gray-300")}>
                                        {jankenEvent.fakeTarget === 'CHANGE_RATE'
                                            ? `${jankenEvent.fakeChangeRateValue ?? 0}%`
                                            : `${hostStats?.realChangeRate ?? 0}%`}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 text-[10px]">お気に入り</span>
                                    <span className={cn("font-bold text-xs", jankenEvent.fakeTarget === 'FAVORITE_HAND' ? "text-[#FF4444]" : "text-gray-300")}>
                                        {jankenEvent.fakeTarget === 'FAVORITE_HAND'
                                            ? getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)
                                            : getHandDisplayWithEmoji(hostStats?.realFavoriteHand as HandType)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Real Private Info */}
                    <div className={sideCard({ variant: 'cyan', size: 'sm', className: 'flex-1' }).card()}>
                        <SideHeader
                            engLabel="YOUR REAL STATS"
                            label="本当のデータ"
                            badge="PRIVATE"
                            className="border-[#44FFFF]/30"
                            compact
                        />

                        {hostStats && (
                            <div className="space-y-2">
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>選択した手</div>
                                    <div className={sideCard({ size: 'sm' }).cardValue()}>
                                        {getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </div>
                                </div>

                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>お気に入り</div>
                                    <div className={sideCard({ size: 'sm' }).cardValue()}>
                                        {getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}
                                    </div>
                                </div>
                                <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                                    <div className={sideCard().cardTitle()}>変える確率</div>
                                    <div className={sideCard({ size: 'sm' }).cardValueWithUnit()}>
                                        {hostStats.realChangeRate}%
                                    </div>
                                </div>
                            </div>
                        )}
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
    }

    // ------------------------------------------------------------------
    // GUEST VIEW (WAITING)
    // ------------------------------------------------------------------
    const GuestView = () => {
        const MainArea = () => (
            <div className={styles.mainArea()}>
                <WaitingDisplay
                    engLabel="WAITING..."
                    text={`${hostName}の決断を待機中`}
                    subText="WAITING FOR HOST DECISION"
                    handType={jankenEvent.initialHand as HandType || HandType.ROCK}
                />
            </div>
        )

        const SideArea = () => (
            <div className={styles.sideArea()}>
                <div className={sideCard({ variant: 'cyan', size: 'lg' }).card()}>
                    <SideHeader
                        engLabel="HOST'S PUBLIC DATA"
                        label={`${hostName}のデータ`}
                        badge="PUBLIC"
                        className="border-[#44FFFF]/30"
                    />

                    <div className="space-y-4">
                        <div className="bg-black/30 rounded-lg p-4 border border-[#44FFFF]/10 text-xs text-gray-400 leading-relaxed">
                            <span className="text-[#44FFFF] font-bold">Note:</span><br />
                            ここに表示されているデータには<span className="text-[#FF4444] font-bold">１つだけ嘘</span>が含まれています。<br />
                            ホストはこのデータを元に、さらに裏をかくか、そのまま手を変えないか迷っています。
                        </div>

                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>選択した手</div>
                            <div className={sideCard({ size: 'lg' }).cardValue()}>
                                {jankenEvent.fakeTarget === 'INITIAL_HAND'
                                    ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                    : getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                            </div>
                        </div>
                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>変える確率</div>
                            <div className={sideCard({ size: 'lg' }).cardValueWithUnit()}>
                                {jankenEvent.fakeTarget === 'CHANGE_RATE'
                                    ? `${jankenEvent.fakeChangeRateValue ?? 0}`
                                    : `${hostStats?.realChangeRate ?? 0}`}<span className="text-lg text-gray-500 font-bold ml-1">%</span>
                            </div>
                        </div>
                        <div className={sideCard({ variant: 'cyan', size: 'sm' }).dataBlock()}>
                            <div className={sideCard().cardTitle()}>お気に入り</div>
                            <div className={sideCard({ size: 'lg' }).cardValue()}>
                                {jankenEvent.fakeTarget === 'FAVORITE_HAND'
                                    ? getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)
                                    : getHandDisplayWithEmoji(hostStats?.realFavoriteHand as HandType)}
                            </div>
                        </div>
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
    }

    return <GuestView />
}
