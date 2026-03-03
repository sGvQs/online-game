'use client'

import { useErrorHunter } from '@/hooks/useErrorHunter'
import { useGameRoom } from '@/hooks/useGameRoom'
import { returnToRoom, leaveRoom } from '@/server/actions/room'
import { Win95Dialog } from '../Win95Dialog'
import { Win95ProgressBar } from '../Win95ProgressBar'
import { Win95Button } from '../Win95Button'
import { Win95TitleBarButton } from '../Win95TitleBarButton'
import { useSE } from '@/hooks/useSE'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { RoomWithUsersAndReadyStatus, RoomUserWithReadyStatus, ErrorEventWithUser, RoomUser, UserRanking } from '@/shared/types'
import { FACE_ICON_PATHS, DEFAULT_FACE_ICON } from '@/shared/constants/faceIcon'
import { getNullHandRankings } from '@/server/actions/game/rankingActions'
import { cn } from '@/lib/utils'
import { errorHunterGame } from './styles'
import { PresenceDuplicateWarning } from '@/components/common/PresenceDuplicateWarning'

interface ErrorHunterGameProps {
    room: RoomWithUsersAndReadyStatus
    isHost: boolean
    roomId: string
    initialMatchId: string | null
    currentUserId: string
    initialRankings?: UserRanking[]
}

/** ランダムなエラーメッセージ */
const ERROR_MESSAGES = [
    // 'A fatal exception 0E has occurred at 0028:C0034B03.\nThe current application will be terminated.',
    // 'An error has occurred in your application.\nIf you choose Close, your work will be lost.',
    // 'KERNEL32.DLL caused a General Protection Fault\nin module UNKNOWN at 0000:00000000.',
    // 'This program has performed an illegal operation\nand will be shut down.',
    'Windows Protection Error.\nYou need to restart your computer.',
    // 'A device attached to the system is not functioning.\nError code: 0x0000001F',
]

function getRandomErrorMessage(): string {
    return ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]
}

