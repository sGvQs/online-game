'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, selectGame } from '@/server/actions/room'
import { Room } from '@/shared/types'
import { GameSelectionCard } from './GameSelectionCard'

interface RoomPageClientProps {
    room: Room
    isHost: boolean
    children?: React.ReactNode
}

export function RoomPageClient({ room, isHost, children }: RoomPageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [currentRoom, setCurrentRoom] = useState<Room | null>(room)

    const handlePayload = async () => {
        try {
            const newRoom = await getRoom(room.id);
            setCurrentRoom(newRoom);
            if (newRoom?.activeGameType && newRoom.activeGameType !== currentRoom?.activeGameType) {
                router.push(`/game/${room.id}/${newRoom.activeGameType}`)
            }
        } catch (error) {
            console.error("更新に失敗:", error);
        }
    };

    // Subscribe to room changes for realtime navigation
    useEffect(() => {
        const channel = supabase
            .channel(`room_game_${room.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
            }, () => {
                handlePayload();
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [room.id, router, currentRoom?.activeGameType])

    // Check on mount if we should redirect
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
        <>
            {children}

            {/* Game Selection for Host */}
            {isHost && (
                <GameSelectionCard
                    onSelectGame={handleSelectGame}
                    isPending={isPending}
                />
            )}
        </>
    )
}
