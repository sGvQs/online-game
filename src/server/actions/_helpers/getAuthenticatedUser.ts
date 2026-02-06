import { prisma } from '@/server/lib/prisma'
import { createClient } from '@/server/lib/supabase/server'
import { User } from '@/shared/types'

/**
 * 認証済みユーザーを取得する内部ヘルパー
 * 各Server Actionで使用される共通ロジック
 * 
 * @throws Error 未認証または未登録の場合
 * @returns DBに登録されたUserオブジェクト
 */
export async function getAuthenticatedUser(): Promise<User> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('認証されていません')
    }

    const dbUser = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!dbUser) {
        throw new Error('ユーザーがデータベースに見つかりません')
    }

    return dbUser.user
}

/**
 * 認証済みユーザー情報を取得（nullを返す版）
 * ページで認証チェックに使用
 * 
 * @returns UserIDPWithUser | null
 */
export async function getAuthenticatedUserOrNull() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    return idp
}
