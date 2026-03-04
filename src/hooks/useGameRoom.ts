'use client'

import { useEffect, useState, useCallback, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getRoomWithReadyStatus, toggleReady } from '@/server/actions/room'
import { RoomWithUsersAndReadyStatus } from '@/types'

interface UseGameRoomProps {
    roomId: string
    initialRoom: RoomWithUsersAndReadyStatus
    currentUserId: string
}

export function useGameRoom({
    roomId,
    initialRoom,
    currentUserId
}: UseGameRoomProps) {
    const router = useRouter()
    // supabase を安定した参照にする（毎レンダーで新インスタンスを作らない）
    const supabase = useMemo(() => createClient(), [])
    const [room, setRoom] = useState<RoomWithUsersAndReadyStatus>(initialRoom)
    const [isTogglingReady, setIsTogglingReady] = useState(false)

    // refreshRoom を ref 経由で channel effect に渡す
    // → refreshRoom が変わっても channel effect は再実行されない
    const refreshRoomRef = useRef<() => Promise<void>>(async () => {})

    const refreshRoom = useCallback(async () => {
        try {
            const updatedRoom = await getRoomWithReadyStatus(roomId)

            if (!updatedRoom) return

            if (updatedRoom.activeGameType === room.activeGameType) {
                setRoom(updatedRoom)
                return
            }

            // activeGameType が変化した場合のみリダイレクト
            if (updatedRoom.activeGameType) {
                router.push(`/game/${roomId}/${updatedRoom.activeGameType}`)
            } else {
                router.push(`/room/${roomId}`)
            }

            setRoom(updatedRoom)
        } catch (error) {
            console.error('ルーム更新に失敗:', error)
        }
    }, [roomId, room.activeGameType, router])

    // refreshRoom を最新値に保つ
    useEffect(() => {
        refreshRoomRef.current = refreshRoom
    }, [refreshRoom])

    // Realtime Subscriptions
    // supabase が useMemo で安定 + refreshRoomRef 経由でコールバックを渡すことで
    // レンダーごとにチャンネルが再作成されなくなる
    useEffect(() => {
        const channel = supabase
            .channel(`game_room_unified_${roomId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${roomId}`,
            }, () => {
                refreshRoomRef.current()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_users',
                filter: `room_id=eq.${roomId}`,
            }, () => {
                refreshRoomRef.current()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    // supabase は useMemo で安定、roomId のみを dep にする
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId])

    // Actions
    const handleToggleReady = useCallback(async () => {
        if (isTogglingReady) return

        setIsTogglingReady(true)
        try {
            await toggleReady(roomId)
            await refreshRoom()
        } catch (error) {
            console.error('準備完了の切り替えに失敗:', error)
        } finally {
            setIsTogglingReady(false)
        }
    }, [roomId, isTogglingReady, refreshRoom])

    // Derived State
    const currentUser = room.users.find(u => u.userId === currentUserId)
    const isReady = currentUser?.isReady ?? false
    const userNameMap = new Map<string, string>()
    room.users.forEach(u => {
        if (u.user) userNameMap.set(u.user.id, u.user.name)
    })

    return {
        room,
        isReady,
        isTogglingReady,
        toggleReady: handleToggleReady,
        userNameMap,
    }
}
