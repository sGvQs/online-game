'use server'

import { prisma } from '@/server/lib/prisma';
import { getAuthenticatedUserOrNull } from '../_helpers/getAuthenticatedUser'
import { revalidatePath } from 'next/cache'

/**
 * 煽りコメントをセーブ
 * ゲーム終了後に勝ったら他のユーザーに見せる
 * 
 */
export async function setUserComment(comment: string) {
    const idp = await getAuthenticatedUserOrNull()

    if (!idp) {
        throw new Error('認証されていません')
    }

    const user = idp.user;

    await prisma.user.update({
        where : {
            id: user.id
        },
        data: {
            comment: comment,
        }
    })

    // ダッシュボードページを再検証
    revalidatePath('/dashboard')
}

/**
 * ユーザーIDを指定して煽りコメントを取得
 * ゲーム終了後に勝者のコメントを表示するために使用
 */
export async function getUserComment(userId: string): Promise<string | null> {
    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/51a86e01-5e84-4d64-b43c-4026ff9aa48c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getUserComment.ts:38',message:'getUserComment called',data:{userId,prismaExists:!!prisma,prismaUserExists:!!prisma?.user,findUniqueExists:!!prisma?.user?.findUnique},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
    // #endregion

    try {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/51a86e01-5e84-4d64-b43c-4026ff9aa48c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getUserComment.ts:42',message:'Before prisma.user.findUnique',data:{userId,prismaType:typeof prisma,prismaUserType:typeof prisma?.user},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion

        const user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            select: {
                comment: true
            }
        })

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/51a86e01-5e84-4d64-b43c-4026ff9aa48c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getUserComment.ts:52',message:'After prisma.user.findUnique',data:{userExists:!!user,comment:user?.comment},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C'})}).catch(()=>{});
        // #endregion

        return user?.comment || null
    } catch (error) {
        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/51a86e01-5e84-4d64-b43c-4026ff9aa48c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'getUserComment.ts:58',message:'Error in getUserComment',data:{errorMessage:error instanceof Error?error.message:String(error),errorStack:error instanceof Error?error.stack:undefined,userId},timestamp:Date.now(),runId:'run1',hypothesisId:'A,B,C,D'})}).catch(()=>{});
        // #endregion
        throw error
    }
}
