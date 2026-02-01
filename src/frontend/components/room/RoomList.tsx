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
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map(room => (
                <div key={room.id} className="glass-card rounded-xl p-5 flex flex-col justify-between group h-full relative overflow-hidden border-t-4 border-t-brand-500">

                    <div className="mb-4">
                        <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-brand-700 transition-colors">
                            {room.name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 space-x-2">
                            <span className="bg-brand-50 text-brand-600 px-2 py-0.5 rounded-md border border-brand-100">
                                {new Date(room.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                            <span>•</span>
                            <span>ID: {room.id.substring(0, 8)}...</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100/50">
                        <div className="flex -space-x-2 overflow-hidden">
                            {/* Placeholder for member avatars if we had them easily available */}
                            <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[8px]">?</div>
                        </div>

                        <div className="flex gap-2">
                            {room.createdBy === userId && (
                                <form action={deleteRoom.bind(null, room.id)}>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 hover:text-red-600 px-2 py-1 h-auto text-xs">
                                        Delete
                                    </Button>
                                </form>
                            )}
                            <form action={joinRoom.bind(null, room.id)}>
                                <Button size="sm" className="bg-brand-100 text-brand-700 hover:bg-brand-600 hover:text-white transition-all shadow-none hover:shadow-md h-8 text-sm font-medium">
                                    Join Room →
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            ))}

            {rooms.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-brand-200 rounded-2xl bg-white/30">
                    <div className="text-4xl mb-4 opacity-50">🎮</div>
                    <h3 className="text-lg font-semibold text-brand-900">No Active Rooms</h3>
                    <p className="text-sm text-brand-500 mt-1 max-w-md mx-auto">
                        There are no active game rooms at the moment. Be the first to create one!
                    </p>
                </div>
            )}
        </div>
    )
}
