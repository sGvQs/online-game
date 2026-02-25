'use client'

import { AnnoyingDinosaurComplaint } from './AnnoyingDinosaurComplaint'
import { getComplaintMessageForRoomName } from '@/shared/constants/roomDeletedComplaints'
import { markRoomDeletedNotificationsAsRead } from '@/server/actions'

type Notification = { id: string; roomName: string }

/**
 * 未読のルーム削除通知がある場合、AnnoyingDinosaurComplaint を表示し、
 * 表示完了時に既読にする
 */
export function DashboardComplaintWrapper({
    notifications,
}: {
    notifications: Notification[]
}) {
    if (notifications.length === 0) return null

    const message = getComplaintMessageForRoomName(notifications[0]!.roomName)
    const ids = notifications.map((n) => n.id)

    const handleComplete = async () => {
        await markRoomDeletedNotificationsAsRead(ids)
    }

    return (
        <AnnoyingDinosaurComplaint message={message} onComplete={handleComplete} />
    )
}
