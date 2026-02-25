import { RoomWithUsersAndReadyStatus, UserRanking, HandType, RoomUserWithReadyStatus } from '@/shared/types'
import { motion } from 'framer-motion'
import { PlayerFaceIcon } from './common/PlayerFaceIcon'
import { useState } from 'react'
import { nullHandGame } from './styles'
import { Hand3D } from './Hand3D'
import { cn } from '@/lib/utils'
import { NullHandLogo } from './NullHandLogo'
import { useSE } from '@/hooks/useSE'
import { RewardSystem } from './common/RewardSystem'

interface TitleScreenProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    isReady: boolean
    allUsersReady: boolean
    titleHand: HandType
    initialRankings: UserRanking[]
    onToggleReady: () => void
    onStartGame: () => void
    onExit: () => void
    onColorChange: (color: string) => void
    userColor: string
    currentUserId: string | null
}

export const NEON_PALETTE = [
    '#00FF00', // Terminal Green
    '#AA44FF', // Neon Purple
    '#FF9900', // Cyber Orange
    '#FF22CC', // Hot Magenta
    '#FFFF00', // Electric Yellow
    '#DDDDFF', // Ghost White
]

export function TitleScreen({
    room,
    isHost,
    isReady,
    allUsersReady,
    titleHand,
    initialRankings,
    onToggleReady,
    onStartGame,
    onExit,
    userColor,
    onColorChange,
    currentUserId,
}: TitleScreenProps) {
    const styles = nullHandGame()

    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const { play } = useSE();
    const [showAbout, setShowAbout] = useState(false);

    return (
        <div className={styles.container()}>
            <div className={styles.titleGrid()}>
                {/* 左上: メニュー */}
                <motion.div
                    className={styles.menuBox()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 1
                    }}
                >
                    <div
                        className={cn(
                            styles.menuItem(),
                            isReady ? "text-[#44FFFF] pointer-events-none" : "text-white opacity-80"
                        )}
                        onClick={() => {
                            play("select")
                            return !isReady && onToggleReady()
                        }}
                    >
                        READY
                    </div>

                    {isHost && (
                        <div
                            className={cn(
                                styles.menuItem(),
                                allUsersReady ? styles.menuItemSelected() : styles.menuItemDisabled()
                            )}
                            onClick={() => {
                                play("submit")
                                return allUsersReady && onStartGame()
                            }}
                        >
                            START
                        </div>
                    )}

                    <div
                        className={styles.menuItem()}
                        onClick={() => {
                            play("select")
                            setShowAbout(true)
                        }}
                    >
                        ABOUT
                    </div>

                    {isHost && (
                        <div className={styles.menuItem()} onClick={() => {
                            play("submit")
                            return onExit();
                        }}>
                            EXIT
                        </div>
                    )}
                </motion.div>

                <motion.div
                    layout
                    layoutId="main-box"
                    className={styles.visualBox()}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                    <motion.div
                        className="absolute inset-0 z-0 border-[6px] border-[#FF4444]"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{
                            duration: 1,
                            ease: "easeOut",
                            delay: 1
                        }}
                    />
                    <NullHandLogo
                        titleHand={titleHand}
                        userColor={userColor}
                        onClick={() => {
                            play("submit")
                            const currentIndex = NEON_PALETTE.indexOf(userColor)
                            const nextIndex = (currentIndex + 1) % NEON_PALETTE.length
                            onColorChange(NEON_PALETTE[nextIndex])
                        }}
                    />
                </motion.div>

                {/* 下部: インフォメーション */}
                <motion.div
                    className={styles.infoBox()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 1
                    }}
                >
                    <div className='w-full'>
                        <p className={styles.subtitle()}>NULL HAND PLAY MEMBERS</p>

                        <div className={styles.playerListWrapper()}>
                            {[...room.users].sort((a, b) => {
                                const rankA = initialRankings.find(r => r.userId === a.userId)?.rank ?? Infinity
                                const rankB = initialRankings.find(r => r.userId === b.userId)?.rank ?? Infinity
                                return rankA - rankB
                            }).map((u: RoomUserWithReadyStatus) => {
                                const ranking = initialRankings.find(r => r.userId === u.userId)
                                // ランキングが見つからない場合は未プレイ扱い
                                const rankDisplay = ranking ? `ランキング:${ranking.rank}位 ${Math.floor(ranking.points)}pt` : '世界ランキング: 最下位 0pt'

                                const isMe = u.userId === currentUserId

                                return (
                                    <div key={u.id} className={styles.playerItem()}>
                                        <div className="flex items-center gap-2">
                                            <PlayerFaceIcon
                                                faceIcon={u.user?.faceIcon}
                                                size="sm"
                                            />
                                            <span className={styles.rankingText()}>
                                                {rankDisplay}
                                            </span>
                                            <span style={{
                                                color: u.isReady
                                                    ? (isMe ? userColor : '#44FFFF')
                                                    : '#4b5563' // text-gray-600
                                            }}>
                                                {u.user?.name || '不明'}
                                            </span>
                                        </div>
                                        <span style={{
                                            color: u.isReady ? '#44FFFF' : '#374151' // シアン or text-gray-700
                                        }} className="font-black text-sm">
                                            {u.isReady ? 'READY' : 'WAITING'}
                                        </span>
                                    </div>
                                )
                            })}
                            <div className="mt-4 text-right text-gray-400">
                                {readyCount} / {totalUsers} READY
                            </div>
                        </div>
                    </div>
                </motion.div>
                {/* Music Credits */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        duration: 1,
                        ease: "easeOut",
                        delay: 1
                    }}
                    className="col-span-1 md:col-span-2 bg-black flex items-center justify-center text-center w-full text-center pointer-events-none opacity-100">
                    <p className="text-[12px] text-white font-mono tracking-[0.2em] leading-relaxed uppercase drop-shadow-md">
                        Music by <span className="text-[#FF4444] font-bold">Dream or real?</span>
                    </p>
                </motion.div>
            </div>

            {showAbout && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="relative w-full max-w-2xl max-h-[90vh] bg-black border border-[#FF4444] rounded-lg overflow-hidden flex flex-col shadow-[0_0_30px_rgba(255,68,68,0.3)]"
                    >
                        <div className="overflow-y-auto p-6 custom-scrollbar flex-1" style={{ scrollbarWidth: 'thin', scrollbarColor: '#FF4444 #000' }}>
                            <div className="space-y-6">
                                {/* タイトル部 */}
                                <div className="bg-black border border-[#FF4444] rounded p-4 text-center relative overflow-hidden group">
                                    <div className="absolute inset-0 bg-[#FF4444]/10 pointer-events-none" />
                                    <h2 className="text-2xl font-black text-[#FF4444] tracking-[0.2em] mb-2 uppercase relative z-10">
                                        NULL HAND
                                    </h2>
                                    <div className="flex justify-center my-2">
                                        <div className="w-40 h-40">
                                            <Hand3D handType={HandType.ROCK} revealed={true} size={"small"} />
                                        </div>
                                    </div>
                                    <p className="text-[#FF4444]/80 text-[10px] font-mono tracking-wider relative z-10">
                                        PSYCHOLOGICAL ROCK-PAPER-SCISSORS
                                    </p>
                                </div>

                                {/* キャッチコピー */}
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-bold text-white">
                                        👁️ 嘘を見抜け。心理を読め。
                                    </h2>
                                    <p className="text-xs italic text-gray-400">
                                        ホストの企みを見抜き、じゃんけんで完全勝利せよ！
                                    </p>
                                </div>

                                {/* ゲームの流れ */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold border-b border-[#FF4444] pb-1 text-white flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#FF4444] rounded-full" />
                                        📋 ゲームの流れ
                                    </h3>
                                    <ol className="space-y-3 text-[11px] pl-2 text-gray-400">
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2 text-[#FF4444]">1.</span>
                                            <span>
                                                <strong className="text-white">ホストの選択 (CHOICE)</strong><br />
                                                ホストは提示された「SYSTEM SELECTION」かもう一つの手のどちらで勝負するかを裏で決断します。
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2 text-[#FF4444]">2.</span>
                                            <span>
                                                <strong className="text-white">ゲストの予測 & 勝負 (BATTLE)</strong><br />
                                                ゲストは統計情報を参考に、ホストの「意志」を読み合い、自分の手を選択します。
                                            </span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="font-bold mr-2 text-[#FF4444]">3.</span>
                                            <span>
                                                <strong className="text-white">意志の開示 (RESULT)</strong><br />
                                                ホストが実際にどちらの手を選んでいたのかが暴かれ、最終的な勝敗が確定します。
                                            </span>
                                        </li>
                                    </ol>
                                </div>

                                {/* ポイント配当 (REWARD SYSTEM) */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-bold border-b border-[#FF4444] pb-1 text-white flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#FF4444] rounded-full" />
                                        ■ REWARD SYSTEM / ポイント配当
                                    </h3>
                                    <RewardSystem
                                        guestCount={room.users.length - 1}
                                        isHost={isHost}
                                        userColor={userColor}
                                        size="md"
                                        showArrow={false}
                                    />
                                </div>

                                {/* プレイのコツ */}
                                <div className="space-y-2">
                                    <h3 className="text-sm font-bold border-b border-[#FF4444] pb-1 text-white">
                                        💡 プレイのコツ
                                    </h3>
                                    <ul className="space-y-2 text-xs pl-2 text-gray-300">
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#FF4444]">•</span>
                                            <span>「SYSTEM SELECTION」の確率からホストの心理を読み取ろう</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#FF4444]">•</span>
                                            <span><span className="text-[#FF4444] font-semibold">裏の裏をかくか、データを信じるか...</span>駆け引きが重要です</span>
                                        </li>
                                        <li className="flex items-start">
                                            <span className="mr-2 text-[#FF4444]">•</span>
                                            <span className="text-[#FF4444] font-semibold">ポイント配当も重要な情報です</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* フッター（閉じるボタン） */}
                        <div className="p-4 border-t border-[#FF4444] bg-black flex justify-center">
                            <button
                                onClick={() => {
                                    play("submit")
                                    setShowAbout(false)
                                }}
                                className="w-full max-w-xs py-3 rounded font-bold text-sm transition-all duration-200 bg-[#FF4444] text-black hover:bg-[#FF8888] shadow-[0_0_15px_rgba(255,68,68,0.5)]"
                            >
                                OK
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </div>
    )
}
