'use client'

import { createClient } from '@/frontend/lib/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { selectGame } from '@/backend/actions/room'
import { Gamepad2 } from 'lucide-react'
import { Button } from '@/frontend/components/ui/Button'

type RoomData = {
    id: string
    name: string
    createdBy: string
    activeGameType: string | null
    status: string
}

interface RoomPageClientProps {
    room: RoomData
    isHost: boolean
    children?: React.ReactNode
}

export function RoomPageClient({ room, isHost, children }: RoomPageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [currentRoom, setCurrentRoom] = useState<RoomData>(room)

    // Subscribe to room changes for realtime navigation
    useEffect(() => {
        const channel = supabase
            .channel(`room_game_${room.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms',
            }, (payload) => {
                console.log(payload)
                const newRoom = payload.new as RoomData
                setCurrentRoom(newRoom)

                // Navigate to game page if game is selected
                if (newRoom.activeGameType && newRoom.activeGameType !== currentRoom.activeGameType) {
                    router.push(`/game/${room.id}/${newRoom.activeGameType}`)
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, room.id, router, currentRoom.activeGameType])

    // Check on mount if we should redirect
    useEffect(() => {
        if (currentRoom.activeGameType) {
            router.push(`/game/${room.id}/${currentRoom.activeGameType}`)
        }
    }, [currentRoom.activeGameType, room.id, router])

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
                <div className="glass-card p-6 rounded-2xl">
                    <h3 className="font-bold text-lg text-brand-900 flex items-center gap-2 mb-4">
                        <Gamepad2 className="w-5 h-5" />
                        ゲームを選択
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        <Button
                            onClick={() => handleSelectGame('error-hunter')}
                            disabled={isPending}
                            className="w-full justify-start gap-3 h-16 text-left bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white border-0"
                        >
                            <span className="text-2xl">🐛</span>
                            <div>
                                <div className="font-bold">ERROR HUNTER</div>
                                <div className="text-xs opacity-80">バグを見つけて潰せ！</div>
                            </div>
                        </Button>
                    </div>
                    {isPending && (
                        <div className="mt-4 text-center text-brand-600 text-sm">
                            ゲームを開始中...
                        </div>
                    )}
                </div>
            )}

            {/* Waiting message for non-hosts */}
            {!isHost && !currentRoom.activeGameType && (
                <div className="glass-card p-6 rounded-2xl text-center">
                    <div className="text-brand-600">
                        ホストがゲームを選択するのを待っています...
                    </div>
                </div>
            )}
        </>
    )
}
