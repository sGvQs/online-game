import { HandType, JankenEventWithGuests, HostStats, FakeTarget } from '@/shared/types'
import { Hand3D } from '../Hand3D'
import { nullHandGame } from '../styles'
import { cn } from '@/lib/utils'
import { getHandDisplayWithEmoji } from '../utils'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { HandSelectionGrid } from '../HandSelectionGrid'
import { PhaseHeader } from '../common/PhaseHeader'
import { SideHeader } from '../common/SideHeader'
import { WaitingDisplay } from '../common/WaitingDisplay'
import { GameButton } from '../common/GameButton'

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
                            <div className="w-full max-w-2xl bg-[#1a1a1a]/80 border border-[#44FFFF]/20 rounded-lg p-4 backdrop-blur-sm animate-in slide-in-from-bottom-4 duration-500 delay-200 mt-2">
                                <div className="flex items-center gap-2 mb-2 border-b border-[#44FFFF]/10 pb-2">
                                    <span className="text-[#44FFFF] font-bold text-xs tracking-widest uppercase">🧠 Strategy Tip</span>
                                    <span className="text-[10px] text-gray-500 ml-auto font-mono">ADVICE</span>
                                </div>
                                <p className="text-xs text-gray-300 leading-relaxed">
                                    ゲストは上の「FAKE DATA」を見て予想しています。<br />
                                    {jankenEvent.fakeTarget === 'CHANGE_RATE' &&
                                        <>
                                            「変える確率」を <span className="text-[#44FFFF] font-bold">{jankenEvent.fakeChangeRateValue ?? 0}%</span> と偽装中。
                                            ゲストは<span className="text-white font-bold underline decoration-[#44FFFF]/50 decoration-2 underline-offset-2">{(jankenEvent.fakeChangeRateValue ?? 0) > 50 ? '変えてくる' : '変えない'}</span>と予想するでしょう。
                                        </>
                                    }
                                    {jankenEvent.fakeTarget === 'INITIAL_HAND' &&
                                        <>
                                            「選択した手」を <span className="text-[#44FFFF] font-bold">{getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)}</span> と偽装中。
                                            ゲストはこれに<span className="text-white font-bold underline decoration-[#44FFFF]/50 decoration-2 underline-offset-2">勝てる手</span>を出すかもしれません。
                                        </>
                                    }
                                    {jankenEvent.fakeTarget === 'FAVORITE_HAND' &&
                                        <>
                                            「お気に入り」を <span className="text-[#44FFFF] font-bold">{getHandDisplayWithEmoji(jankenEvent.fakeFavoriteHandValue as HandType)}</span> と偽装中。
                                            ゲストはこれに<span className="text-white font-bold underline decoration-[#44FFFF]/50 decoration-2 underline-offset-2">勝てる手</span>を出すかもしれません。
                                        </>
                                    }
                                    {jankenEvent.fakeTarget === 'NONE' &&
                                        <>
                                            今回は正直に全ての情報を公開しています。<br />あえて<span className="text-white font-bold underline decoration-[#44FFFF]/50 decoration-2 underline-offset-2">裏の裏</span>をかくチャンスです。
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
                    <div className="bg-[#1a0505] border border-[#FF4444]/30 rounded-xl p-3">
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
                    <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-xl p-3 flex-1">
                        <SideHeader
                            engLabel="YOUR REAL STATS"
                            label="本当のデータ"
                            badge="PRIVATE"
                            className="border-[#44FFFF]/30"
                            compact
                        />

                        {hostStats && (
                            <div className="space-y-2">
                                <div className="bg-black/30 rounded-lg px-3 py-2 border border-[#44FFFF]/10">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">選択した手</div>
                                    <div className="text-sm font-bold text-white">
                                        {getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                                    </div>
                                </div>

                                <div className="bg-black/30 rounded-lg px-3 py-2 border border-[#44FFFF]/10">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">お気に入り</div>
                                    <div className="text-sm font-bold text-white">
                                        {getHandDisplayWithEmoji(hostStats.realFavoriteHand as HandType)}
                                    </div>
                                </div>
                                <div className="bg-black/30 rounded-lg px-3 py-2 border border-[#44FFFF]/10">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-wider">変える確率</div>
                                    <div className="text-sm font-bold text-white">
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
                <div className="bg-[#051a1a] border border-[#44FFFF]/30 rounded-xl p-6 flex-1 flex flex-col">
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

                        <div className="bg-black/30 rounded-lg p-4 border border-[#44FFFF]/10">
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">選択した手</div>
                            <div className="text-2xl font-bold text-white">
                                {jankenEvent.fakeTarget === 'INITIAL_HAND'
                                    ? getHandDisplayWithEmoji(jankenEvent.fakeHandValue as HandType)
                                    : getHandDisplayWithEmoji(jankenEvent.initialHand as HandType)}
                            </div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 border border-[#44FFFF]/10">
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">変える確率</div>
                            <div className="text-2xl font-bold text-white font-mono">
                                {jankenEvent.fakeTarget === 'CHANGE_RATE'
                                    ? `${jankenEvent.fakeChangeRateValue ?? 0}`
                                    : `${hostStats?.realChangeRate ?? 0}`}<span className="text-lg text-gray-500 font-bold ml-1">%</span>
                            </div>
                        </div>
                        <div className="bg-black/30 rounded-lg p-4 border border-[#44FFFF]/10">
                            <div className="text-gray-500 text-[10px] uppercase tracking-wider mb-2">お気に入り</div>
                            <div className="text-2xl font-bold text-white">
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
