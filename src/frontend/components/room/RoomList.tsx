'use client'

import { createClient } from '@/frontend/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card } from '@/frontend/components/ui/Card'
import { Button } from '@/frontend/components/ui/Button'
import { joinRoom, deleteRoom } from '@/backend/actions/room'

type Room = {
    id: string
    name: string
    createdAt: Date
    createdBy: string
}

export function RoomList({ initialRooms, userId }: { initialRooms: Room[], userId: string }) {
    const [rooms, setRooms] = useState<Room[]>(initialRooms)
    const supabase = createClient()

    useEffect(() => {
        setRooms(initialRooms)
    }, [initialRooms])

    useEffect(() => {
        const channel = supabase
            .channel('rooms_list')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'rooms'
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newRoom = payload.new
                    setRooms(prev => [{
                        id: newRoom.id,
                        name: newRoom.name,
                        createdAt: new Date(newRoom.created_at),
                        createdBy: newRoom.created_by
                    }, ...prev])
                } else if (payload.eventType === 'DELETE') {
                    setRooms(prev => prev.filter(r => r.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase])

    return (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {rooms.map(room => (
                <Card key={room.id} className="flex flex-col justify-between" padding="md">
                    <div>
                        <h3 className="text-xl font-bold mb-1">{room.name}</h3>
                        <p className="text-xs text-brand-500">
                            Created: {new Date(room.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        {room.createdBy === userId && (
                            <form action={deleteRoom.bind(null, room.id)}>
                                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">Delete</Button>
                            </form>
                        )}
                        <form action={joinRoom.bind(null, room.id)}>
                            <Button size="sm" variant="solid">Join</Button>
                        </form>
                    </div>
                </Card>
            ))}

            {rooms.length === 0 && (
                <div className="col-span-full text-center py-10 text-brand-500 opacity-60">
                    No rooms available. Create one to get started!
                </div>
            )}
        </div>
    )
}
