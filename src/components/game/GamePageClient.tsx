'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, returnToRoom } from '@/server/actions/room'
import { Win95Dialog } from './Win95Dialog'
import { Win95ProgressBar } from './Win95ProgressBar'
import { Room } from '@/shared/types'
import { ReactNode } from 'react'

interface GamePageClientProps {
    room: Room
    isHost: boolean
    roomId: string
    /** タイトルモーダルの表示を外部から制御する */
    showTitle?: boolean
    /** ゲーム開始ボタンのコールバック */
    onStartGame?: () => void
    /** ゲーム開始ボタンの無効化フラグ */
    isStartDisabled?: boolean
    children?: ReactNode
}

const ASCII_ART =
    `███████╗██████╗ ██████╗  ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
█████╗  ██████╔╝██████╔╝██║   ██║██████╔╝
██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗
███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝

██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗
███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝`

export function GamePageClient({
    room,
    isHost,
    roomId,
    showTitle,
    onStartGame,
    isStartDisabled,
    children,
}: GamePageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [initProgress, setInitProgress] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)
    const [internalShowTitle, setInternalShowTitle] = useState(false)

    // 外部制御がある場合はそちらを使い、なければ内部stateを使う
    const isTitleVisible = showTitle !== undefined ? showTitle : internalShowTitle

    // Simulate initialization progress
    useEffect(() => {
        if (isInitializing) {
            const interval = setInterval(() => {
                setInitProgress(prev => {
                    if (prev >= 200) {
                        setIsInitializing(false)
                        setInternalShowTitle(true)
                        return 200
                    }
                    return prev + 8
                })
            }, 200)
            return () => clearInterval(interval)
        }
    }, [isInitializing])


    const handlePayload = async () => {
        try {
            const newRoom = await getRoom(room.id);
            if (newRoom && newRoom.activeGameType === null) {
                router.push(`/room/${newRoom.id}`);
            }
        } catch (error) {
            console.error("更新に失敗:", error);
        }
    };
    // Subscribe to room changes for realtime navigation
    useEffect(() => {
        const channel = supabase
            .channel(`game_room_${roomId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
            }, () => {
                handlePayload();
            })
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, router])

    const handleReturnToRoom = () => {
        startTransition(async () => {
            await returnToRoom(roomId)
        })
    }

    const handleCloseModal = () => {
        setInternalShowTitle(false);
        handleReturnToRoom();
    }

    const handleStartGameClick = () => {
        if (onStartGame) {
            onStartGame()
        }
    }

    return (
        <>
            {/* Initialization Dialog */}
            {isInitializing && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <Win95Dialog title="STARTING GAME...">
                        <div className="space-y-4">
                            <p>Initializing...</p>
                            <Win95ProgressBar progress={initProgress} />
                        </div>
                    </Win95Dialog>
                </div>
            )}

            {/* Title Modal */}
            {!isInitializing && isTitleVisible && (
                <div className="win95-title-modal-overlay">
                    <div className="win95-title-modal">
                        <div className="win95-title-modal-inner">
                            <div className="win95-titlebar">
                                <span className="win95-titlebar-text">ERROR HUNTER</span>
                                {isHost && (
                                    <div className="win95-titlebar-buttons">
                                        <button
                                            className="win95-titlebar-btn"
                                            onClick={handleCloseModal}
                                        >
                                            ×
                                        </button>
                                    </div>
                                )}
                            </div>
                            <div className="win95-title-modal-content">
                                <pre className="win95-ascii-art">{ASCII_ART}</pre>

                                {isHost && (
                                    <div>
                                        <button
                                            className="win95-start-button"
                                            onClick={handleStartGameClick}
                                            disabled={isStartDisabled || isPending}
                                        >
                                            ゲーム開始
                                        </button>
                                    </div>
                                )}

                                {!isHost && (
                                    <p style={{ fontSize: '12px', marginTop: '16px' }}>
                                        ホストがゲームを開始するのを待っています...
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Game Area - Hidden when title modal or initialization is shown */}
            {!isInitializing && !isTitleVisible && children}
        </>
    )
}
