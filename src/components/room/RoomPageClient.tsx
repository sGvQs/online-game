'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useTransition, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, selectGame, getRoomUsers } from '@/server/actions/room'
import { Room, RoomUserWithUser } from '@/shared/types'
import { GameSelectionCard } from './GameSelectionCard'
import { MemberListView } from './MemberList/MemberListView'
import { GameDescriptionModal } from './GameDescriptionModal'

interface RoomPageClientProps {
    room: Room // 初期のデータの状態
    initialMembers: RoomUserWithUser[] // 初期のデータの状態
    isHost: boolean // 初期のデータの状態
    children?: ReactNode
}

/**
 * ラッパーコンポーネント: RoomPageClientのチャンネルを使いながら
 * MemberListを別の場所にレンダリング可能にする
 */
export function RoomPageClientWrapper({
    room,
    initialMembers,
    isHost,
    children
}: RoomPageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition() // 画面遷移中のローディング状態
    const [members, setMembers] = useState<RoomUserWithUser[]>(initialMembers) // 常に最新のメンバー情報を保持
    const [showGameDescription, setShowGameDescription] = useState(false) // モーダル表示フラグ
    const [selectedGameType, setSelectedGameType] = useState<string>('') // モーダルで表示するゲームの種類

    // ルーム変更ハンドラー
    const handleRoomChange = useCallback(async () => {
        try {
            const newRoom = await getRoom(room.id)
            if (newRoom?.activeGameType) {
                router.push(`/game/${room.id}/${newRoom.activeGameType}`)
            }
        } catch (error) {
            console.error('ルーム更新に失敗:', error)
        }
    }, [room.id, router])

    // メンバー変更ハンドラー
    const handleMemberChange = useCallback(async () => {
        try {
            const roomUsers = await getRoomUsers(room.id)
            setMembers(roomUsers)
        } catch (error) {
            console.error('メンバー更新に失敗:', error)
        }
    }, [room.id])

    useEffect(() => {
        const channel = supabase
            .channel(`room_unified_${room.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${room.id}`,
            }, () => {
                handleRoomChange()
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_users',
                filter: `room_id=eq.${room.id}`,
            }, () => {
                handleMemberChange()
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [room.id])

    const handleSelectGame = (gameType: string) => {
        if (isHost) {
            startTransition(async () => {
                await selectGame(room.id, gameType)
            })
        } else {
            setSelectedGameType(gameType)
            setShowGameDescription(true)
        }
    }

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Game Board Area */}
                <div className="lg:col-span-2 space-y-4">
                    {children}

                    {/* Game Selection for Host */}
                    <GameSelectionCard
                        onSelectGame={handleSelectGame}
                        isPending={isPending}
                        isHost={isHost}
                    />
                </div>

                {/* Sidebar / Members */}
                <div className="lg:col-span-1">
                    <MemberListView members={members} />
                </div>
            </div>

            <GameDescriptionModal
                isOpen={showGameDescription}
                onClose={() => setShowGameDescription(false)}
                gameType={selectedGameType}
            />
        </>
    )
}
