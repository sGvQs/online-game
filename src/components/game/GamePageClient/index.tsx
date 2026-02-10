'use client'

import { createClient } from '@/utils/supabase/client'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { getRoom, returnToRoom } from '@/server/actions/room'
import { Win95Dialog } from '../Win95Dialog'
import { Win95ProgressBar } from '../Win95ProgressBar'
import { Win95Button } from '../Win95Button'
import { Win95TitleBarButton } from '../Win95TitleBarButton'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus } from '@/shared/types'
import { ReactNode } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { gamePageClient } from './styles'
import { useSE } from '@/hooks/useSE'

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
    const styles = gamePageClient()

    // 外部制御がある場合はそちらを使い、なければ内部stateを使う
    const isTitleVisible = showTitle !== undefined ? showTitle : internalShowTitle

    // 準備完了状態を計算
    const currentUserReady = room.users.find((u: RoomUserWithReadyStatus) => u.userId === currentUserId)?.isReady ?? false
    const allUsersReady = room.users.every((u: RoomUserWithReadyStatus) => u.isReady)
    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length

    // Simulate initialization progress
    useEffect(() => {
        if (isInitializing) {
            const interval = setInterval(() => {
                setInitProgress(prev => {
                    if (prev >= 200) {
                        setIsInitializing(false)
                        setInternalShowTitle(true)
                        useSE().play('chime')
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
                filter: `id=eq.${roomId}`,
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
                <div className={styles.modalOverlay()}>
                    <div className={styles.modal()}>
                        <div className={styles.modalInner()}>
                            <div className={styles.titlebar()}>
                                <span className={styles.titlebarText()}>ERROR HUNTER</span>
                                {isHost && (
                                    <div className={styles.titlebarButtons()}>
                                        <Win95TitleBarButton
                                            onClick={handleCloseModal}
                                        >
                                            ×
                                        </Win95TitleBarButton>
                                    </div>
                                )}
                            </div>

                            {/* 2カラムレイアウト */}
                            <div className={styles.twoColumn()}>
                                {/* 左パネル */}
                                <div className={styles.leftPanel()}>
                                    <div className={styles.infoBox()}>
                                        {!showDescription ? (
                                            // 通常モード: ASCIIアート + プレイヤーリスト
                                            <>
                                                <pre className={styles.asciiArt()}>{ASCII_ART}</pre>

                                                <div className={styles.playerStatusSection()}>
                                                    <p className={styles.statusTitle()}>
                                                        プレイヤー準備状況: {readyCount} / {totalUsers}
                                                    </p>
                                                    <div className={styles.playerListbox()}>
                                                        {room.users.map((roomUser: RoomUserWithReadyStatus) => (
                                                            <div
                                                                key={roomUser.id}
                                                                className={styles.playerItem()}
                                                            >
                                                                <div className={roomUser.isReady ? styles.playerRadioReady() : styles.playerRadio()} />
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
                                            <div className={styles.descriptionContent()}>
                                                <div className={styles.infoHeader()}>
                                                    <span className={styles.infoIcon()}>💡</span>
                                                    <span>ゲーム説明</span>
                                                </div>
                                                <div className={styles.descriptionImage()}>
                                                    <Image
                                                        src="/images/what-is-error-hunter.png"
                                                        alt="ERROR HUNTER"
                                                        fill
                                                        className="object-contain"
                                                        priority
                                                    />
                                                </div>
                                                <div className={styles.descriptionText()}>
                                                    ERROR HUNTERは、画面に出現する47個のエラーモーダルを素早く閉じる反射神経ゲームです。<br />
                                                    <br />
                                                    <strong>ルール:</strong><br />
                                                    ・全47個のエラーが一斉に画面上に出現します<br />
                                                    ・各プレイヤーは素早くエラーの×ボタンをクリック<br />
                                                    ・最も多くのエラーを閉じたプレイヤーが勝利<br />
                                                    ・全員で協力して全てのエラーを閉じましょう！<br />
                                                    ・何回か押さないと閉じないものもあるよ<br />
                                                    ・↑はprismaの限界だから許してね<br />
                                                    <br />
                                                    準備ができたら「準備完了」ボタンを押してください。
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* 右パネル */}
                                <div className={styles.rightPanel()}>
                                    <Win95Button
                                        className={cn(styles.panelButton(), showDescription && styles.buttonPressed())}
                                        onClick={() => setShowDescription(!showDescription)}
                                        pressed={showDescription}
                                    >
                                        What's ERROR HUNTER
                                    </Win95Button>

                                    <div className={styles.buttonSpacer()} />

                                    {onToggleReady && (
                                        <Win95Button
                                            className={styles.panelButton()}
                                            onClick={handleToggleReadyClick}
                                            disabled={isTogglingReady}
                                            style={{
                                                backgroundColor: currentUserReady ? '#008000' : undefined,
                                                color: currentUserReady ? '#fff' : undefined,
                                            }}
                                        >
                                            準備完了
                                        </Win95Button>
                                    )}

                                    {isHost && (
                                        <Win95Button
                                            className={styles.panelButton()}
                                            onClick={handleStartGameClick}
                                            disabled={isStartDisabled || isPending || !allUsersReady}
                                        >
                                            ゲーム開始
                                        </Win95Button>
                                    )}

                                    {isHost && (
                                        <Win95Button
                                            className={styles.panelButton()}
                                            onClick={handleCloseModal}
                                        >
                                            Close
                                        </Win95Button>
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
