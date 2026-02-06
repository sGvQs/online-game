'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useTransition, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, selectGame, getRoomUsers } from '@/server/actions/room'
import { Room, RoomUserWithUser } from '@/shared/types'
import { GameSelectionCard } from './GameSelectionCard'
import { MemberListView } from './MemberList/MemberListView'

interface RoomPageClientProps {
    room: Room
    initialMembers: RoomUserWithUser[]
    isHost: boolean
    children?: ReactNode
}

/**
 * ルームページのクライアントコンポーネント
 * 
 * パフォーマンス最適化:
 * - 1つのチャンネルでrooms + room_usersを監視
 * - 2つの別チャンネルではなく統合チャンネルを使用
 */

// メンバー状態を取得するためのカスタムフック用コンテキスト
import { createContext, useContext } from 'react'

interface RoomRealtimeContextType {
    members: RoomUserWithUser[]
}

const RoomRealtimeContext = createContext<RoomRealtimeContextType | null>(null)

export function useRoomMembers() {
    const context = useContext(RoomRealtimeContext)
    if (!context) {
        throw new Error('useRoomMembers must be used within RoomPageClientWrapper')
    }
    return context.members
}

/**
 * ラッパーコンポーネント: RoomPageClientのチャンネルを使いながら
 * MemberListを別の場所にレンダリング可能にする
 */
export function RoomPageClientWrapper({
    room,
    initialMembers,
    isHost,
    memberListSlot,
    children
}: RoomPageClientProps & { memberListSlot?: ReactNode }) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [currentRoom, setCurrentRoom] = useState<Room | null>(room)
    const [members, setMembers] = useState<RoomUserWithUser[]>(initialMembers)

    // ルーム変更ハンドラー
    const handleRoomChange = useCallback(async () => {
        try {
            const newRoom = await getRoom(room.id)
            setCurrentRoom(newRoom)
            if (newRoom?.activeGameType && newRoom.activeGameType !== currentRoom?.activeGameType) {
                router.push(`/game/${room.id}/${newRoom.activeGameType}`)
            }
        } catch (error) {
            console.error('ルーム更新に失敗:', error)
        }
    }, [room.id, currentRoom?.activeGameType, router])

    // メンバー変更ハンドラー
    const handleMemberChange = useCallback(async () => {
        try {
            const roomUsers = await getRoomUsers(room.id)
            setMembers(roomUsers)
        } catch (error) {
            console.error('メンバー更新に失敗:', error)
        }
    }, [room.id])

    // 統合チャンネル: 1つのチャンネルで複数テーブルを監視
    useEffect(() => {
        const channel = supabase
            .channel(`room_unified_${room.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
            }, () => {
                handleRoomChange()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_users',
            }, () => {
                handleMemberChange()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [room.id])

    useEffect(() => {
        if (currentRoom?.activeGameType) {
            router.push(`/game/${room.id}/${currentRoom.activeGameType}`)
        }
    }, [currentRoom?.activeGameType, room.id, router])

    const handleSelectGame = (gameType: string) => {
        startTransition(async () => {
            await selectGame(room.id, gameType)
        })
    }

    return (
        <RoomRealtimeContext.Provider value={{ members }}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Game Board Area */}
                <div className="lg:col-span-2 space-y-4">
                    {children}

                    {/* Game Selection for Host */}
                    {isHost && (
                        <GameSelectionCard
                            onSelectGame={handleSelectGame}
                            isPending={isPending}
                        />
                    )}
                </div>

                {/* Sidebar / Members */}
                <div className="lg:col-span-1">
                    <MemberListView members={members} />
                </div>
            </div>
        </RoomRealtimeContext.Provider>
    )
}
