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
                <div key={room.id} className="glass-card rounded-xl p-5 flex flex-col justify-between group h-full relative overflow-hidden border-t-2 border-t-brand-500/50 hover:border-t-brand-400 transition-all duration-500">

                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <div className="mb-4 relative z-10">
                        <h3 className="text-xl font-bold mb-2 text-brand-900 dark:text-brand-100 transition-colors group-hover:text-glow">
                            {room.name}
                        </h3>
                        <div className="flex items-center text-xs text-brand-700 dark:text-brand-300 space-x-2">
                            <span className="bg-brand-50/50 dark:bg-brand-900/10 px-2 py-0.5 rounded-md border border-brand-100 dark:border-brand-700/30">
                                {new Date(room.createdAt).toLocaleDateString('ja-JP')}
                            </span>
                            <span className="text-brand-300 dark:text-brand-600">•</span>
                            <span className="font-mono opacity-70">ID: {room.id.substring(0, 8)}...</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-brand-100/50 dark:border-brand-700/20 relative z-10">
                        <div className="flex -space-x-2 overflow-hidden">
                            {/* Placeholder for member avatars */}
                            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-800 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[10px] font-bold text-brand-600 dark:text-brand-900 shadow-sm">?</div>
                        </div>

                        <div className="flex gap-2">
                            {room.createdBy === userId && (
                                <form action={deleteRoom.bind(null, room.id)}>
                                    <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-400 px-3 py-1 h-8 text-xs rounded-full transition-colors">
                                        Delete
                                    </Button>
                                </form>
                            )}
                            <form action={joinRoom.bind(null, room.id)}>
                                <Button size="sm" className="bg-brand-600 dark:bg-brand-600 hover:bg-brand-500 text-white shadow-lg hover:shadow-brand-500/25 transition-all duration-300 rounded-full px-4 h-8 text-xs font-semibold tracking-wide uppercase">
                                    Join Room
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            ))}

            {rooms.length === 0 && (
                <div className="col-span-full py-24 text-center border border-dashed border-brand-200 dark:border-brand-800/30 rounded-2xl bg-white/30 dark:bg-slate-900/30 backdrop-blur-sm">
                    <div className="text-6xl mb-6 opacity-80 animate-bounce">🎮</div>
                    <h3 className="text-xl font-bold text-brand-900 dark:text-white mb-2">No Active Rooms</h3>
                    <p className="text-brand-600 dark:text-brand-300 max-w-md mx-auto">
                        The galaxy is empty. Be the first to colonize this sector by creating a new game room!
                    </p>
                </div>
            )}
        </div>
    )
}
