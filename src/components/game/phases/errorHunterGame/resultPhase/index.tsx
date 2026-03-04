'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import type { MatchWithErrorEventsAndUsers } from '@/types'

export interface ResultPhaseProps {
    match: MatchWithErrorEventsAndUsers | null
    winnerName: string
    winnerComment: string
    winnerFaceIconPath: string | null
    currentUserId: string
    onFinish: () => void
}

export function ResultPhase({
    match,
    winnerName,
    winnerComment,
    winnerFaceIconPath,
    currentUserId,
    onFinish,
}: ResultPhaseProps) {
    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-50"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
        >
            <Win95Dialog
                title="Result"
                icon={winnerFaceIconPath ? undefined : 'lose'}
                customIconSrc={winnerFaceIconPath ?? undefined}
                buttons={[{
                    label: '終了',
                    onClick: onFinish,
                    primary: true,
                }]}
            >
                <div style={{ minWidth: '350px' }}>
                    <div style={{ marginBottom: '12px', marginLeft: '24px' }}>
                        <p
                            style={{
                                fontSize: '12px',
                                fontWeight: 'normal',
                                color: '#000',
                                marginBottom: '4px',
                                padding: '4px',
                                backgroundColor: 'transparent',
                                borderRadius: '2px',
                            }}
                        >
                            {match?.winnerId === currentUserId ? `${winnerName}さんから皆さんへのコメント` : `${winnerName}さんからのコメント`}
                        </p>
                        <p
                            style={{
                                fontSize: '14px',
                                fontWeight: 'bold',
                                color: '#000080',
                                marginBottom: '4px',
                                padding: '4px',
                                backgroundColor: '#e0e0e0',
                                borderRadius: '2px',
                            }}
                        >
                            {winnerComment || '私の勝ちです'}
                        </p>
                    </div>
                    {match?.winnerId === currentUserId ? (
                        <p style={{ fontSize: '12px', color: '#000080', marginLeft: '24px', marginTop: '12px' }}>
                            あなたの勝ちです
                        </p>
                    ) : (
                        <p style={{ fontSize: '12px', color: '#000080', marginLeft: '24px', marginTop: '12px' }}>
                            あなたの負けです
                        </p>
                    )}
                </div>
            </Win95Dialog>
        </div>
    )
}
