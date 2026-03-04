'use client'

import { useEffect, useState } from 'react'
import { DEBUG_COMPLAINT_EVENT } from './debugComplaintKeyListener'
import { AnnoyingDinosaurComplaint } from './annoyingDinosaurComplaint'
import { getComplaintMessageForRoomName } from '@/constants/dashboard/roomDeletedComplaints'
import { markRoomDeletedNotificationsAsRead } from '@/server/actions'

type Notification = { id: string; roomName: string }

/**
 * デバッグコマンド実行時のメッセージ
 * 修正方針：
 * - 「思い出しそうで思い出さない」
 * - 因果を追わない
 * - 相手を詮索しない
 * - 整理しない
 * - ただそこで何かが浮かびかけてる
 */

const DEBUG_MESSAGES = [
    'あ。',
    'Cmd+Shift+7……。',
    '誰かが。',
    'あの人。',
    'あ、昔の。',
    'あの人も。',
    'PC。',
    'まだあるのか。',
    'え、どうして。',
    '知ってるのか。',
    'PC、ここに。',
    'あ、そっか。',
    'ぷかぷか。',
    '何か出た。',
    '……。',
]

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
        ? DEBUG_MESSAGES[Math.floor(Math.random() * DEBUG_MESSAGES.length)]!
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