export function ErrorHunterGame({
    room: initialRoom, // データーベースからのroom情報
    isHost, // ホストかどうか
    roomId, // クエリパラメーターからのroomID
    initialMatchId, // roomに紐ずくmatchID => 全員nullの可能性ある
    currentUserId, // 現在のユーザーID
    initialRankings = [], // 参加者の月間ランキング
}: ErrorHunterGameProps) {
    const styles = errorHunterGame()

    // ゲームルームの情報を統治するHooks
    const {
        room,
        isReady,
        toggleReady,
        userNameMap,
        isTogglingReady
    } = useGameRoom({
        roomId,
        initialRoom,
        currentUserId
    })

    const handleClose = async () => {
        await returnToRoom(roomId)
    }

    const handleLeave = async () => {
        await leaveRoom(roomId)
    }

    // エラーハンターゲームのロジックを統治するHooks
    const {
        phase,
        match,
        progress,
        isProcessing,
        handleStartGame,
        handleClickError,
        handleFinish,
        waitProgress,
        winnerComment,
        winnerName,
        winnerFaceIconPath,
    } = useErrorHunter({ roomId, isHost, initialMatchId, currentUserId })


    // GamePageClient logic merged here
    const [initProgress, setInitProgress] = useState(0)
    const [isInitializing, setIsInitializing] = useState(true)
    const [showDescription, setShowDescription] = useState(false)
    const { play } = useSE()

    // ランキング表示用（RESULT→TITLE 戻り時に再取得して最新のポイントを反映）
    const [rankings, setRankings] = useState<UserRanking[]>(initialRankings)
    const prevPhaseRef = useRef(phase)

    useEffect(() => {
        setRankings(initialRankings)
    }, [initialRankings])

    useEffect(() => {
        const prevPhase = prevPhaseRef.current
        prevPhaseRef.current = phase

        if (prevPhase === 'RESULT' && phase === 'TITLE') {
            const userIds = room.users.map((u) => u.userId)
            getNullHandRankings(userIds).then((fresh) => setRankings(fresh))
        }
    }, [phase, room.users])

    // Simulate initialization progress
    useEffect(() => {
        if (isInitializing) {
            const interval = setInterval(() => {
                setInitProgress(prev => {
                    if (prev >= 200) {
                        setIsInitializing(false)
                        play('chime')
                        return 200
                    }
                    return prev + 8
                })
            }, 200)
            return () => clearInterval(interval)
        }
    }, [isInitializing, play])

    const ASCII_ART =
        `███████╗██████╗ ██████╗  ██████╗ ██████╗ 
██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗
█████╗  ██████╔╝██████╔╝██║   ██║██████╔╝
██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔══██╗
███████╗██║  ██║██║  ██║╚██████╔╝██║  ██║
╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝

██╗  ██╗██╗   ██╗███╗   ██╗████████╗███████╗██████╗ 
██║  ██║██║   ██║████╗  ██║╚══██╔══╝██╔═══╝██╔══██╗
███████║██║   ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝
██╔══██║██║   ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗
██║  ██║╚██████╔╝██║ ╚████║   ██║   ███████╗██║  ██║
╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝`

    const readyCount = room.users.filter((u: RoomUserWithReadyStatus) => u.isReady).length
    const totalUsers = room.users.length
    const allUsersReady = room.users.every((u: RoomUserWithReadyStatus) => u.isReady)

    return (
        <PresenceDuplicateWarning roomId={roomId} currentUserId={currentUserId}>
        <div className={styles.container()}>
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

            {/* Title Modal (Lobby) */}
            {!isInitializing && phase === 'TITLE' && (
                <div className={styles.modalOverlay()}>
                    <div className={styles.modal()}>
                        <div className={styles.modalInner()}>
                            <div className={styles.titlebar()}>
                                <span className={styles.titlebarText()}>ERROR HUNTER</span>
                                {isHost && (
                                    <div className={styles.titlebarButtons()}>
                                        <Win95TitleBarButton
                                            onClick={handleClose}
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
                                                        {[...room.users]
                                                            .sort((a, b) => {
                                                                const rankA = rankings.find((r) => r.userId === a.userId)?.rank ?? Infinity
                                                                const rankB = rankings.find((r) => r.userId === b.userId)?.rank ?? Infinity
                                                                return rankA - rankB
                                                            })
                                                            .map((roomUser: RoomUserWithReadyStatus) => {
                                                            const ranking = rankings.find((r) => r.userId === roomUser.userId)
                                                            const faceIcon = roomUser.user?.faceIcon ?? DEFAULT_FACE_ICON
                                                            const faceIconPath = FACE_ICON_PATHS[faceIcon]
                                                            return (
                                                                <div
                                                                    key={roomUser.id}
                                                                    className={cn(styles.playerItem(), 'gap-2')}
                                                                >
                                                                    <div className={roomUser.isReady ? styles.playerRadioReady() : styles.playerRadio()} />
                                                                    <Image
                                                                        src={faceIconPath}
                                                                        alt=""
                                                                        width={24}
                                                                        height={24}
                                                                        className="shrink-0 rounded-full object-contain"
                                                                    />
                                                                    <span>
                                                                        {roomUser.user?.name || 'Unknown'}
                                                                        {roomUser.userId === currentUserId && ' (あなた)'}
                                                                    </span>
                                                                    {ranking && (
                                                                        <span className="text-[10px] text-gray-500 ml-auto">
                                                                            {ranking.rank}位 {ranking.points}pt
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )
                                                        })}
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
                                                {/* Image removed for simplicity or needs import */}
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

                                    <Win95Button
                                        className={styles.panelButton()}
                                        onClick={toggleReady}
                                        disabled={isTogglingReady}
                                        style={{
                                            backgroundColor: isReady ? '#008000' : undefined,
                                            color: isReady ? '#fff' : undefined,
                                        }}
                                    >
                                        準備完了
                                    </Win95Button>

                                    {isHost && (
                                        <Win95Button
                                            className={styles.panelButton()}
                                            onClick={handleStartGame}
                                            disabled={isProcessing || !allUsersReady}
                                        >
                                            ゲーム開始
                                        </Win95Button>
                                    )}

                                    {isHost && (
                                        <Win95Button
                                            className={styles.panelButton()}
                                            onClick={handleClose}
                                        >
                                            Close
                                        </Win95Button>
                                    )}

                                    {!isHost && (
                                        <Win95Button
                                            className={styles.panelButton()}
                                            onClick={handleLeave}
                                        >
                                            LEAVE
                                        </Win95Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* 進行状況バー: WAITING と APPEARING フェーズで表示 */}
            {(phase === 'WAITING' || phase === 'APPEARING' || phase === 'RESULT') && progress && (
                <div className="fixed bottom-4 left-4 z-50">
                    <Win95Dialog title="Progress">
                        <div style={{ minWidth: '380px' }}>
                            <p style={{ color: '#000', marginBottom: '8px', fontSize: '12px' }}>
                                残りのエラー: {progress.totalErrors - progress.closedErrors} / {progress.totalErrors}
                            </p>
                            <Win95ProgressBar
                                progress={(progress.closedErrors / progress.totalErrors) * 220}
                            />
                            <div style={{ marginTop: '12px' }}>
                                <p style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', color: '#000' }}>
                                    スコア:
                                </p>
                                {Object.entries(progress.scores)
                                    .sort(([, a]: [string, number], [, b]: [string, number]) => b - a)
                                    .map(([userId, score]: [string, number], index: number) => (
                                        <p key={userId} style={{ fontSize: '11px', color: '#000', marginBottom: '2px' }}>
                                            {userNameMap.get(userId) || 'Unknown'}: {score as number}個 {index === 0 && phase === 'RESULT' && <span style={{ color: 'blue', fontWeight: 'bold', marginLeft: '4px' }}>👈 勝者</span>}
                                        </p>
                                    ))}
                            </div>
                        </div>
                    </Win95Dialog>
                </div>
            )}

            {/* WAITING フェーズ: エラー出現を待機中 */}
            {phase === 'WAITING' && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <Win95Dialog title="System Monitor">
                        <div style={{ minWidth: '350px' }}>
                            <p style={{ marginBottom: '12px', color: '#000' }}>
                                Scanning for errors...
                            </p>
                            <Win95ProgressBar progress={waitProgress} />
                            <p style={{ marginTop: '8px', fontSize: '11px', color: '#808080' }}>
                                Please wait. An error may occur at any moment.
                            </p>
                        </div>
                    </Win95Dialog>
                </div>
            )}

            {/* APPEARING フェーズ: 47個のエラーモーダル出現 — 早い者勝ちで閉じる */}
            {phase === 'APPEARING' && (
                <div className="fixed inset-0 z-50">
                    {match?.errorEvents
                        .filter((event: ErrorEventWithUser) => !event.closedAt)
                        .map((event: ErrorEventWithUser) => {
                            const errorWithPosition = event as typeof event & { positionX: number; positionY: number }
                            return (
                                <div
                                    key={event.id}
                                    className={cn(styles.floatingDialog(), 'translate-x-[-50%] translate-y-[-50%]')}
                                    style={{
                                        left: `${errorWithPosition.positionX}%`,
                                        top: `${errorWithPosition.positionY}%`,
                                        width: '400px',
                                    }}
                                >
                                    <Win95Dialog
                                        title="Error"
                                        icon="error"
                                        innerClassName="error"
                                        titlebarButtons={
                                            <Win95TitleBarButton
                                                onClick={() => handleClickError(event.id)}
                                                disabled={isProcessing}
                                                aria-label="Close"
                                            >
                                                ×
                                            </Win95TitleBarButton>
                                        }
                                    >
                                        <p style={{ whiteSpace: 'pre-line', fontSize: '12px' }}>
                                            {getRandomErrorMessage()}
                                        </p>
                                    </Win95Dialog>
                                </div>
                            )
                        })}
                </div>
            )}

            {/* RESULT フェーズ: スコアボード表示 */}
            {phase === 'RESULT' && progress && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <Win95Dialog
                        title="Result"
                        icon={winnerFaceIconPath ? undefined : 'lose'}
                        customIconSrc={winnerFaceIconPath ?? undefined}
                        buttons={[{
                            label: '終了',
                            onClick: handleFinish,
                            primary: true,
                        }]}
                    >
                        <div style={{ minWidth: '350px' }}>
                            <div style={{ marginBottom: '12px', marginLeft: "24px" }}>
                                <p
                                    style={{
                                        fontSize: '12px',
                                        fontWeight: 'normal',
                                        color: '#000',
                                        marginBottom: '4px',
                                        padding: '4px',
                                        backgroundColor: 'transparent',
                                        borderRadius: '2px'
                                    }}
                                >
                                    {match?.winnerId === currentUserId ? `${winnerName}さんから皆さんへのコメント` : `${winnerName}さんからのコメント`}
                                </p>
                                <p style={{
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    color: '#000080',
                                    marginBottom: '4px',
                                    padding: '4px',
                                    backgroundColor: '#e0e0e0',
                                    borderRadius: '2px'
                                }}
                                >
                                    {winnerComment || '私の勝ちです'}
                                </p>
                            </div>
                            {match?.winnerId === currentUserId ? (
                                <p style={{ fontSize: '12px', color: '#000080', marginLeft: "24px", marginTop: '12px' }}>
                                    あなたの勝ちです
                                </p>
                            ) : (
                                <p style={{ fontSize: '12px', color: '#000080', marginLeft: "24px", marginTop: '12px' }}>
                                    あなたの負けです
                                </p>
                            )}
                        </div>
                    </Win95Dialog>
                </div>
            )}
        </div>
        </PresenceDuplicateWarning>
    )
}
