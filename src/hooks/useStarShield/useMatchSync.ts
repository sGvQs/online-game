'use client'

import { useEffect, useRef } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import {
    getStarShieldMatchStatus,
    getStarShieldProgress,
} from '@/server/actions/game'
import type { Difficulty, GamePhase, GameResult, GameStats, RoleChoice } from '@/types/starShieldGame'
import type { StarShieldProgress } from '@/types/starShieldGame'

interface UseMatchSyncParams {
    /** room.currentMatchId（DB から props 経由で来る） */
    currentMatchId: string | null
    /** phase の現在値（ref で参照して deps に含めない） */
    phase: GamePhase
    playedMatchIdsRef: RefObject<Set<string>>
    addPlayedMatchId: (id: string) => void
    // setters
    setPhase: Dispatch<SetStateAction<GamePhase>>
    setMatchId: Dispatch<SetStateAction<string | null>>
    setDifficulty: Dispatch<SetStateAction<Difficulty>>
    setRoleChoices: Dispatch<SetStateAction<Record<string, RoleChoice>>>
    setStartedAt: Dispatch<SetStateAction<number | null>>
    setShooterId: Dispatch<SetStateAction<string | null>>
    setShooterProgress: Dispatch<SetStateAction<StarShieldProgress | null>>
    setTypistProgress: Dispatch<SetStateAction<StarShieldProgress | null>>
    setGameResult: Dispatch<SetStateAction<GameResult | null>>
    setGameStats: Dispatch<SetStateAction<GameStats | null>>
    setGameResultDifficulty: Dispatch<SetStateAction<Difficulty | null>>
}

export function useMatchSync({
    currentMatchId,
    phase,
    playedMatchIdsRef,
    addPlayedMatchId,
    setPhase,
    setMatchId,
    setDifficulty,
    setRoleChoices,
    setStartedAt,
    setShooterId,
    setShooterProgress,
    setTypistProgress,
    setGameResult,
    setGameStats,
    setGameResultDifficulty,
}: UseMatchSyncParams): void {
    // phase を ref で持つことで deps に含めず、effect の意図しない再起動を防ぐ
    const phaseRef = useRef(phase)
    phaseRef.current = phase

    // 「どの matchId のプログレスを取得済みか」を記録
    // これにより shooterProgress/typistProgress を deps に含めずに済む
    const progressFetchedForRef = useRef<string | null>(null)

    useEffect(() => {
        if (!currentMatchId || playedMatchIdsRef.current.has(currentMatchId)) {
            if (phaseRef.current !== 'TITLE') setPhase('TITLE')
            return
        }

        const newMatchId = currentMatchId

        // AbortController でフェーズ変化時の古いリクエストをキャンセル
        const controller = new AbortController()
        const { signal } = controller

        void (async () => {
            const status = await getStarShieldMatchStatus(newMatchId)
            if (signal.aborted) return

            if (status.status === 'not_found') {
                if (phaseRef.current !== 'TITLE') setPhase('TITLE')

            } else if (status.status === 'setup') {
                setDifficulty(status.difficulty)
                setRoleChoices((prev) => {
                    const next = { ...prev }
                    if (status.shooterId) next[status.shooterId] = 'SHOOTER'
                    if (status.typistId) next[status.typistId] = 'TYPIST'
                    return next
                })
                setMatchId(newMatchId)

                // このマッチのプログレスをまだ取得していなければ fetch
                if (progressFetchedForRef.current !== newMatchId) {
                    progressFetchedForRef.current = newMatchId
                    const [freshShooter, freshTypist] = await Promise.all([
                        getStarShieldProgress(status.shooterId),
                        getStarShieldProgress(status.typistId),
                    ])
                    if (signal.aborted) return
                    setShooterProgress(freshShooter)
                    setTypistProgress(freshTypist)
                }

                if (phaseRef.current !== 'ROLE_SELECT') setPhase('ROLE_SELECT')

            } else if (status.status === 'playing') {
                const { shooterId: sId, typistId: tId } = status

                if (progressFetchedForRef.current !== newMatchId) {
                    progressFetchedForRef.current = newMatchId
                    const [freshShooter, freshTypist] = await Promise.all([
                        getStarShieldProgress(sId),
                        getStarShieldProgress(tId),
                    ])
                    if (signal.aborted) return
                    setShooterProgress(freshShooter)
                    setTypistProgress(freshTypist)
                }

                setMatchId(newMatchId)
                setStartedAt(status.startedAt)
                setShooterId(status.shooterId)
                if (phaseRef.current !== 'PLAYING') setPhase('PLAYING')

            } else if (status.status === 'finished') {
                addPlayedMatchId(newMatchId)
                setGameResult(status.result)
                setGameStats({ ...status.stats, fireCount: 0 })
                setGameResultDifficulty(status.difficulty)
                if (phaseRef.current !== 'RESULT') setPhase('RESULT')
            }
        })()

        return () => {
            controller.abort()
        }
    // phase・shooterProgress・typistProgress を deps に含めない:
    //   - phase は phaseRef.current で参照
    //   - progress は progressFetchedForRef で重複フェッチを防止
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentMatchId, addPlayedMatchId])
}
