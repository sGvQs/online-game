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
        type TransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0]
        const result = await prisma.$transaction(async (tx: TransactionClient) => {
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
                // Star Shield 初期データ（syncUser で登録と同時に初期化）
                await tx.starShieldUserProgress.create({
                    data: { userId: newUser.id, totalTypingCount: 0 },
                })
                await tx.starShieldUserNormalAttack.create({
                    data: { userId: newUser.id, techniqueId: 'red', level: 1 },
                })
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

        return { success: true, isNew: true, user: result.user }

    } catch (err) {
        console.error('Error syncing user:', err)
        return { success: false, isNew: false, user: null, error: err }
    }
}
