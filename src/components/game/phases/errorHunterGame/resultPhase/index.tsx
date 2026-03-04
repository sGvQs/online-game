'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import { resultPhase } from './styles'
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
    const styles = resultPhase()
    return (
        <div className={styles.overlay()}>
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
                <div className={styles.inner()}>
                    <div className={styles.headerSection()}>
                        <p className={styles.commentLabel()}>
                            {match?.winnerId === currentUserId ? `${winnerName}さんから皆さんへのコメント` : `${winnerName}さんからのコメント`}
                        </p>
                        <p className={styles.commentText()}>
                            {winnerComment || '私の勝ちです'}
                        </p>
                    </div>
                    {match?.winnerId === currentUserId ? (
                        <p className={styles.resultText()}>
                            あなたの勝ちです
                        </p>
                    ) : (
                        <p className={styles.resultText()}>
                            あなたの負けです
                        </p>
                    )}
                </div>
            </Win95Dialog>
        </div>
    )
}
