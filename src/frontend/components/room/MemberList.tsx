'use client'

import { createClient } from '@/frontend/lib/supabase/client'
import { useEffect, useState } from 'react'
import { getRoomUsers } from '@/backend/actions/room'

type Member = {
    id: string
    name: string
    user_id: string
    // join date
    created_at: string
}

export function MemberList({ roomId, initialMembers }: { roomId: string, initialMembers: any[] }) {
    const [members, setMembers] = useState<any[]>(initialMembers)
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
            }, () => {
                handlePayload();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, roomId])

    return (
        <div className="glass-card p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-brand-900">参加者</h3>
                <span className="bg-brand-300 text-brand-700 text-xs font-bold px-3 py-1 rounded-full">
                    {members.length}
                </span>
            </div>

            <ul className="space-y-3">
                {members.map(member => (
                    <li key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors border border-transparent hover:border-brand-500">
                        <div className="w-10 h-10 rounded-full bg-brand-300 flex items-center justify-center text-sm font-bold text-brand-700 shadow-inner">
                            {member.user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-brand-900 truncate">
                                {member.user.name}
                            </p>
                            <p className="text-[10px] text-brand-900 font-medium">
                                参加中
                            </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    </li>
                ))}
            </ul>
        </div>
    )
}
