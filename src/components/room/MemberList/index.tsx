'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { getRoomUsers } from '@/server/actions/room'
import { Users } from 'lucide-react'
import { RoomUserWithUser } from '@/shared/types'
import { MemberItem } from '../MemberItem'
import { memberListCard } from '../MemberItem/styles'

const styles = memberListCard()

export function MemberList({ roomId, initialMembers }: { roomId: string, initialMembers: RoomUserWithUser[] }) {
    const [members, setMembers] = useState<RoomUserWithUser[]>(initialMembers)
    const supabase = createClient()

    const handlePayload = async () => {
        try {
            const roomUsers = await getRoomUsers(roomId);
            console.log('roomUsersはこれだ', roomUsers);
            setMembers(roomUsers);
        } catch (error) {
            console.error("更新に失敗:", error);
        }
    };

    useEffect(() => {
        const channel = supabase
            .channel(`room_${roomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_users',
            }, () => {
                console.log('room_usersが変更されました');
                handlePayload();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId])

    return (
        <div className={styles.wrapper()}>
            <div className={styles.header()}>
                <h3 className={styles.title()}>
                    <Users className="w-4 h-4" />
                    参加者
                </h3>
                <span className={styles.count()}>
                    {members.length}
                </span>
            </div>

            <ul className={styles.list()}>
                {members.map(member => (
                    <MemberItem key={member.id} member={member} />
                ))}
            </ul>
        </div>
    )
}
