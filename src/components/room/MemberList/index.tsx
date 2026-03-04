'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { getRoomUsers } from '@/server/actions/room'
import { Users } from 'lucide-react'
import { RoomUserWithUser } from '@/types'
import { MemberItem } from '../MemberItem'
import { memberListCard } from '../MemberItem/styles'

const styles = memberListCard()

export function MemberList({ roomId, initialMembers }: { roomId: string, initialMembers: RoomUserWithUser[] }) {
    const [members, setMembers] = useState<RoomUserWithUser[]>(initialMembers)
    const supabase = createClient()

    const handlePayload = async () => {
        try {
            const roomUsers = await getRoomUsers(roomId);
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
                filter: `room_id=eq.${roomId}`,
            }, () => {
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
                    メンバー
                </h3>
                <span className={styles.count()}>
                    {members.length}
                </span>
            </div>

            <ul className={styles.list()}>
                {members.map((member: RoomUserWithUser) => (
                    <MemberItem key={member.id} member={member} />
                ))}
            </ul>
        </div>
    )
}
