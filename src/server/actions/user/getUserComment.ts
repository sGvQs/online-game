'use server'

import { prisma } from '@/server/lib/prisma'
import { FACE_ICON_PATHS, DEFAULT_FACE_ICON } from '@/shared/constants/faceIcon'

interface GetUserCommentReturnValue {
    comment: string
    userName: string
    faceIconPath: string
}

/**
 * ユーザーIDを指定して煽りコメントを取得
 * ゲーム終了後に勝者のコメントを表示するために使用
 */
export async function getUserComment(userId: string): Promise<GetUserCommentReturnValue | null> {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                comment: true,
                name: true,
                faceIcon: true,
            },
        })

        if (!user) return null

        const faceIconPath = user.faceIcon
            ? FACE_ICON_PATHS[user.faceIcon]
            : FACE_ICON_PATHS[DEFAULT_FACE_ICON]

        return {
            comment: user.comment || '',
            userName: user.name || '',
            faceIconPath,
        }
    } catch (error) {
        throw error
    }
}
