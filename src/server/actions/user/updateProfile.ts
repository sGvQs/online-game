'use server'

import { prisma } from '@/server/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthenticatedUser } from '../_helpers/getAuthenticatedUser'
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

export async function updateProfile(data: {
    name: string
    faceIcon: FaceIcon
    comment: string
}) {
    const user = await getAuthenticatedUser()

    if (data.name.length > 10) {
        throw new Error('名前は10文字以内で入力してください')
    }
    if (!VALID_FACE_ICONS.includes(data.faceIcon)) {
        throw new Error('無効な顔アイコンです')
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            name: data.name.trim().slice(0, 10),
            faceIcon: data.faceIcon,
            comment: data.comment,
        },
    })

    revalidatePath('/dashboard')
}
