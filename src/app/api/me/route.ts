import { getMe } from '@/server/actions'
import { NextResponse } from 'next/server'

export async function GET() {
    const result = await getMe()

    if (result.error === 'unauthorized') {
        return NextResponse.json({ user: null, auth: null }, { status: 401 })
    }

    if (result.error === 'not_found') {
        return NextResponse.json({ user: null, auth: result.auth }, { status: 404 })
    }

    if (result.error === 'internal') {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    return NextResponse.json({
        user: result.user,
        auth: result.auth
    })
}
