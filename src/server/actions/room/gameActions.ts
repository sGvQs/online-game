'use server'

import { prisma } from '@/server/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
import { RoomStatus } from '@/shared/types'

/**
 * ホストがゲームを選択したときに呼び出される
 * activeGameTypeを更新し、全員がゲーム画面に遷移するトリガーとなる
 */
export async function selectGame(roomId: string, gameType: string) {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('ゲームを選択する権限がありません（ホストのみ）')

    await prisma.room.update({
        where: { id: roomId },
        data: {
            activeGameType: gameType,
            status: RoomStatus.PLAYING
        }
    })

    revalidatePath(`/room/${roomId}`)
}

/**
 * ゲーム画面からルームに戻るときに呼び出される
 * activeGameTypeをnullに戻し、全員がルーム画面に遷移するトリガーとなる
 */
export async function returnToRoom(roomId: string) {
    const user = await getAuthenticatedUser()

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    })

    if (!room) throw new Error('ルームが見つかりません')
    if (room.createdBy !== user.id) throw new Error('ルームに戻る権限がありません（ホストのみ）')

    await prisma.room.update({
        where: { id: roomId },
        data: {
            activeGameType: null,
            status: RoomStatus.LOBBY
        }
    })

    // 戻るタイミングで全てのゲームデータ削除
    await prisma.matches.deleteMany({
        where: {room_id : roomId}
    });

    return;

}
