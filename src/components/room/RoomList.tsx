'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { joinRoom, deleteRoom, getRooms } from '@/server/actions/room'
import { RoomCard, RoomListEmptyState } from './RoomCard'
import { Room } from '@/shared/types'

export function RoomList({ initialRooms, userId }: { initialRooms: Room[], userId: string }) {
    const [rooms, setRooms] = useState<Room[]>(initialRooms)
    const supabase = createClient()

    const fetchMessageData = async () => {
        try {
            const data = await getRooms();
            console.log(data);
            if (data) {
                setRooms(data);
            }
        } catch (e) {
            console.error(e);
        }
    }

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
            }, async () => {
                fetchMessageData();
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    if (rooms.length === 0) {
        return (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                <RoomListEmptyState />
            </div>
        )
    }

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map(room => (
                <RoomCard
                    key={room.id}
                    room={room}
                    isOwner={room.createdBy === userId}
                    onJoin={joinRoom.bind(null, room.id)}
                    onDelete={deleteRoom.bind(null, room.id)}
                />
            ))}
        </div>
    )
}
