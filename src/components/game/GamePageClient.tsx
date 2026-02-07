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
    const [showDescription, setShowDescription] = useState(false)

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
                            
                            {/* 2カラムレイアウト */}
                            <div className="win95-title-modal-two-column">
                                {/* 左パネル */}
                                <div className="win95-title-modal-left-panel">
                                    <div className="win95-info-box">
                                        {!showDescription ? (
                                            // 通常モード: ASCIIアート + プレイヤーリスト
                                            <>
                                                <pre className="win95-ascii-art">{ASCII_ART}</pre>
                                                
                                                <div className="win95-player-status-section">
                                                    <p className="win95-status-title">
                                                        プレイヤー準備状況: {readyCount} / {totalUsers}
                                                    </p>
                                                    <div className="win95-player-listbox">
                                                        {room.users.map((roomUser) => (
                                                            <div
                                                                key={roomUser.id}
                                                                className={`win95-player-item ${roomUser.userId === currentUserId ? 'selected' : ''}`}
                                                            >
                                                                <div className={`win95-player-radio ${roomUser.isReady ? 'ready' : ''}`} />
                                                                <span>
                                                                    {roomUser.user?.name || 'Unknown'}
                                                                    {roomUser.userId === currentUserId && ' (あなた)'}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            // 説明モード
                                            <div className="win95-description-content">
                                                <div className="win95-info-header">
                                                    <span className="win95-info-icon">💡</span>
                                                    <span>Did you know...</span>
                                                </div>
                                                <div className="win95-description-text">
                                                    ERROR HUNTERは、画面に出現する20個のエラーモーダルを<br />
                                                    素早く閉じる反射神経ゲームです。<br />
                                                    <br />
                                                    <strong>ルール:</strong><br />
                                                    ・全20個のエラーが一斉に画面上に出現します<br />
                                                    ・各プレイヤーは素早くエラーの×ボタンをクリック<br />
                                                    ・最も多くのエラーを閉じたプレイヤーが勝利<br />
                                                    ・全員で協力して全てのエラーを閉じましょう！<br />
                                                    <br />
                                                    準備ができたら「準備完了」ボタンを押してください。
                                                </div>
                                                <div className="win95-description-image">
                                                    <div style={{ color: '#808080', fontSize: '11px' }}>
                                                        [ゲーム画面イメージ]
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* 右パネル */}
                                <div className="win95-title-modal-right-panel">
                                    <button
                                        className={`win95-button win95-panel-button ${showDescription ? 'win95-button-pressed' : ''}`}
                                        onClick={() => setShowDescription(!showDescription)}
                                    >
                                        What's ERROR HUNTER
                                    </button>
                                    
                                    <div style={{ flex: 1 }} />
                                    
                                    {onToggleReady && (
                                        <button
                                            className="win95-button win95-panel-button"
                                            onClick={handleToggleReadyClick}
                                            disabled={isTogglingReady}
                                            style={{
                                                backgroundColor: currentUserReady ? '#008000' : undefined,
                                                color: currentUserReady ? '#fff' : undefined,
                                            }}
                                        >
                                            準備完了
                                        </button>
                                    )}
                                    
                                    {isHost && (
                                        <button
                                            className="win95-button win95-panel-button"
                                            onClick={handleStartGameClick}
                                            disabled={isStartDisabled || isPending || !allUsersReady}
                                        >
                                            ゲーム開始
                                        </button>
                                    )}
                                    
                                    <div style={{ height: '16px' }} />
                                    
                                    {isHost && (
                                        <button
                                            className="win95-button win95-panel-button"
                                            onClick={handleCloseModal}
                                        >
                                            Close
                                        </button>
                                    )}
                                </div>
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
