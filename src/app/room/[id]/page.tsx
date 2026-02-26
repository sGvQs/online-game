import { redirect } from 'next/navigation'
import { getCurrentUser, getRoomWithUsers } from '@/server/actions'
import { getNullHandRankings } from '@/server/actions/game/rankingActions'
import { RoomPageClientWrapper } from '@/components/room/RoomPageClient'
import { IconButton } from '@/components/ui/IconButton'
import { leaveRoom } from '@/server/actions'
import { LogOut, Gamepad2 } from 'lucide-react'
import { RoomUserWithReadyStatus } from '@/shared/types'

export default async function RoomPage({ params }: { params: { id: string } }) {
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { id } = await params

    const room = await getRoomWithUsers(id)
    if (!room) {
        redirect('/dashboard')
    }

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

    // 参加者の月間ランキングを取得
    const userIds = room.users.map((u: RoomUserWithReadyStatus) => u.userId)
    const initialRankings = await getNullHandRankings(userIds)

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
                        <IconButton
                            type="submit"
                            variant="danger"
                            size="sm"
                            icon={<LogOut className="w-4 h-4" />}
                            tooltip="ルーム退出"
                        />
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
                    initialRankings={initialRankings}
                    isHost={isHost}
                    currentUserId={currentUser.user.id}
                />
            </div>
        </div>
    )
}
