import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/server/actions'
import { getRoomWithReadyStatus } from '@/server/actions/room'
import { ErrorHunterGame } from '@/components/game/ErrorHunterGame'
import '@/app/game/win95.css'

export default async function ErrorHunterPage({ params }: { params: { roomId: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Server Action経由でDB取得
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { roomId } = await params

    const room = await getRoomWithReadyStatus(roomId)
    if (!room) return <div>Room not found</div>

    // Check if user is member
    const isMember = room.users.some(u => u.userId === currentUser.user.id)
    if (!isMember) {
        redirect('/dashboard')
    }

    // Redirect back to room if no game is active
    if (!room.activeGameType) {
        redirect(`/room/${roomId}`)
    }

    // Check if user is host
    const isHost = room.createdBy === currentUser.user.id

    return (
        <div className="win95-container win95-scanlines">
            <ErrorHunterGame
                room={room}
                isHost={isHost}
                roomId={roomId}
                initialMatchId={room.currentMatchId}
                currentUserId={currentUser.user.id}
            />
        </div>
    )
}
