import { RoomWithUsersAndReadyStatus, UserRanking, HandType, RoomUserWithReadyStatus } from '@/shared/types'
import { motion } from 'framer-motion'
import { nullHandGame } from './styles'
import { Hand3D } from './Hand3D'
import { cn } from '@/lib/utils'
import { NullHandLogo } from './NullHandLogo'
import { useSE } from '@/hooks/useSE'

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
}

export function TitleScreen({
    room,
    isHost,
    isReady,
    allUsersReady,
    titleHand,
    initialRankings,
    onToggleReady,
    onStartGame,
    onExit
}: TitleScreenProps) {
    const styles = nullHandGame()

    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const { play } = useSE();

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
                            isReady && styles.menuItemReady()
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
                    <NullHandLogo titleHand={titleHand} />
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
                                const rankDisplay = ranking ? `世界順位:${ranking.rank}位 ${Math.floor(ranking.points)}pt` : '世界ランキング: 最下位 0pt'

                                return (
                                    <div key={u.id} className={styles.playerItem()}>
                                        <div className="flex items-center">
                                            <span className={styles.rankingText()}>
                                                {rankDisplay}
                                            </span>
                                            <span className={u.isReady ? 'text-[#44FFFF]' : 'text-gray-500'}>
                                                {u.user?.name || '不明'}
                                            </span>
                                        </div>
                                        <span className={u.isReady ? 'text-[#FF4444]' : 'text-gray-700'}>
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
        </div>
    )
}
