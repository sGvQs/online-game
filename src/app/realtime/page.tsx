import { createClient } from '@/backend/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/backend/lib/prisma'
import UserProfile from '@/frontend/components/UserProfile'

export default async function RealtimePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/')

    // Fetch from DB
    const idp = await prisma.userIDP.findUnique({
        where: { supabaseUid: user.id },
        include: { user: true }
    })

    if (!idp) return <div>User not found in DB</div>

    // ここでリアルタイム通信を購読する
    supabase
        .channel('user')
        .on(
            'postgres_changes',
            {
                event: '*',
                schema: 'public',
            },
            () => { }
        )
        .subscribe()

    return (
        <div className="min-h-screen p-8 bg-brand-100 text-brand-900">
            <h1 className="text-3xl font-bold mb-4">Realtime Verification</h1>
            <p className="mb-4">Logged in as: {user.email}</p>

            <UserProfile initialData={idp.user} />
        </div>
    )
}
