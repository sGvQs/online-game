'use server'

import { prisma } from '@/server/lib/prisma'
import { createClient } from '@/server/lib/supabase/server'

/**
 * API /me 用のユーザー情報取得
 * 認証ユーザーとDBユーザーの両方を返す
 */
export async function getMe() {
    const supabase = await createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error || !authUser) {
        return { user: null, auth: null, error: 'unauthorized' }
    }

    try {
        const idp = await prisma.userIDP.findUnique({
            where: { supabaseUid: authUser.id },
            include: { user: true }
        })

        if (!idp) {
            return { user: null, auth: authUser, error: 'not_found' }
        }

        return {
            user: idp.user,
            auth: authUser,
            error: null
        }
    } catch (err) {
        console.error('Error fetching current user:', err)
        return { user: null, auth: null, error: 'internal' }
    }
}
