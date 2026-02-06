'use server'

import { prisma } from '@/server/lib/prisma'

/**
 * ルーム詳細を取得（シンプル版）
 */
export async function getRoom(id: string) {
    const room = await prisma.room.findFirst({
        where: { id },
    })
    return room
}

/**
 * ルーム詳細をユーザー付きで取得
 * メンバーシップ確認やメンバーリスト表示に使用
 */
export async function getRoomWithUsers(id: string) {
    const room = await prisma.room.findUnique({
        where: { id },
        include: {
            users: {
                include: { user: true }
            }
        }
    })
    return room
}

/**
 * ルームのユーザー一覧を取得
 */
export async function getRoomUsers(id: string) {
    const roomUsers = await prisma.roomUser.findMany({
        where: { roomId: id },
        include: { user: true }
    })
    return roomUsers
}
