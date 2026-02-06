'use server'

import { prisma } from '@/server/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'

/**
 * 新しいルームを作成
 */
export async function createRoom(formData: FormData) {
    const name = formData.get('name') as string
    if (!name) return

    const user = await getAuthenticatedUser()

    const room = await prisma.room.create({
        data: {
            name,
            createdBy: user.id,
            users: {
                create: {
                    userId: user.id
                }
            }
        }
    })

    revalidatePath('/dashboard')
    return room
}
