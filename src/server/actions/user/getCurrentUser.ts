'use server'

import { getAuthenticatedUserOrNull } from '../_helpers/getAuthenticatedUser'

/**
 * 現在ログイン中のユーザー情報を取得
 * SSRページで使用される
 * 
 * @returns { idp, user, supabaseUid } | null
 */
export async function getCurrentUser() {
    const idp = await getAuthenticatedUserOrNull()

    if (!idp) {
        return null
    }

    return {
        user: idp.user,
        supabaseUid: idp.supabaseUid,
    }
}
