'use client'

import { useStarShield } from '@/hooks/useStarShield'
import type { Difficulty, GameResult, GameStats, NormalAttackLevel } from '@/types/starShieldGame'
import type { TechniqueId } from '@/constants/starShieldGame/techniques'
import type { SpecialAttackChoice } from '@/utils/starShieldGame'
import type { SpecialAttackLevel } from '@/constants/starShieldGame/gameConfig'
import { ASTEROID_HP, LEVEL_STAR_HP } from '@/constants/starShieldGame/gameConfig'
import { LEVEL_HEAL_RECOVERY } from '@/constants/starShieldGame/skillConfig'
import { ShooterView } from '../playing/shooterView'
import { Typography } from '@/components/ui/typography'
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
    typistSpecialAttackLevel?: SpecialAttackLevel
    typistHealLevel?: number | null
    starHpLevel?: number
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

export function GameScreen({ matchId, startedAt, shooterId, difficulty, currentUserId, onGameEnd, playersTotalPoints, typistNormalAttack, typistSpecialAttack = 'spread', typistSpecialAttackLevel = 1, typistHealLevel = null, starHpLevel, level = 1, autoAimNearest = false }: GameScreenProps) {
    const isShooter = shooterId === currentUserId
    const { asteroids, bullets, timer, score, starHp, aimRef, onMouseMove, dialogue, typistFireCount, contactExplosion, completeContactFail, chainHits, clearChainHits } =
        useStarShield({ matchId, startedAt, isShooter, difficulty, currentUserId, onGameEnd, playersTotalPoints, selectedNormalAttack: typistNormalAttack, selectedSpecialAttack: typistSpecialAttack, selectedSpecialAttackLevel: typistSpecialAttackLevel, selectedHealLevel: typistHealLevel, starHpLevel, level, autoAimNearest })
    const effectiveStarHpLevel = (starHpLevel != null && starHpLevel >= 1 && starHpLevel <= 5)
        ? (starHpLevel as 1 | 2 | 3 | 4 | 5)
        : 1
    const maxStarHp = LEVEL_STAR_HP[effectiveStarHpLevel]

    const healRecoveryText =
        typistHealLevel != null && typistHealLevel >= 1
            ? typistHealLevel >= 5
                ? '全回復'
                : `+${LEVEL_HEAL_RECOVERY[typistHealLevel as 1 | 2 | 3 | 4]}`
            : null

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
                    maxStarHp={maxStarHp}
                    typistFireCount={typistFireCount}
                    selectedNormalAttack={typistNormalAttack}
                    healLevel={typistHealLevel ?? undefined}
                    healRecoveryText={healRecoveryText}
                />
            )}

            <div className="absolute top-0 left-0 right-0 z-30 pointer-events-none">
                <div className="flex items-center justify-between px-6 py-3 backdrop-blur-sm border-b bg-[rgba(30,41,59,0.4)] border-[rgba(129,140,248,0.2)]">
                    <div className="flex items-center gap-2">
                        <Typography variant="caption" as="span" className="text-brand-500/60 tracking-widest">TIME</Typography>
                        <Typography variant="h3" as="span" className="text-white">
                            <TimerDisplay timer={timer} />
                        </Typography>
                    </div>
                    <div className="flex items-center gap-2">
                        {isShooter && (
                            <>
                                <Typography variant="h3" as="span" className="text-brand-500">{score.destroyed}</Typography>
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
