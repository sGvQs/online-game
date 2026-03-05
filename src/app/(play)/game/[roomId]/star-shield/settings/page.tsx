import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/actions'
import { getRoomWithReadyStatus } from '@/server/actions/room'
import { RoomUserWithReadyStatus } from '@/types'
import { StarShieldShop } from '@/components/game/phases/starShieldGame/shopScreen'

export default async function StarShieldSettingsPage({ params }: { params: Promise<{ roomId: string }> }) {
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

    return (
        <div className="relative min-h-screen">
            <StarShieldShop
                roomId={roomId}
                currentUserId={currentUser.user.id}
            />
        </div>
    )
}
