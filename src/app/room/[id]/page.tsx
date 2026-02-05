import { createClient } from '@/backend/lib/supabase/server'
import { prisma } from '@/backend/lib/prisma'
import { redirect } from 'next/navigation'
import { MemberList } from '@/frontend/components/room/MemberList'
import { RoomPageClient } from '@/frontend/components/room/RoomPageClient'
import { Button } from '@/frontend/components/ui/Button'
import { leaveRoom } from '@/backend/actions/room'
import { ChevronsRight, PersonStanding, House, Gamepad2 } from 'lucide-react'

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

    // Check if user is host
    const isHost = room.createdBy === idp.user.id

    // Redirect to game if already in progress
    if (room.activeGameType) {
        redirect(`/game/${room.id}/${room.activeGameType}`)
    }

    // Prepare room data for client component
    const roomData = {
        id: room.id,
        name: room.name,
        createdBy: room.createdBy,
        activeGameType: room.activeGameType,
        status: room.status,
        createdAt: room.createdAt,
        current_match_id: room.current_match_id
    }

    return (
        <div className="min-h-screen p-8 bg-transparent text-foreground">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <header className="glass-card flex justify-between items-center p-6 rounded-2xl">
                    <div>
                        <div className="flex items-center gap-3">
                            <span className="bg-brand-300 text-brand-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                ゲームルーム
                            </span>
                            {isHost && (
                                <span className="bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                                    ホスト
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl font-black mt-2 text-brand-900 flex items-center gap-4">
                            <Gamepad2 className="w-12 h-12" />
                            {room.name}
                        </h1>
                    </div>
                    <form action={leaveRoom.bind(null, room.id)}>
                        <Button variant="ghost" className="text-red-500 hover:bg-red-500/10 hover:text-red-400 font-medium transition-colors gap-1">
                            <PersonStanding className="w-4 h-4" />
                            <ChevronsRight className="w-4 h-4" />
                            <House className="w-4 h-4" />
                        </Button>
                    </form>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Game Board Area */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="glass-card h-[600px] rounded-3xl flex flex-col items-center justify-center text-brand-400 relative overflow-hidden group border-2 border-white/50 bg-white/40">

                            {/* Decorative elements - using solid colors now */}
                            <div className="w-32 h-32 rounded-full bg-brand-100/50 absolute top-1/4 left-1/4 animate-pulse duration-[3000ms]" />
                            <div className="w-48 h-48 rounded-full bg-blue-100/30 absolute bottom-1/3 right-1/4 animate-pulse duration-[4000ms]" />

                            <div className="text-center z-10 space-y-4 p-8">
                                <span className="text-6xl mb-4 block" style={{ animation: 'float 6s ease-in-out infinite' }}>🎲</span>
                                <h3 className="text-2xl font-bold text-brand-900">ゲーム開始待ち...</h3>
                                <p className="text-brand-600 max-w-md mx-auto leading-relaxed">
                                    {isHost
                                        ? 'ゲームを選択してください。選択すると全員がゲーム画面に移動します。'
                                        : 'ホストがゲームを選択するのを待っています...'}
                                </p>
                            </div>
                        </div>

                        {/* Game Selection - Client Component with Realtime */}
                        <RoomPageClient room={roomData} isHost={isHost}>
                            {/* Children rendered as part of SSR content */}
                        </RoomPageClient>
                    </div>

                    {/* Sidebar / Members */}
                    <div className="lg:col-span-1">
                        <MemberList roomId={room.id} initialMembers={room.users} />
                    </div>
                </div>
            </div>
        </div>
    )
}
