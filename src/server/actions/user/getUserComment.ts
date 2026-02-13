'use server'

import { prisma } from '@/server/lib/prisma';

interface GetUserCommentReturnValue {
    comment: string
    userName: string
}

/**
 * ユーザーIDを指定して煽りコメントを取得
 * ゲーム終了後に勝者のコメントを表示するために使用
 */
export async function getUserComment(userId: string): Promise<GetUserCommentReturnValue | null> {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                comment: true,
                name: true
            }
        })

        return {
            comment: user?.comment || '',
            userName: user?.name || ''
        }
    } catch (error) {
        throw error
    }
}
