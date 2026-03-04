'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import { Win95ProgressBar } from '@/components/game/common/errorHunter/win95ProgressBar'
import { progressPanel } from './styles'
import type { MatchProgress } from '@/types'
import type { GamePhase } from '@/hooks/useErrorHunter'

export interface ProgressPanelProps {
    progress: MatchProgress
    userNameMap: Map<string, string>
    phase: GamePhase
}

export function ProgressPanel({ progress, userNameMap, phase }: ProgressPanelProps) {
    const styles = progressPanel()
    return (
        <div className="fixed bottom-4 left-4 z-50">
            <Win95Dialog title="Progress">
                <div className={styles.inner()}>
                    <p className={styles.remainingText()}>
                        残りのエラー: {progress.totalErrors - progress.closedErrors} / {progress.totalErrors}
                    </p>
                    <Win95ProgressBar
                        progress={(progress.closedErrors / progress.totalErrors) * 220}
                    />
                    <div className={styles.scoresSection()}>
                        <p className={styles.scoresLabel()}>
                            スコア:
                        </p>
                        {Object.entries(progress.scores)
                            .sort(([, a], [, b]) => b - a)
                            .map(([userId, score], index) => (
                                <p key={userId} className={styles.scoreRow()}>
                                    {userNameMap.get(userId) || 'Unknown'}: {score}個{' '}
                                    {index === 0 && phase === 'RESULT' && (
                                        <span className={styles.winnerBadge()}>
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
