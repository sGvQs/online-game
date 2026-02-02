'use server'
import { prisma } from '@/backend/lib/prisma'
import { createClient } from '@/backend/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateName(newName: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error("認証されていません")

    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!idp) throw new Error("ユーザープロファイルが見つかりません")

    await prisma.user.update({
        where: { id: idp.userId },
        data: { name: newName }
    })

    revalidatePath('/dashboard')
}
