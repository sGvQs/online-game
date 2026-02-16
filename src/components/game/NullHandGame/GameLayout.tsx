import { ReactNode } from 'react'
import { nullHandGame } from './styles'
import { JankenPhase } from '@/shared/types'

interface GameLayoutProps {
    phase: JankenPhase
    error: string | null
    children: ReactNode // Expecting Main Area and Side Area or other content
    mainArea?: ReactNode
    sideArea?: ReactNode
    hostName: string
}

export function GameLayout({ phase, error, children, mainArea, sideArea, hostName }: GameLayoutProps) {
    const styles = nullHandGame()

    const getPhaseText = (p: JankenPhase) => {
        switch (p) {
            case 'SETUP': return `${hostName}の手を設定（未確定）`
            case 'SHOWCASE': return `${hostName}の手を公開（未確定）`
            case 'FINAL_DECISION': return `${hostName}の手を設定（確定）`
            case 'BATTLE': return 'ゲストの手を設定（確定）'
            case 'RESULT': return '結果発表'
            case 'GAME_OVER': return '最終結果'
            default: return ''
        }
    }

    // If mainArea and sideArea are provided, use them in the grid.
    // Otherwise render children directly (for flexibility).
    const content = mainArea || sideArea ? (
        <>
            {mainArea}
            {sideArea}
        </>
    ) : children

    return (
        <div className={styles.container()}>
            {/* エラー表示 */}
            {error && (
                <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-8 py-4 border-[3px] border-[#FF4444] font-bold tracking-widest shadow-[0_0_20px_rgba(255,0,0,0.5)] flex items-center gap-4">
                    <span className="text-2xl">⚠️</span>
                    <span>{error}</span>
                </div>
            )}

            <div className={styles.gameGrid()}>
                {/* フェーズ表示 */}
                <div className={styles.phaseBox()}>
                    {getPhaseText(phase)}
                </div>

                {content}
            </div>
        </div>
    )
}
