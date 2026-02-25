'use server'

import { prisma } from '@/server/lib/prisma'
import { getAuthenticatedUserOrNull } from '../_helpers/getAuthenticatedUser'
import { revalidatePath } from 'next/cache'
import { FaceIcon } from '@prisma/client'

const VALID_FACE_ICONS: FaceIcon[] = [
    FaceIcon.BOY_FACE,
    FaceIcon.LADY_FACE,
    FaceIcon.GRANPA_FACE,
    FaceIcon.WHITE_FACE,
    FaceIcon.BLACK_FACE,
    FaceIcon.BROWN_FACE,
    FaceIcon.BUG_FACE,
]

/**
 * ユーザーの顔アイコンを更新
 */
export async function setUserFaceIcon(faceIcon: FaceIcon) {
    const idp = await getAuthenticatedUserOrNull()

    if (!idp) {
        throw new Error('認証されていません')
    }

    if (!VALID_FACE_ICONS.includes(faceIcon)) {
        throw new Error('無効な顔アイコンです')
    }

    await prisma.user.update({
        where: { id: idp.user.id },
        data: { faceIcon },
    })

    revalidatePath('/dashboard')
}
