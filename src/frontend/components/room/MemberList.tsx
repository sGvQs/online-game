'use client'

import { createClient } from '@/frontend/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Card } from '@/frontend/components/ui/Card'

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

    useEffect(() => {
        const channel = supabase
            .channel(`room_${roomId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'room_users',
                filter: `room_id=eq.${roomId}`
            }, async (payload) => {
                if (payload.eventType === 'INSERT') {
                    // Need to fetch User name since room_users only has user_id
                    // For now, simpler to reload page or trigger server action to re-fetch
                    // Or, fetch single user profile from Supabase/API?
                    // Let's rely on full refresh or implement a simple fetch for now?
                    // Actually, Realtime payload only includes the columns of the table (userId, roomId).
                    // We need the User's name.
                    // Option 1: Subscribe to Users table too (but that's global)
                    // Option 2: Fetch user info on Insert.
                    const { data } = await supabase.from('users').select('*').eq('id', payload.new.user_id).single()
                    if (data) {
                        setMembers(prev => [...prev, {
                            id: payload.new.id,
                            createdAt: new Date(payload.new.created_at),
                            user: data
                        }])
                    }

                } else if (payload.eventType === 'DELETE') {
                    setMembers(prev => prev.filter(m => m.id !== payload.old.id))
                }
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [supabase, roomId])

    return (
        <div className="glass-card p-6 rounded-2xl h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-brand-900">Participants</h3>
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded-full">
                    {members.length}
                </span>
            </div>

            <ul className="space-y-3">
                {members.map(member => (
                    <li key={member.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/60 transition-colors border border-transparent hover:border-brand-100">
                        <div className="w-10 h-10 rounded-full bg-brand-200 flex items-center justify-center text-sm font-bold text-brand-800 shadow-inner ring-2 ring-white">
                            {member.user.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                                {member.user.name}
                            </p>
                            <p className="text-[10px] text-brand-500 font-medium">
                                Active Player
                            </p>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    </li>
                ))}
            </ul>
        </div>
    )
}
