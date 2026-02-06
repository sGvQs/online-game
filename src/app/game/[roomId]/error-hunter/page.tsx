import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getCurrentUser, getRoomWithUsers } from '@/server/actions'
import { GamePageClient } from '@/components/game/GamePageClient'
import '@/app/game/win95.css'
import { Room } from '@/types'

export default async function ErrorHunterPage({ params }: { params: { roomId: string } }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Server Action経由でDB取得
    const currentUser = await getCurrentUser()
    if (!currentUser) redirect('/')

    const { roomId } = await params

    const room = await getRoomWithUsers(roomId)
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

    // Prepare room data for client component
    const roomData: Room = {
        id: room.id,
        createdAt: room.createdAt,
        name: room.name,
        createdBy: room.createdBy,
        activeGameType: room.activeGameType,
        currentMatchId: room.currentMatchId,
        status: room.status
    }

    return (
        <div className="win95-container win95-scanlines">
            <GamePageClient room={roomData} isHost={isHost} roomId={roomId} />
        </div >
    )
}
