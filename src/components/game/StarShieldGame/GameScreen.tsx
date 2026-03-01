'use client'

import { useStarShield, Difficulty, GameResult, GameStats, ASTEROID_HP, STAR_HP } from '@/hooks/useStarShield'
import { ShooterView } from './ShooterView'
import { TypistView } from './TypistView'

interface GameScreenProps {
    matchId: string
    startedAt: number
    shooterId: string
    difficulty: Difficulty
    currentUserId: string
    onGameEnd: (result: GameResult, stats: GameStats) => void
}

function TimerDisplay({ timer }: { timer: number }) {
    const minutes = Math.floor(timer / 60)
    const seconds = timer % 60
    const isUrgent = timer <= 10
    return (
        <span className={isUrgent ? 'text-red-400 animate-pulse' : 'text-white'}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
    )
}

export function GameScreen({
    matchId,
    startedAt,
    shooterId,
    difficulty,
    currentUserId,
    onGameEnd,
}: GameScreenProps) {
    const isShooter = shooterId === currentUserId
    const { asteroids, bullets, timer, score, starHp, aimRef, onMouseMove, dialogue, contactExplosion, completeContactFail } = useStarShield({
        matchId,
        startedAt,
        isShooter,
        difficulty,
        currentUserId,
        onGameEnd,
    })

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* ゲーム本体 */}
            {isShooter ? (
                <ShooterView
                    asteroids={asteroids}
                    bullets={bullets}
                    aimRef={aimRef}
                    onMouseMove={onMouseMove}
                    maxHp={ASTEROID_HP[difficulty]}
                    contactExplosion={contactExplosion}
                    onContactExplosionComplete={completeContactFail}
                />
            ) : (
                <TypistView
                    dialogue={dialogue}
                    score={score}
                    starHp={starHp}
                    maxStarHp={STAR_HP[difficulty]}
                />
            )}

            {/* 共通 HUD（上部オーバーレイ） */}
            <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
                <div
                    className="flex items-center justify-between px-6 py-3 backdrop-blur-sm border-b"
                    style={{
                        background: 'rgba(30,41,59,0.4)',
                        borderColor: 'rgba(129,140,248,0.2)',
                    }}
                >
                    {/* タイマー */}
                    <div className="flex items-center gap-2">
                        <span className="text-brand-500/60 text-xs tracking-widest">TIME</span>
                        <span className="text-xl font-bold text-white">
                            <TimerDisplay timer={timer} />
                        </span>
                    </div>

                    {/* スコア */}
                    <div className="flex items-center gap-2">
                        <span className="text-brand-500 font-bold text-xl">{score.destroyed}</span>
                        <span className="text-white/30 text-sm">/</span>
                        <span className="text-white/50 text-sm">{score.spawned}</span>
                        <span className="text-white/30 text-xs ml-1 tracking-widest">DESTROYED</span>
                    </div>

                    {/* 難度 */}
                    <div className="text-xs tracking-widest text-brand-500/50">
                        {difficulty}
                    </div>
                </div>
            </div>
        </div>
    )
}
