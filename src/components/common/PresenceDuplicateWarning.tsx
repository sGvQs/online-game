'use client'

import { useState, ReactNode } from 'react'
import { usePresenceDuplicateWarning } from '@/hooks/usePresenceDuplicateWarning'
import { AlertTriangle, X } from 'lucide-react'

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
                <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center gap-4 bg-amber-500/95 text-amber-950 px-4 py-3 shadow-lg">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm font-medium">
                        同じルームが別のタブで開かれています。ゲームの動作が不安定になる可能性があります。
                    </p>
                    <button
                        type="button"
                        onClick={() => setDismissed(true)}
                        className="p-1 rounded hover:bg-amber-600/30"
                        aria-label="閉じる"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    )
}
