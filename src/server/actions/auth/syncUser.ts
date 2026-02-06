'use server'

import { prisma } from '@/server/lib/prisma'

interface SyncUserParams {
    supabaseUid: string
    email: string | undefined
    name: string
}

/**
 * 認証コールバック用ユーザー同期
 * 新規ユーザーの場合、UserとUserIDPを作成
 */
export async function syncUser({ supabaseUid, email, name }: SyncUserParams) {
    try {
        // IDPテーブルをチェック
        const existingIdp = await prisma.userIDP.findUnique({
            where: { supabaseUid },
            include: { user: true }
        })

        if (existingIdp) {
            // 既存ユーザー
            return { success: true, isNew: false, user: existingIdp.user }
        }

        // 新規ユーザー作成（トランザクション）
        const result = await prisma.$transaction(async (tx) => {
            // メールアドレスで既存ユーザーを検索（念のため）
            let userId: string

            const existingUser = email ? await tx.user.findUnique({ where: { email } }) : null

            if (existingUser) {
                userId = existingUser.id
            } else {
                const newUser = await tx.user.create({
                    data: {
                        email: email!,
                        name: name,
                    }
                })
                userId = newUser.id
            }

            const idp = await tx.userIDP.create({
                data: {
                    supabaseUid,
                    userId
                },
                include: { user: true }
            })

            return idp
        })

        console.log(`User synced: ${email}`)
        return { success: true, isNew: true, user: result.user }

    } catch (err) {
        console.error('Error syncing user:', err)
        return { success: false, isNew: false, user: null, error: err }
    }
}
