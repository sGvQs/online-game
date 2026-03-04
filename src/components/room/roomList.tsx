'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { joinRoom, deleteRoom, getRooms } from '@/server/actions/room'
import { RoomCard, RoomListEmptyState, type RoomWithUsers } from './roomCard'

export function RoomList({ initialRooms, userId }: { initialRooms: RoomWithUsers[]; userId: string }) {
    const [rooms, setRooms] = useState<RoomWithUsers[]>(initialRooms)
    const supabase = createClient()

    const fetchMessageData = async () => {
        try {
            const data = await getRooms();
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
                table: 'rooms',
                filter: 'status=neq.FINISHED',
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
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            <RoomListEmptyState />
        </div>
        )
    }

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {rooms.map((room) => (
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
