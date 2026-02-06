'use client'

import { useErrorHunter } from '@/hooks/useErrorHunter'
import { GamePageClient } from './GamePageClient'
import { Win95Dialog } from './Win95Dialog'
import { Win95ProgressBar } from './Win95ProgressBar'
import { RoomWithUsers } from '@/shared/types'
import { useEffect, useState } from 'react'

interface ErrorHunterGameProps {
    room: Omit<RoomWithUsers, 'creator'>
    isHost: boolean
    roomId: string
    initialMatchId: string | null
    currentUserId: string
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
    room,
    isHost,
    roomId,
    initialMatchId,
    currentUserId,
}: ErrorHunterGameProps) {
    const {
        phase,
        match,
        clickResult,
        progress,
        isProcessing,
        handleStartGame,
        handleClickError,
        handleFinish,
    } = useErrorHunter({ roomId, isHost, initialMatchId })

    // WAITING フェーズ用のプログレスバー (不確定プログレス風アニメーション)
    const [waitProgress, setWaitProgress] = useState(0)

    useEffect(() => {
        if (phase !== 'WAITING') {
            setWaitProgress(0)
            return
        }

        const interval = setInterval(() => {
            setWaitProgress(prev => {
                // 0〜100をループするアニメーション
                const next = prev + 4
                return next > 100 ? 0 : next
            })
        }, 150)

        return () => clearInterval(interval)
    }, [phase])

    // 勝者情報を取得
    const errorEvent = match?.error_events[0]
    const winnerName = errorEvent?.users?.name ?? null

    // 自分が勝ったかどうか（Realtime経由で更新された場合の判定）
    const isMyWin = errorEvent?.closed_by === currentUserId

    // ユーザー名のマップを作成（進行状況表示用）
    const userNameMap = new Map<string, string>()
    room.users.forEach(roomUser => {
        if (roomUser.user) {
            userNameMap.set(roomUser.user.id, roomUser.user.name)
        }
    })

    return (
        <GamePageClient
            room={room}
            isHost={isHost}
            roomId={roomId}
            showTitle={phase === 'TITLE'}
            onStartGame={handleStartGame}
            isStartDisabled={isProcessing}
        >
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
                                    .sort(([, a], [, b]) => (b as number) - (a as number))
                                    .map(([userId, score], index) => (
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

            {/* APPEARING フェーズ: 20個のエラーモーダル出現 — 早い者勝ちで閉じる */}
            {phase === 'APPEARING' && (
                <div className="fixed inset-0 z-50">
                    {match?.error_events
                        .filter(event => !event.closed_at)
                        .map((event) => {
                            const errorWithPosition = event as typeof event & { position_x: number; position_y: number }
                            return (
                            <div
                                key={event.id}
                                className="win95-dialog"
                                style={{
                                    position: 'absolute',
                                    left: `${errorWithPosition.position_x}%`,
                                    top: `${errorWithPosition.position_y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    animation: 'win95-appear 0.15s ease-out',
                                    width: '400pxpx',
                                    height: '120px',
                                }}
                            >
                                <div className="win95-dialog-inner-error">
                                    {/* Title Bar with Close Button */}
                                    <div className="win95-titlebar">
                                        <span className="win95-titlebar-text">Error</span>
                                        <div className="win95-titlebar-buttons">
                                            <button
                                                className="win95-titlebar-btn"
                                                onClick={() => handleClickError(event.id)}
                                                disabled={isProcessing}
                                                aria-label="Close"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>

                                    {/* Error Content */}
                                    <div className="win95-dialog-content">
                                        <div className="win95-dialog-icon">
                                            <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <circle cx="16" cy="16" r="14" fill="#ff0000" stroke="#800000" strokeWidth="2" />
                                                <path d="M10 10L22 22M22 10L10 22" stroke="white" strokeWidth="3" strokeLinecap="round" />
                                            </svg>
                                        </div>
                                        <div className="win95-dialog-message">
                                            <p style={{ whiteSpace: 'pre-line', fontSize: '12px' }}>
                                                {getRandomErrorMessage()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )})}
                </div>
            )}

            {/* RESULT フェーズ: スコアボード表示 */}
            {phase === 'RESULT' && progress && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <Win95Dialog
                        title="Result"
                        icon="lose"
                        buttons={[
                            ...(isHost ? [{
                                label: '終了',
                                onClick: handleFinish,
                                primary: true,
                            }] : [])
                        ]}
                    >
                        <div style={{ minWidth: '350px' }}>
                            <div style={{ marginBottom: '12px', marginLeft: "24px" }}>
                            <p 
                                style={{ 
                                    fontSize : '12px',
                                    fontWeight : 'normal',
                                    color:  '#000',
                                    marginBottom: '4px',
                                    padding: '4px',
                                    backgroundColor: 'transparent',
                                    borderRadius: '2px'
                                }}
                            >
                                {match?.winner_id === currentUserId ? "あなたから全員へのコメント" : "勝者からのコメント"}
                            </p>
                            <p style={{ 
                                fontSize:  '14px',
                                fontWeight:  'bold',
                                color:  '#000080' ,
                                marginBottom: '4px',
                                padding: '4px',
                                backgroundColor:  '#e0e0e0' ,
                                borderRadius: '2px'
                            }}
                            >
                                ちゃんと野菜食べてますかー？（ここはuserが持つ煽りコメントに変えたい）
                            </p>
                            </div>
                            {match?.winner_id === currentUserId ? (
                                <p style={{ fontSize: '12px', color: '#000080',marginLeft: "24px", marginTop: '12px' }}>
                                    あなたの勝ちです
                                </p>
                            ): (
                                <p style={{ fontSize: '12px', color: '#000080',marginLeft: "24px", marginTop: '12px' }}>
                                    あなたの負けです
                                </p> 
                            )}
                        </div>
                    </Win95Dialog>
                </div>
            )}
        </GamePageClient>
    )
}
