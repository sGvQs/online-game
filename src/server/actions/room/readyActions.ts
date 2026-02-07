'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import { revalidatePath } from 'next/cache'

/**
 * 自分の準備完了状態をトグルする
 * 
 * @param roomId - ルームID
 * @returns 更新後の準備状態
 */
export async function toggleReady(roomId: string): Promise<boolean> {
    const user = await getAuthenticatedUser()

    // 現在の準備状態を取得
    const roomUser = await prisma.roomUser.findUnique({
        where: {
            roomId_userId: {
                roomId,
                userId: user.id,
            },
        },
    })

    if (!roomUser) {
        throw new Error('ユーザーがルームに参加していません')
    }

    // 準備状態をトグル
    const updated = await prisma.roomUser.update({
        where: {
            id: roomUser.id,
        },
        data: {
            isReady: !roomUser.isReady,
        },
    })

    revalidatePath(`/room/${roomId}`)
    revalidatePath(`/game/${roomId}/error-hunter`)

    return updated.isReady
}

/**
 * Room と各ユーザーの準備状態を取得
 * 
 * @param roomId - ルームID
 * @returns Room と準備状態付きユーザー情報
 */
export async function getRoomWithReadyStatus(roomId: string) {
    await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            users: {
                include: {
                    user: true,
                },
            },
            creator: true,
        },
    })

    if (!room) {
        throw new Error('ルームが見つかりません')
    }

    return room
}

/**
 * ゲーム開始時に全員の準備状態をリセット
 * 
 * @param roomId - ルームID
 */
export async function resetAllReady(roomId: string): Promise<void> {
    await getAuthenticatedUser()

    await prisma.roomUser.updateMany({
        where: {
            roomId,
        },
        data: {
            isReady: false,
        },
    })

    revalidatePath(`/room/${roomId}`)
    revalidatePath(`/game/${roomId}/error-hunter`)
}
