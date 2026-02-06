import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser, getRoomWithUsers } from '@/server/actions'
import { RoomPageClientWrapper } from '@/components/room/RoomPageClient'
import { Button } from '@/components/ui/Button'
import { leaveRoom } from '@/server/actions'
import { ChevronsRight, PersonStanding, House, Gamepad2 } from 'lucide-react'

export default async function RoomPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Server Action経由でDB取得
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { id } = await params

    const room = await getRoomWithUsers(id)
    if (!room) return <div>Room not found</div>

    // Check if user is member
    const isMember = room.users.some(u => u.userId === currentUser.user.id)
    if (!isMember) {
        redirect('/dashboard')
    }

    // Check if user is host
    const isHost = room.createdBy === currentUser.user.id

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
        currentMatchId: room.currentMatchId
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

                {/* 
                  RoomPageClientWrapper: 
                  - 1つの統合チャンネルでrooms + room_usersを監視
                  - グリッドレイアウト（左: ゲームエリア、右: メンバーリスト）
                */}
                <RoomPageClientWrapper
                    room={roomData}
                    initialMembers={room.users}
                    isHost={isHost}
                />
            </div>
        </div>
    )
}
