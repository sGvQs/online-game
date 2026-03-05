'use client'

import { useStarShield } from '@/hooks/useStarShield'
import type { Difficulty, GameResult, GameStats, NormalAttackLevel } from '@/types/starShieldGame'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import { ASTEROID_HP, STAR_HP } from '@/constants/starShieldGame/gameConfig'
import { ShooterView } from '../playing/shooterView'
import { TypistView } from '../playing/typistView'

interface GameScreenProps {
    matchId: string
    startedAt: number
    shooterId: string
    difficulty: Difficulty
    currentUserId: string
    onGameEnd: (result: GameResult, stats: GameStats) => void
    playersTotalPoints: number
    typistNormalAttack?: TechniqueId | null
    typistSpecialAttack?: SpecialAttackChoice
    level?: NormalAttackLevel
    autoAimNearest?: boolean
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

export function GameScreen({ matchId, startedAt, shooterId, difficulty, currentUserId, onGameEnd, playersTotalPoints, typistNormalAttack, typistSpecialAttack = 'spread_medium', level = 1, autoAimNearest = false }: GameScreenProps) {
    const isShooter = shooterId === currentUserId
    const { asteroids, bullets, timer, score, starHp, aimRef, onMouseMove, dialogue, typistFireCount, contactExplosion, completeContactFail, chainHits, clearChainHits } =
        useStarShield({ matchId, startedAt, isShooter, difficulty, currentUserId, onGameEnd, playersTotalPoints, selectedNormalAttack: typistNormalAttack, selectedSpecialAttack: typistSpecialAttack, level, autoAimNearest })

    return (
        <div className="relative min-h-screen overflow-hidden">
            {isShooter ? (
                <ShooterView
                    asteroids={asteroids}
                    bullets={bullets}
                    aimRef={aimRef}
                    onMouseMove={onMouseMove}
                    maxHp={ASTEROID_HP[difficulty]}
                    contactExplosion={contactExplosion}
                    onContactExplosionComplete={completeContactFail}
                    chainHits={chainHits}
                    onChainHitsComplete={clearChainHits}
                />
            ) : (
                <TypistView
                    dialogue={dialogue}
                    score={score}
                    starHp={starHp}
                    maxStarHp={STAR_HP[difficulty]}
                    typistFireCount={typistFireCount}
                    selectedNormalAttack={typistNormalAttack}
                />
            )}

            <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
                <div className="flex items-center justify-between px-6 py-3 backdrop-blur-sm border-b bg-[rgba(30,41,59,0.4)] border-[rgba(129,140,248,0.2)]">
                    <div className="flex items-center gap-2">
                        <span className="text-brand-500/60 text-xs tracking-widest">TIME</span>
                        <span className="text-xl font-bold text-white">
                            <TimerDisplay timer={timer} />
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isShooter && (
                            <>
                                <span className="text-brand-500 font-bold text-xl">{score.destroyed}</span>
                                <span className="text-white/30 text-sm">/</span>
                                <span className="text-white/50 text-sm">{score.spawned}</span>
                                <span className="text-white/30 text-xs ml-1 tracking-widest">DESTROYED</span>
                            </>
                        )}
                    </div>
                    <div className="text-xs tracking-widest text-brand-500/50">{difficulty}</div>
                </div>
            </div>
        </div>
    )
}
