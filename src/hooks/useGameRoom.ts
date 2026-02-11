'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { getRoomWithReadyStatus, toggleReady } from '@/server/actions/room'
import { RoomWithUsersAndReadyStatus } from '@/shared/types'

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
    const supabase = createClient()
    const [room, setRoom] = useState<RoomWithUsersAndReadyStatus>(initialRoom)
    const [isTogglingReady, setIsTogglingReady] = useState(false)

    // ルームデータの更新ハンドラ
    const refreshRoom = useCallback(async () => {
        try {
            const updatedRoom = await getRoomWithReadyStatus(roomId)
            if (updatedRoom) {
                // ゲーム変更の検知とリダイレクト
                if (updatedRoom.activeGameType !== room.activeGameType) {
                    if (updatedRoom.activeGameType) {
                        router.push(`/game/${roomId}/${updatedRoom.activeGameType}`)
                    } else {
                        router.push(`/room/${roomId}`)
                    }
                }
                setRoom(updatedRoom)
            }
        } catch (error) {
            console.error("ルーム更新に失敗:", error)
        }
    }, [roomId, room.activeGameType, router])

    // Realtime Subscriptions
    useEffect(() => {
        const channel = supabase
            .channel(`game_room_unified_${roomId}`)
            // Room情報の変更（ゲーム開始、終了など）
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${roomId}`,
            }, () => {
                refreshRoom()
            })
            // 参加者の変更（準備完了ステータスなど）
            .on('postgres_changes', {
                event: '*', // INSERT, UPDATE, DELETE (退出も含む)
                schema: 'public',
                table: 'room_users',
                filter: `room_id=eq.${roomId}`,
            }, () => {
                refreshRoom()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [roomId, refreshRoom, supabase])

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
    // 名前マップの作成（ゲーム画面での表示用）
    const userNameMap = new Map<string, string>()
    room.users.forEach(u => {
        if (u.user) userNameMap.set(u.user.id, u.user.name)
    })

    return {
        room,
        isReady,
        isTogglingReady,
        toggleReady: handleToggleReady,
        userNameMap
    }
}
