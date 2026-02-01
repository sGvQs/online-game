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
        <div className="min-h-screen p-8 bg-transparent text-foreground">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Section */}
                <header className="flex justify-between items-center bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-white/60 shadow-sm">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-brand-900">
                            Dashboard
                        </h1>
                        <p className="text-brand-700 font-medium mt-1 opacity-80">
                            Welcome back, {idp.user.name}
                        </p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <div className="bg-white/80 px-4 py-2 rounded-full text-sm font-medium text-brand-800 shadow-sm border border-brand-100">
                            {user.email}
                        </div>
                        {/* UserProfile could be a dropdown or avatar later */}
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar / Actions */}
                    <aside className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 rounded-2xl">
                            <h2 className="text-xl font-bold mb-4 text-brand-900">Actions</h2>
                            <CreateRoomForm />
                            <div className="mt-6 pt-6 border-t border-brand-100">
                                <p className="text-xs text-brand-500 leading-relaxed">
                                    Create a new room to start a game session with your friends.
                                </p>
                            </div>
                        </div>
                    </aside>

                    {/* Room List */}
                    <section className="lg:col-span-3">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Active Rooms</h2>
                            <span className="text-sm font-medium px-3 py-1 bg-brand-100 text-brand-700 rounded-full">
                                {rooms.length} Online
                            </span>
                        </div>
                        <RoomList initialRooms={rooms} userId={idp.user.id} />
                    </section>
                </main>
            </div>
        </div>
    )
}
