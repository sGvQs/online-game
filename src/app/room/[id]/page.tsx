import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser, getRoomWithUsers } from '@/server/actions'
import { RoomPageClientWrapper } from '@/components/room/RoomPageClient'
import { Button } from '@/components/ui/Button'
import { leaveRoom } from '@/server/actions'
import { ChevronsRight, PersonStanding, House, Gamepad2 } from 'lucide-react'
import { RoomUserWithReadyStatus } from '@/shared/types'

export default async function RoomPage({ params }: { params: { id: string } }) {
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { id } = await params

    const room = await getRoomWithUsers(id)
    if (!room) return <div>Room not found</div>

    // ユーザーがメンバーかチェック
    const isMember = room.users.some((u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id)
    if (!isMember) {
        redirect('/dashboard')
    }

    // ユーザーがホストかチェック
    const isHost = room.createdBy === currentUser.user.id

    // ゲームが進行中ならゲームページにリダイレクト
    if (room.activeGameType) {
        redirect(`/game/${room.id}/${room.activeGameType}`)
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
                    room={room}
                    initialMembers={room.users}
                    isHost={isHost}
                />
            </div>
        </div>
    )
}
