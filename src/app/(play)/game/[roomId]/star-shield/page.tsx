import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/actions'
import { getRoomWithReadyStatus } from '@/server/actions/room'
import { getNullHandRankings } from '@/server/actions/game/rankingActions'
import { RoomUserWithReadyStatus } from '@/types'
import { StarShieldGame } from '@/components/game/layout/starShieldGame'

export default async function StarShieldPage({ params }: { params: Promise<{ roomId: string }> }) {
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { roomId } = await params

    const room = await getRoomWithReadyStatus(roomId)
    if (!room) {
        redirect('/dashboard')
    }

    const isMember = room.users.some((u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id)
    if (!isMember) {
        redirect('/dashboard')
    }

    if (!room.activeGameType) {
        redirect(`/room/${roomId}`)
    }

    const isHost = room.createdBy === currentUser.user.id
    const userIds = room.users.map((u) => u.userId)
    const initialRankings = await getNullHandRankings(userIds)

    return (
        <div className="relative min-h-screen">
            <StarShieldGame
                room={room}
                isHost={isHost}
                roomId={roomId}
                currentUserId={currentUser.user.id}
                initialRankings={initialRankings}
            />
        </div>
    )
}
