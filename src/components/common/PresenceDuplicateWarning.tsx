'use client'

import { useState, ReactNode } from 'react'
import { usePresenceDuplicateWarning } from '@/hooks/usePresenceDuplicateWarning'
import { AlertTriangle, X } from 'lucide-react'
import { presenceDuplicateWarning } from './PresenceDuplicateWarning.styles'

const styles = presenceDuplicateWarning()

interface PresenceDuplicateWarningProps {
    roomId: string
    currentUserId: string
    children: ReactNode
}

export function PresenceDuplicateWarning({
    roomId,
    currentUserId,
    children,
}: PresenceDuplicateWarningProps) {
    const { isDuplicate } = usePresenceDuplicateWarning({ roomId, currentUserId })
    const [dismissed, setDismissed] = useState(false)

    const showWarning = isDuplicate && !dismissed

    return (
        <>
            {children}
            {showWarning && (
                <div className={styles.banner()}>
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className={styles.message()}>
                        同じルームが別のタブで開かれています。ゲームの動作が不安定になる可能性があります。
                    </p>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className={styles.dismissButton()}
                        aria-label="閉じる"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    )
}
