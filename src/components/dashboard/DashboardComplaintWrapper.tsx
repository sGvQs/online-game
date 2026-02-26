'use client'

import { useEffect, useState } from 'react'
import { DEBUG_COMPLAINT_EVENT } from './DebugComplaintKeyListener'
import { AnnoyingDinosaurComplaint } from './AnnoyingDinosaurComplaint'
import { getComplaintMessageForRoomName } from '@/shared/constants/roomDeletedComplaints'
import { markRoomDeletedNotificationsAsRead } from '@/server/actions'

type Notification = { id: string; roomName: string }

const DEBUG_MESSAGE = 'デバッグ用：これはテストメッセージです。Cmd+Shift+7 で表示。'

/**
 * 未読のルーム削除通知がある場合、AnnoyingDinosaurComplaint を表示し、
 * 表示完了時に既読にする。
 * デバッグ: Cmd+Shift+7 で強制表示
 */
export function DashboardComplaintWrapper({
    notifications,
}: {
    notifications: Notification[]
}) {
    const [debugShow, setDebugShow] = useState(false)

    const hasNotifications = notifications.length > 0
    const shouldShow = hasNotifications || debugShow

    useEffect(() => {
        const handleEvent = () => setDebugShow((prev) => !prev)
        window.addEventListener(DEBUG_COMPLAINT_EVENT, handleEvent)
        return () => window.removeEventListener(DEBUG_COMPLAINT_EVENT, handleEvent)
    }, [])

    if (!shouldShow) return null

    const isDebug = !hasNotifications
    const message = isDebug
        ? DEBUG_MESSAGE
        : getComplaintMessageForRoomName(notifications[0]!.roomName)
    const ids = notifications.map((n) => n.id)

    const handleComplete = async () => {
        if (!isDebug) {
            await markRoomDeletedNotificationsAsRead(ids)
        }
        if (debugShow) setDebugShow(false)
    }

    return (
        <AnnoyingDinosaurComplaint message={message} onComplete={handleComplete} />
    )
}
