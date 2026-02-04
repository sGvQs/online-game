'use server'

import { prisma } from '@/backend/lib/prisma'
import { createClient } from '@/backend/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getAuthenticatedUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('認証されていません')

    const dbUser = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!dbUser) throw new Error('ユーザーがデータベースに見つかりません')
    return dbUser.user
}

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

export async function getRooms() {
    const rooms = await prisma.room.findMany()
    return rooms
}

export async function getRoomUsers(id: string) {
    const roomUsers = await prisma.roomUser.findMany({
        where: { roomId: id },
        include: { user: true }
    })
    return roomUsers
}

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
