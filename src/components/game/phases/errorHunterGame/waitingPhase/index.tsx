'use client'

import { Win95Dialog } from '@/components/game/common/errorHunter/win95Dialog'
import { Win95ProgressBar } from '@/components/game/common/errorHunter/win95ProgressBar'

export interface WaitingPhaseProps {
    waitProgress: number
}

export function WaitingPhase({ waitProgress }: WaitingPhaseProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <Win95Dialog title="System Monitor">
                <div style={{ minWidth: '350px' }}>
                    <p style={{ marginBottom: '12px', color: '#000' }}>
                        Scanning for errors...
                    </p>
                    <Win95ProgressBar progress={waitProgress} />
                    <p style={{ marginTop: '8px', fontSize: '11px', color: '#808080' }}>
                        Please wait. An error may occur at any moment.
                    </p>
                </div>
            </Win95Dialog>
        </div>
    )
}
