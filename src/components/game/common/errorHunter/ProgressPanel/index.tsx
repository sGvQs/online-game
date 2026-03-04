'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import { Win95ProgressBar } from '@/components/game/common/errorHunter/win95ProgressBar'
import type { MatchProgress } from '@/types'
import type { GamePhase } from '@/hooks/useErrorHunter'

export interface ProgressPanelProps {
    progress: MatchProgress
    userNameMap: Map<string, string>
    phase: GamePhase
}

export function ProgressPanel({ progress, userNameMap, phase }: ProgressPanelProps) {
    return (
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
                            .sort(([, a], [, b]) => b - a)
                            .map(([userId, score], index) => (
                                <p key={userId} style={{ fontSize: '11px', color: '#000', marginBottom: '2px' }}>
                                    {userNameMap.get(userId) || 'Unknown'}: {score}個{' '}
                                    {index === 0 && phase === 'RESULT' && (
                                        <span style={{ color: 'blue', fontWeight: 'bold', marginLeft: '4px' }}>
                                            👈 勝者
                                        </span>
                                    )}
                                </p>
                            ))}
                    </div>
                </div>
            </Win95Dialog>
        </div>
    )
}
