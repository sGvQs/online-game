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

            {/* Game Content */}
            <div className="win95-game-area">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Sample Error Dialogs for the game */}
                    <div className="win95-dialog">
                        <div className="win95-dialog-inner">
                            <div className="win95-titlebar">
                                <span className="win95-titlebar-text">Windows 98 Update Wizard</span>
                                <div className="win95-titlebar-buttons">
                                    <button className="win95-titlebar-btn">_</button>
                                    <button className="win95-titlebar-btn">□</button>
                                    <button className="win95-titlebar-btn">×</button>
                                </div>
                            </div>
                            <div className="win95-dialog-content">
                                <div className="win95-dialog-icon">
                                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2" />
                                        <path d="M10 10L22 22M22 10L10 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="win95-dialog-message">
                                    Windows has detected that your computer is more than 12 months old. Windows 98 requires a newer machine to run properly. Please update your configuration.
                                </div>
                            </div>
                            <div className="win95-button-group">
                                <button className="win95-button">OK</button>
                            </div>
                        </div>
                    </div>

                    <div className="win95-dialog">
                        <div className="win95-dialog-inner">
                            <div className="win95-titlebar">
                                <span className="win95-titlebar-text">CD-ROM error</span>
                                <div className="win95-titlebar-buttons">
                                    <button className="win95-titlebar-btn">_</button>
                                    <button className="win95-titlebar-btn">□</button>
                                    <button className="win95-titlebar-btn">×</button>
                                </div>
                            </div>
                            <div className="win95-dialog-content">
                                <div className="win95-dialog-icon">
                                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2" />
                                        <path d="M10 10L22 22M22 10L10 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                    </svg>
                                </div>
                                <div className="win95-dialog-message">
                                    Error reading &quot;How to uninstall Windows95.&quot; Please, insert other CD.
                                </div>
                            </div>
                            <div className="win95-button-group">
                                <button className="win95-button">OK</button>
                            </div>
                        </div>
                    </div>

                    <div className="win95-dialog">
                        <div className="win95-dialog-inner">
                            <div className="win95-titlebar">
                                <span className="win95-titlebar-text">Internal Error</span>
                                <div className="win95-titlebar-buttons">
                                    <button className="win95-titlebar-btn">_</button>
                                    <button className="win95-titlebar-btn">□</button>
                                    <button className="win95-titlebar-btn">×</button>
                                </div>
                            </div>
                            <div className="win95-dialog-content">
                                <div className="win95-dialog-icon">
                                    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M16 2L30 28H2L16 2Z" fill="#ffff00" stroke="#808000" strokeWidth="1" />
                                        <text x="16" y="24" textAnchor="middle" fill="#000" fontWeight="bold" fontSize="18">!</text>
                                    </svg>
                                </div>
                                <div className="win95-dialog-message">
                                    Your windows has been running for 10h 37m 23s. Microsoft does not allow a windows system to run longer than that. That is why your computer will now crash.
                                </div>
                            </div>
                            <div className="win95-button-group">
                                <button className="win95-button">OK</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="win95-statusbar mt-4">
                    <div className="win95-statusbar-item">Room: {room.name}</div>
                    <div className="win95-statusbar-item">Players: {room.users.length}</div>
                    <div className="win95-statusbar-item">Game: ERROR HUNTER</div>
                </div>
            </div>
        </div>
    )
}
