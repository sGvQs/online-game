import { waitingCard } from './game-selection.styles'

const styles = waitingCard()

/**
 * WaitingCard - 待機中メッセージのPresentational Component
 */
export function WaitingCard() {
    return (
        <div className={styles.wrapper()}>
            <div className={styles.text()}>
                ホストがゲームを選択するのを待っています...
            </div>
        </div>
    )
}
