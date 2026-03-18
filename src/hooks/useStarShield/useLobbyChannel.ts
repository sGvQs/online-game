'use client'

import { useEffect, useRef } from 'react'
import type { Dispatch, RefObject, SetStateAction } from 'react'
import { createClient } from '@/utils/supabase/client'
import { getStarShieldMatchStatus, getStarShieldProgress } from '@/server/actions/game'
import type { Difficulty, GamePhase, RoleChoice, StarShieldProgress } from '@/types/starShieldGame'

type SupabaseClient = ReturnType<typeof createClient>
type Channel = ReturnType<SupabaseClient['channel']>

interface UseLobbyChannelParams {
    roomId: string
    /** TITLE / ROLE_SELECT の間だけ購読。それ以外は接続しない */
    phase: GamePhase
    /** startGame ハンドラ内で参照するため ref で保持（deps への追加を防ぐ） */
    matchIdRef: RefObject<string | null>
    supabase: SupabaseClient
    setDifficulty: Dispatch<SetStateAction<Difficulty>>
    setRoleChoices: Dispatch<SetStateAction<Record<string, RoleChoice>>>
    setStartedAt: Dispatch<SetStateAction<number | null>>
    setShooterId: Dispatch<SetStateAction<string | null>>
    setPhase: Dispatch<SetStateAction<GamePhase>>
    setShooterProgress: Dispatch<SetStateAction<StarShieldProgress | null>>
    setTypistProgress: Dispatch<SetStateAction<StarShieldProgress | null>>
    /** Shooter がロードアウトを更新したときに呼ばれるコールバック */
    onLoadoutUpdated?: () => void
}

const VALID_DIFFICULTIES: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'HELL', 'ABYSS']
const VALID_ROLES: RoleChoice[] = ['SHOOTER', 'TYPIST']

export function useLobbyChannel({
    roomId,
    phase,
    matchIdRef,
    supabase,
    setDifficulty,
    setRoleChoices,
    setStartedAt,
    setShooterId,
    setPhase,
    setShooterProgress,
    setTypistProgress,
    onLoadoutUpdated,
}: UseLobbyChannelParams): RefObject<Channel | null> {
    const lobbyChannelRef = useRef<Channel | null>(null)
    const onLoadoutUpdatedRef = useRef(onLoadoutUpdated)
    onLoadoutUpdatedRef.current = onLoadoutUpdated

    useEffect(() => {
        if (phase !== 'TITLE' && phase !== 'ROLE_SELECT') return

        const channel = supabase.channel(`star_shield_lobby_${roomId}`)
        lobbyChannelRef.current = channel

        channel
            .on('broadcast', { event: 'difficulty' }, ({ payload }: { payload: { difficulty: Difficulty } }) => {
                if (payload?.difficulty && VALID_DIFFICULTIES.includes(payload.difficulty)) {
                    setDifficulty(payload.difficulty)
                }
            })
            .on('broadcast', { event: 'role' }, ({ payload }: { payload: { userId: string; role: RoleChoice } }) => {
                if (payload?.userId && payload?.role && VALID_ROLES.includes(payload.role)) {
                    setRoleChoices((prev) => ({ ...prev, [payload.userId]: payload.role }))
                }
            })
            .on('broadcast', { event: 'startGame' }, () => {
                // matchIdRef.current を参照して deps に matchId を含めずに済む
                const currentMatchId = matchIdRef.current
                if (!currentMatchId) return
                getStarShieldMatchStatus(currentMatchId).then(async (status) => {
                    if (status.status !== 'playing') return
                    const [freshShooter, freshTypist] = await Promise.all([
                        getStarShieldProgress(status.shooterId),
                        getStarShieldProgress(status.typistId),
                    ])
                    setShooterProgress(freshShooter)
                    setTypistProgress(freshTypist)
                    setStartedAt(status.startedAt)
                    setShooterId(status.shooterId)
                    setPhase('PLAYING')
                })
            })
            .on('broadcast', { event: 'loadout_updated' }, () => {
                onLoadoutUpdatedRef.current?.()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
            lobbyChannelRef.current = null
        }
    // matchId は matchIdRef.current で参照するため deps に含めない
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, roomId, supabase])

    return lobbyChannelRef
}
