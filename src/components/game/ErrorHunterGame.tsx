'use client'

import { useErrorHunter } from '@/hooks/useErrorHunter'
import { GamePageClient } from './GamePageClient'
import { Win95Dialog } from './Win95Dialog'
import { Win95ProgressBar } from './Win95ProgressBar'
import { Room } from '@/shared/types'
import { useEffect, useState } from 'react'

interface ErrorHunterGameProps {
    room: Room
    isHost: boolean
    roomId: string
    initialMatchId: string | null
    currentUserId: string
}

/** ランダムなエラーメッセージ */
const ERROR_MESSAGES = [
    'A fatal exception 0E has occurred at 0028:C0034B03.\nThe current application will be terminated.',
    'An error has occurred in your application.\nIf you choose Close, your work will be lost.',
    'KERNEL32.DLL caused a General Protection Fault\nin module UNKNOWN at 0000:00000000.',
    'This program has performed an illegal operation\nand will be shut down.',
    'Windows Protection Error.\nYou need to restart your computer.',
    'A device attached to the system is not functioning.\nError code: 0x0000001F',
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

    return (
        <GamePageClient
            room={room}
            isHost={isHost}
            roomId={roomId}
            showTitle={phase === 'TITLE'}
            onStartGame={handleStartGame}
            isStartDisabled={isProcessing}
        >
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

            {/* APPEARING フェーズ: エラーモーダル出現 — 早い者勝ちで閉じる */}
            {phase === 'APPEARING' && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <div className="win95-dialog" style={{ minWidth: '420px', animation: 'win95-appear 0.15s ease-out' }}>
                        <div className="win95-dialog-inner">
                            {/* Title Bar with Close Button */}
                            <div className="win95-titlebar">
                                <span className="win95-titlebar-text">Error</span>
                                <div className="win95-titlebar-buttons">
                                    <button
                                        className="win95-titlebar-btn"
                                        onClick={handleClickError}
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
                                    <p style={{ whiteSpace: 'pre-line' }}>
                                        {getRandomErrorMessage()}
                                    </p>
                                </div>
                            </div>

                            {/* OK Button */}
                            <div className="win95-button-group">
                                <button
                                    className="win95-button"
                                    onClick={handleClickError}
                                    disabled={isProcessing}
                                    autoFocus
                                >
                                    OK
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* RESULT フェーズ: 勝敗結果表示 */}
            {phase === 'RESULT' && (
                <div className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                >
                    <Win95Dialog
                        title="Result"
                        icon={isMyWin || clickResult === 'win' ? 'info' : 'warning'}
                        buttons={[
                            ...(isHost ? [{
                                label: '終了',
                                onClick: handleFinish,
                                primary: true,
                            }] : []),
                            ...(!isHost ? [{
                                label: 'タイトルに戻る',
                                onClick: handleFinish,
                                primary: true,
                            }] : []),
                        ]}
                    >
                        <div style={{ minWidth: '300px' }}>
                            {(isMyWin || clickResult === 'win') ? (
                                <>
                                    <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#000080' }}>
                                        YOU WIN!
                                    </p>
                                    <p style={{ color: '#000' }}>
                                        あなたが最速でエラーを閉じました!
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px', color: '#800000' }}>
                                        YOU LOSE...
                                    </p>
                                    {winnerName && (
                                        <p style={{ color: '#000' }}>
                                            <strong>{winnerName}</strong> がエラーを閉じました。
                                        </p>
                                    )}
                                    {!winnerName && (
                                        <p style={{ color: '#000' }}>
                                            誰かが先にエラーを閉じました。
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </Win95Dialog>
                </div>
            )}
        </GamePageClient>
    )
}
