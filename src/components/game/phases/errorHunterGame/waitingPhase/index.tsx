'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import { Win95ProgressBar } from '@/components/game/common/errorHunter/win95ProgressBar'
import { waitingPhase } from './styles'

export interface WaitingPhaseProps {
    waitProgress: number
}

export function WaitingPhase({ waitProgress }: WaitingPhaseProps) {
    const styles = waitingPhase()
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <Win95Dialog title="System Monitor">
                <div className={styles.inner()}>
                    <p className={styles.scanningText()}>
                        Scanning for errors...
                    </p>
                    <Win95ProgressBar progress={waitProgress} />
                    <p className={styles.hintText()}>
                        Please wait. An error may occur at any moment.
                    </p>
                </div>
            </Win95Dialog>
        </div>
    )
}
