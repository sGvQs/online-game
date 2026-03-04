import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/actions'
import { getRoomWithReadyStatus } from '@/server/actions/room'
import { getNullHandRankings } from '@/server/actions/game/rankingActions'
import { ErrorHunterGame } from '@/components/game/ErrorHunterGame'
import { cn } from '@/lib/utils'
import { errorHunterGame } from '@/components/game/ErrorHunterGame/styles'
import { RoomUserWithReadyStatus } from '@/types'

export default async function ErrorHunterPage({ params }: { params: Promise<{ roomId: string }> }) {
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { roomId } = await params

    const room = await getRoomWithReadyStatus(roomId)
    if (!room) {
        redirect('/dashboard')
    }

    // ユーザーがメンバーかチェック
    const isMember = room.users.some((u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id)
    if (!isMember) {
        redirect('/dashboard')
    }

    // ゲームが何もしていなかったらroomに戻る
    if (!room.activeGameType) {
        redirect(`/room/${roomId}`)
    }

    // ユーザーがホストかチェック
    const isHost = room.createdBy === currentUser.user.id

    // 参加者の月間ランキングを取得
    const userIds = room.users.map((u) => u.userId)
    const initialRankings = await getNullHandRankings(userIds)

    const styles = errorHunterGame()

    return (
        <div className={cn(
            styles.container(),
            "relative"
        )}>
            <ErrorHunterGame
                room={room}
                isHost={isHost}
                roomId={roomId}
                initialMatchId={room.currentMatchId}
                currentUserId={currentUser.user.id}
                initialRankings={initialRankings}
            />
        </div>
    )
}
