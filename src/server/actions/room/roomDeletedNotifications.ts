'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

/**
 * 未読のルーム削除通知を取得
 */
export async function getUnreadRoomDeletedNotifications() {
    const user = await getAuthenticatedUser()

    return prisma.roomDeletedNotification.findMany({
        where: {
            userId: user.id,
            isRead: false,
        },
        orderBy: { deletedAt: 'desc' },
    })
}

/**
 * 指定した通知を既読に更新
 */
export async function markRoomDeletedNotificationsAsRead(ids: string[]) {
    const user = await getAuthenticatedUser()

    await prisma.roomDeletedNotification.updateMany({
        where: {
            id: { in: ids },
            userId: user.id,
        },
        data: { isRead: true },
    })
}
