import { createClient } from '@/backend/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/backend/lib/prisma'
import UserProfile from '@/frontend/components/UserProfile'
import { RoomList } from '@/frontend/components/room/RoomList'
import { CreateRoomForm } from '@/frontend/components/room/CreateRoomForm'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Fetch from DB
    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!idp) return <div>User not found in DB</div>

    // Fetch initial rooms
    const rooms = await prisma.room.findMany({
        orderBy: { createdAt: 'desc' }
    })

    return (
        <div className="min-h-screen p-8 bg-brand-100 text-brand-900">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <div className="flex gap-4 items-center">
                        <p className="text-sm">Logged in as: {user.email}</p>
                        <UserProfile initialData={idp.user} />
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Game Rooms</h2>
                        <CreateRoomForm />
                    </div>
                    <RoomList initialRooms={rooms} userId={idp.user.id} />
                </div>
            </div>
        </div>
    )
}
