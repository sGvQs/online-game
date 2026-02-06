'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, returnToRoom } from '@/server/actions/room'
import { Win95Dialog } from './Win95Dialog'
import { Win95ProgressBar } from './Win95ProgressBar'
import { HostControls } from './HostControls'
import { Room } from '@/shared/types'

interface GamePageClientProps {
    room: Room
    isHost: boolean
    roomId: string
}

export function GamePageClient({ room, isHost, roomId }: GamePageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [currentRoom, setCurrentRoom] = useState<Room | null>(room)
    const [initProgress, setInitProgress] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)

    // Simulate initialization progress
    useEffect(() => {
        if (isInitializing) {
            const interval = setInterval(() => {
                setInitProgress(prev => {
                    if (prev >= 100) {
                        setIsInitializing(false)
                        return 100
                    }
                    return prev + 8
                })
            }, 200)
            return () => clearInterval(interval)
        }
    }, [isInitializing])


    const handlePayload = async () => {
        try {
            const newRoom = await getRoom(room.id);
            setCurrentRoom(newRoom);
            if (newRoom && newRoom.activeGameType === null) {
                router.push(`/room/${newRoom.id}`);
            }
        } catch (error) {
            console.error("更新に失敗:", error);
        }
    };
    // Subscribe to room changes for realtime navigation
    useEffect(() => {
        const channel = supabase
            .channel(`game_room_${roomId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
            }, () => {
                handlePayload();
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, roomId, router])

    const handleReturnToRoom = () => {
        startTransition(async () => {
            await returnToRoom(roomId)
        })
    }

    return (
        <>
            {/* Initialization Dialog */}
            {isInitializing && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <Win95Dialog title="</body>">
                        <div className="space-y-4">
                            <p>Initializing...</p>
                            <Win95ProgressBar progress={initProgress} />
                        </div>
                    </Win95Dialog>
                </div>
            )}

            {/* Host Controls */}
            {isHost && !isInitializing && (
                <HostControls
                    onReturnToRoom={handleReturnToRoom}
                    isPending={isPending}
                />
            )}

            {/* Waiting message for non-hosts */}
            {!isHost && !isInitializing && (
                <div className="mb-4">
                    <Win95Dialog title="Waiting..." icon="info">
                        <p>ホストがゲームを開始するのを待っています...</p>
                    </Win95Dialog>
                </div>
            )}
        </>
    )
}
