import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user: authUser }, error } = await supabase.auth.getUser()

    if (error || !authUser) {
        return NextResponse.json({ user: null, auth: null }, { status: 401 })
    }

    try {
        const idp = await prisma.userIDP.findUnique({
            where: { supabaseUid: authUser.id },
            include: { user: true }
        })

        if (!idp) {
            // AuthUser exists but DB record missing (should verify via callback logic, but just in case)
            return NextResponse.json({ user: null, auth: authUser }, { status: 404 })
        }

        return NextResponse.json({
            user: idp.user,
            auth: authUser
        })

    } catch (err) {
        console.error('Error fetching current user:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
