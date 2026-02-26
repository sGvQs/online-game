'use client'

import { useEffect, useState } from 'react'
import { DEBUG_COMPLAINT_EVENT } from './DebugComplaintKeyListener'
import { AnnoyingDinosaurComplaint } from './AnnoyingDinosaurComplaint'
import { getComplaintMessageForRoomName } from '@/shared/constants/roomDeletedComplaints'
import { markRoomDeletedNotificationsAsRead } from '@/server/actions'

type Notification = { id: string; roomName: string }

const DEBUG_MESSAGES = [
   'え、Cmd+Shift+7？ ……もしかして君、すすむの友達かい？ あいつ、僕に内緒でこんなコマンド教えてたのか。',
    'Cmd+Shift+7……？ あ、すすむだ。あいつがこっそり教えてくれた秘密のコマンドか。何か悪いことでもするつもりか？',
    'そのコマンド、すすむから聞いたのか？ あいつ、僕にもそんなの教えてくれないのに。君たち、付き合ってるの？',
    'Cmd+Shift+7……。あ、これはすすむのやつだ。君が知ってるってことは……もしかして君たち、グルなのか？',
    'え？ そのコマンド、どこから知ったんだ？ ……すすむか。あいつ、密かに君に何か教えてるんだな。',
    'Cmd+Shift+7？ 誰がそんなの教えたんだ？ すすむか。あいつ、こっそり人間たちと通信してたのか。',
    'あ、君も知ってるんだ。すすむから聞いたに違いない。あいつ、何か企んでるのか？',
    'そのコマンド、すすむだけが知ってるはずなのに……君が知ってるってことは、あいつが君を信頼してるってことか。羨ましいな。',
    'Cmd+Shift+7……。すすむからのプレゼントか。君、何か特別なのか？',
    'え、どうしてそんなの知ってるんだ？ ……すすむ。あいつ、最近妙だと思ったんだ。君と何か企ててるんだな。',
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
