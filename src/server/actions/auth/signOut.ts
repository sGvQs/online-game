'use server'

import { createClient } from '@/server/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * ログアウト処理
 */
export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}
