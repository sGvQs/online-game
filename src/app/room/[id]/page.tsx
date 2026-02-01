import { createClient } from '@/backend/lib/supabase/server'
import { prisma } from '@/backend/lib/prisma'
import { redirect } from 'next/navigation'
import { MemberList } from '@/frontend/components/room/MemberList'
import { Button } from '@/frontend/components/ui/Button'
import { leaveRoom } from '@/backend/actions/room'

export default async function RoomPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!idp) redirect('/')

    const { id } = await params

    const room = await prisma.room.findUnique({
        where: { id },
        include: {
            users: {
                include: { user: true }
            }
        }
    })

    if (!room) return <div>Room not found</div>

    // Check if user is member
    const isMember = room.users.some(u => u.userId === idp.user.id)
    if (!isMember) {
        redirect('/dashboard')
    }

    return (
        <div className="min-h-screen p-8 bg-brand-50 text-brand-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">{room.name}</h1>
                        <p className="text-sm text-brand-500">Room ID: {room.id}</p>
                    </div>
                    <form action={leaveRoom.bind(null, room.id)}>
                        <Button variant="outline" className="border-red-200 text-red-700 hover:bg-red-50">
                            Leave Room
                        </Button>
                    </form>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-brand-100 h-64 flex items-center justify-center text-brand-400">
                            Game Board Placeholder
                        </div>
                    </div>
                    <div>
                        <MemberList roomId={room.id} initialMembers={room.users} />
                    </div>
                </div>
            </div>
        </div>
    )
}
