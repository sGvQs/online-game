import { Gamepad2 } from 'lucide-react'
import { Button } from '@/frontend/components/ui/Button'
import { gameSelection } from './game-selection.styles'

const styles = gameSelection()

interface GameSelectionCardProps {
    onSelectGame: (gameType: string) => void
    isPending: boolean
}

/**
 * GameSelectionCard - ゲーム選択UIのPresentational Component
 */
export function GameSelectionCard({ onSelectGame, isPending }: GameSelectionCardProps) {
    return (
        <div className={styles.wrapper()}>
            <h3 className={styles.header()}>
                <Gamepad2 className={styles.headerIcon()} />
                ゲームを選択
            </h3>
            <div className={styles.grid()}>
                <Button
                    onClick={() => onSelectGame('error-hunter')}
                    disabled={isPending}
                    className={styles.gameButton()}
                >
                    <span className={styles.gameIcon()}>🐛</span>
                    <div className={styles.gameInfo()}>
                        <div className={styles.gameTitle()}>ERROR HUNTER</div>
                        <div className={styles.gameDescription()}>バグを見つけて潰せ！</div>
                    </div>
                </Button>
            </div>
            {isPending && (
                <div className={styles.loadingText()}>
                    ゲームを開始中...
                </div>
            )}
        </div>
    )
}
