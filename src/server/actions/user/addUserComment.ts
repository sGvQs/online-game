'use server'

import { prisma } from '@/server/lib/prisma';
import { getAuthenticatedUserOrNull } from '../_helpers/getAuthenticatedUser'

/**
 * ゲーム終了後に呼び出す
 * 煽りコメント
 * 
 * @returns { comment } | null
 */
export async function getUserComment() {
    const idp = await getAuthenticatedUserOrNull()

    if (!idp) {
        return null
    }

    const user = idp.user;

    return user.comment;
}
