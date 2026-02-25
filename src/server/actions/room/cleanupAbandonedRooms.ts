'use server'

import { prisma } from '@/server/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import { RoomStatus } from '@prisma/client'

/** 放置とみなす時間（ミリ秒） */
const ABANDONED_THRESHOLD_MS = 60 * 60 * 1000 // 1時間

/**
 * 1時間以上放置されたルームを削除し、創作者に通知を作成する。
 * ダッシュボード訪問時に誰でも実行可能。
 */
export async function cleanupAbandonedRooms() {
    await getAuthenticatedUser()

    const threshold = new Date(Date.now() - ABANDONED_THRESHOLD_MS)

    const abandonedRooms = await prisma.room.findMany({
        where: {
            status: RoomStatus.LOBBY,
            createdAt: { lt: threshold },
        },
        include: { creator: true },
    })

    for (const room of abandonedRooms) {
        await prisma.roomDeletedNotification.create({
            data: {
                userId: room.createdBy,
                roomName: room.name,
            },
        })

        await prisma.room.delete({
            where: { id: room.id },
        })
    }

    if (abandonedRooms.length > 0) {
        revalidatePath('/dashboard')
    }
}
