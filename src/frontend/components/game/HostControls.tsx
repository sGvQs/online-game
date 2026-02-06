import { ArrowLeft, Play } from 'lucide-react'
import { hostControls } from './host-controls.styles'

const styles = hostControls()

interface HostControlsProps {
    onReturnToRoom: () => void
    isPending: boolean
}

/**
 * HostControls - ホスト用コントロールボタンのPresentational Component
 */
export function HostControls({ onReturnToRoom, isPending }: HostControlsProps) {
    return (
        <div className={styles.wrapper()}>
            <button
                onClick={onReturnToRoom}
                disabled={isPending}
                className={styles.button()}
                style={{ minWidth: 120 }}
            >
                <ArrowLeft className={styles.buttonIcon()} />
                {isPending ? '戻っています...' : 'ルームに戻る'}
            </button>
            <button
                className={styles.button()}
                style={{ minWidth: 120 }}
            >
                <Play className={styles.buttonIcon()} />
                ゲーム開始
            </button>
        </div>
    )
}
