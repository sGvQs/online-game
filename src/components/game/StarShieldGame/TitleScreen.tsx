'use client'

import { motion } from 'framer-motion'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import { starShieldGame } from './styles'
import { cn } from '@/lib/utils'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'
const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'

type Difficulty = 'EASY' | 'NORMAL' | 'HARD'

interface TitleScreenProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    isReady: boolean
    allUsersReady: boolean
    difficulty: Difficulty
    onToggleReady: () => void
    onStartGame: () => void
    onExit: () => void
    onDifficultyChange: (d: Difficulty) => void
    currentUserId: string
}

const DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD']

const DIFFICULTY_LABELS: Record<Difficulty, string> = {
    EASY: '0.5/s',
    NORMAL: '1/s',
    HARD: '1.5/s',
}

export function TitleScreen({
    room,
    isHost,
    isReady,
    allUsersReady,
    difficulty,
    onToggleReady,
    onStartGame,
    onExit,
    onDifficultyChange,
    currentUserId,
}: TitleScreenProps) {
    const styles = starShieldGame()
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length

    return (
        <div className={styles.container()}>
            {/* グロー装飾（page.tsx のオーロラに合わせる） */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-20 pointer-events-none"
                style={{
                    background: 'radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                    filter: 'blur(40px)',
                }}
            />

            <div className={styles.titleGrid()}>
                {/* 左：ロゴ + メニュー */}
                <div>
                    {/* ロゴ */}
                    <motion.div
                        className={styles.logoWrapper()}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                    >
                        <div className={styles.logoSub()} style={{ fontFamily: DOT_GOTHIC_FONT }}>2 Player Co-op Shooting</div>
                        <div className={styles.logoTitle()}>STAR SHIELD</div>
                    </motion.div>

                    {/* メニュー */}
                    <motion.div
                        className={styles.menuBox()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                    >
                        {/* READY */}
                        <div
                            className={cn(
                                styles.menuItem(),
                                isReady && styles.menuItemReady()
                            )}
                            onClick={() => !isReady && onToggleReady()}
                        >
                            {isReady ? '▶ READY!' : '▶ READY'}
                        </div>

                        {/* START (ホストのみ) */}
                        {isHost && (
                            <div
                                className={cn(
                                    styles.menuItem(),
                                    allUsersReady
                                        ? styles.menuItemSelected()
                                        : styles.menuItemDisabled()
                                )}
                                onClick={() => allUsersReady && onStartGame()}
                            >
                                ▶ START
                            </div>
                        )}

                        {/* EXIT (ホストのみ) */}
                        {isHost && (
                            <div
                                className={cn(styles.menuItem(), styles.menuItemExit())}
                                onClick={onExit}
                            >
                                ▶ EXIT
                            </div>
                        )}
                    </motion.div>

                    {/* 難度選択 */}
                    <motion.div
                        className={styles.difficultyWrapper()}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.9 }}
                    >
                        <div className={styles.difficultyLabel()} style={{ fontFamily: DOT_GOTHIC_FONT }}>Difficulty</div>
                        <div className={styles.difficultyOptions()}>
                            {DIFFICULTIES.map((d) => (
                                <div
                                    key={d}
                                    className={cn(
                                        styles.difficultyOption(),
                                        difficulty === d
                                            ? styles.difficultyActive()
                                            : styles.difficultyInactive()
                                    )}
                                    onClick={() => isHost && onDifficultyChange(d)}
                                    title={DIFFICULTY_LABELS[d]}
                                >
                                    {d}
                                </div>
                            ))}
                        </div>
                        <div className="text-brand-500/40 text-xs mt-2" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                            {DIFFICULTY_LABELS[difficulty]} asteroids/sec
                            {!isHost && (
                                <span className="ml-2 text-white/20">（ホストが変更）</span>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* 区切り線 */}
                <div className={styles.divider()} />

                {/* 右：プレイヤーリスト */}
                <motion.div
                    className={styles.playerPanel()}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                >
                    <div className={styles.playerPanelTitle()}>Players</div>
                    {room.users.map((u: RoomUserWithReadyStatus) => (
                        <div key={u.id} className={styles.playerItem()}>
                            <div className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: u.isReady ? 'var(--brand-500)' : 'rgba(255,255,255,0.2)' }}
                            />
                            <div className={cn(
                                styles.playerName(),
                                u.userId === currentUserId && 'text-white'
                            )}>
                                {u.user?.name ?? '...'}
                                {u.userId === currentUserId && (
                                    <span className="text-brand-500/60 text-xs ml-1">（あなた）</span>
                                )}
                            </div>
                            <div className="ml-auto">
                                {u.isReady
                                    ? <span className={styles.playerReadyBadge()}>READY</span>
                                    : <span className={styles.playerNotReadyBadge()}>---</span>
                                }
                            </div>
                        </div>
                    ))}
                    <div className={styles.readyCount()}>
                        {readyCount}/{totalUsers} ready
                    </div>

                    {/* ゲーム説明（page.tsx の glass-card 風） */}
                    <div
                        className="mt-8 rounded-xl p-4 space-y-1"
                        style={{
                            background: 'rgba(129,140,248,0.06)',
                            border: '1px solid rgba(129,140,248,0.2)',
                        }}
                    >
                        <div className="text-brand-500/70 text-xs tracking-widest mb-2" style={{ fontFamily: DOT_GOTHIC_FONT }}>HOW TO PLAY</div>
                        <div className="text-brand-700 text-xs leading-5" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                            🛡️ Shooter: aim &amp; auto-fire<br />
                            ⌨️ Typist: type to shoot<br />
                            ☄️ Destroy all asteroids<br />
                            ⏱️ 90 seconds
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
