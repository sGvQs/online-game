'use server'

import { prisma } from '@/server/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

/**
 * ルームに参加
 */
export async function joinRoom(roomId: string) {
    const user = await getAuthenticatedUser()

    const existingMembership = await prisma.roomUser.findFirst({
        where: {
            roomId,
            userId: user.id
        }
    })

    if (!existingMembership) {
        await prisma.roomUser.create({
            data: {
                roomId,
                userId: user.id
            }
        })
    }

    revalidatePath('/dashboard')
    redirect(`/room/${roomId}`)
}

/**
 * ルームから退出
 */
export async function leaveRoom(roomId: string) {
    const user = await getAuthenticatedUser()

    await prisma.roomUser.deleteMany({
        where: {
            roomId,
            userId: user.id
        }
    })

    revalidatePath(`/room/${roomId}`)
    redirect('/dashboard')
}
