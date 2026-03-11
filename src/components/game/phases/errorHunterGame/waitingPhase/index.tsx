'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import { Win95ProgressBar } from '@/components/game/common/errorHunter/win95ProgressBar'
import { waitingPhase } from './styles'
import { Typography } from '@/components/ui/typography'

export interface WaitingPhaseProps {
    waitProgress: number
}

export function WaitingPhase({ waitProgress }: WaitingPhaseProps) {
    const styles = waitingPhase()
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <Win95Dialog title="System Monitor">
                <div className={styles.inner()}>
                    <Typography variant="small" className={styles.scanningText()}>
                        Scanning for errors...
                    </Typography>
                    <Win95ProgressBar progress={waitProgress} />
                    <Typography variant="small" className={styles.hintText()}>
                        Please wait. An error may occur at any moment.
                    </Typography>
                </div>
            </Win95Dialog>
        </div>
    )
}
