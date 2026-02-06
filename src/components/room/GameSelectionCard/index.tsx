import { Gamepad2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { gameSelection, waitingCard } from './styles'

const styles = gameSelection()

interface GameSelectionCardProps {
    onSelectGame: (gameType: string) => void
    isPending: boolean
    isHost: boolean
}

/**
 * GameSelectionCard - ゲーム選択UIのPresentational Component
 */
export function GameSelectionCard({ onSelectGame, isPending, isHost }: GameSelectionCardProps) {
    return (
        <div className={styles.wrapper()}>
            <h3 className={styles.header()}>
                <Gamepad2 className={styles.headerIcon()} />
                {isHost ? 'ゲームを選択' : 'ゲーム一覧'}
            </h3>
            <div className={styles.grid()}>
                <Button
                    onClick={() => onSelectGame('error-hunter')}
                    disabled={isPending}
                    className={styles.gameButton()}
                >
                    <span className={styles.gameIcon()}>⚠️</span>
                    <div className={styles.gameInfo()}>
                        <div className={styles.gameTitle()}>ERROR HUNTER</div>
                        <div className={styles.gameDescription()}>
                            {isHost ? 'バグを見つけて潰せ！' : 'クリックでルールを表示'}
                        </div>
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

const waitingStyles = waitingCard()

/**
 * WaitingCard - 待機中メッセージのPresentational Component
 */
export function WaitingCard() {
    return (
        <div className={waitingStyles.wrapper()}>
            <div className={waitingStyles.text()}>
                ホストがゲームを選択するのを待っています...
            </div>
        </div>
    )
}
