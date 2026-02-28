import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/actions'
import { getRoomWithReadyStatus } from '@/server/actions/room'
import { RoomUserWithReadyStatus } from '@/shared/types'
import { StarShieldGame } from '@/components/game/StarShieldGame'

export default async function StarShieldPage({ params }: { params: { roomId: string } }) {
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

    return (
        <div className="relative min-h-screen bg-black">
            <StarShieldGame
                room={room}
                isHost={isHost}
                roomId={roomId}
                currentUserId={currentUser.user.id}
            />
        </div>
    )
}
