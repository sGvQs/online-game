'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, returnToRoom } from '@/server/actions/room'
import { Win95Dialog } from './Win95Dialog'
import { Win95ProgressBar } from './Win95ProgressBar'
import { RoomWithUsersAndReadyStatus } from '@/shared/types'
import { ReactNode } from 'react'

interface GamePageClientProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    roomId: string
    currentUserId: string
    /** タイトルモーダルの表示を外部から制御する */
    showTitle?: boolean
    /** ゲーム開始ボタンのコールバック */
    onStartGame?: () => void
    /** ゲーム開始ボタンの無効化フラグ */
    isStartDisabled?: boolean
    /** 準備完了ボタンのコールバック */
    onToggleReady?: () => Promise<void>
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
    currentUserId,
    showTitle,
    onStartGame,
    isStartDisabled,
    onToggleReady,
    children,
}: GamePageClientProps) {
    const router = useRouter()
    const supabase = createClient()
    const [isPending, startTransition] = useTransition()
    const [initProgress, setInitProgress] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)
    const [internalShowTitle, setInternalShowTitle] = useState(false)
    const [isTogglingReady, setIsTogglingReady] = useState(false)

    // 外部制御がある場合はそちらを使い、なければ内部stateを使う
    const isTitleVisible = showTitle !== undefined ? showTitle : internalShowTitle

    // 準備完了状態を計算
    const currentUserReady = room.users.find(u => u.userId === currentUserId)?.isReady ?? false
    const allUsersReady = room.users.every(u => u.isReady)
    const readyCount = room.users.filter(u => u.isReady).length
    const totalUsers = room.users.length

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

    const handleToggleReadyClick = async () => {
        if (!onToggleReady || isTogglingReady) return
        
        setIsTogglingReady(true)
        try {
            await onToggleReady()
        } catch (error) {
            console.error('準備完了の切り替えに失敗:', error)
        } finally {
            setIsTogglingReady(false)
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

                                {/* 準備状況表示 */}
                                <div style={{ marginTop: '24px', marginBottom: '16px' }}>
                                    <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '8px', color: '#000' }}>
                                        プレイヤー準備状況: {readyCount} / {totalUsers}
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        {room.users.map((roomUser) => (
                                            <div 
                                                key={roomUser.id}
                                                style={{ 
                                                    display: 'flex', 
                                                    alignItems: 'center',
                                                    padding: '4px 8px',
                                                    backgroundColor: roomUser.userId === currentUserId ? '#e0e0e0' : 'transparent',
                                                    borderRadius: '2px'
                                                }}
                                            >
                                                <span style={{ 
                                                    fontSize: '12px',
                                                    color: roomUser.isReady ? '#008000' : '#808080',
                                                    marginRight: '8px'
                                                }}>
                                                    {roomUser.isReady ? '✓' : '○'}
                                                </span>
                                                <span style={{ fontSize: '12px', color: '#000' }}>
                                                    {roomUser.user?.name || 'Unknown'}
                                                    {roomUser.userId === currentUserId && ' (あなた)'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 準備完了ボタン（全ユーザー） */}
                                {onToggleReady && (
                                    <div style={{ marginBottom: '16px' }}>
                                        <button
                                            className="win95-start-button"
                                            onClick={handleToggleReadyClick}
                                            disabled={isTogglingReady}
                                            style={{
                                                backgroundColor: currentUserReady ? '#008000' : undefined,
                                                color: currentUserReady ? '#fff' : undefined,
                                            }}
                                        >
                                            {currentUserReady ? '準備完了 (クリックで解除)' : '準備完了'}
                                        </button>
                                    </div>
                                )}

                                {/* スタートボタン（ホストのみ） */}
                                {isHost && (
                                    <div>
                                        <button
                                            className="win95-start-button"
                                            onClick={handleStartGameClick}
                                            disabled={isStartDisabled || isPending || !allUsersReady}
                                            title={!allUsersReady ? '全員が準備完了するまで開始できません' : ''}
                                        >
                                            ゲーム開始
                                        </button>
                                        {!allUsersReady && (
                                            <p style={{ fontSize: '11px', marginTop: '8px', color: '#808080' }}>
                                                全員が準備完了するのを待っています...
                                            </p>
                                        )}
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
