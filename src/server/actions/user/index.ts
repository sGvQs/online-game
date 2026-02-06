'use server'

import { prisma } from '@/server/lib/prisma'
import { createClient } from '@/server/lib/supabase/server'

/**
 * ダッシュボード用ユーザー情報取得
 * ユーザー名表示のためにIDPとuserを返す
 */
export async function getDashboardUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!idp) {
        return null
    }

    return {
        email: user.email,
        user: idp.user,
    }
}

export async function updateName(newName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) throw new Error('認証されていません')

    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
    })

    if (!idp) throw new Error('ユーザーが見つかりません')

    await prisma.user.update({
        where: { id: idp.userId },
        data: { name: newName }
    })
}
