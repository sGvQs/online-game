'use server'

import { prisma } from '@/server/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

/**
 * ルームを削除（オーナーのみ）
 */
export async function deleteRoom(roomId: string) {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('このルームを削除する権限がありません')

    await prisma.room.delete({
        where: { id: roomId }
    })

    revalidatePath('/dashboard')
}
