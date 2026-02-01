import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const url = new URL(request.url)
    const code = searchParams.get('code') || url.searchParams.get('code')

    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/realtime'

    if (code) {
        const supabase = await createClient()
        const { error, data } = await supabase.auth.exchangeCodeForSession(code)

        if (!error && data?.user) {
            // ユーザー同期ロジック (Prisma)
            const supabaseUid = data.user.id
            const email = data.user.email
            const name = data.user.user_metadata.full_name || data.user.user_metadata.name || email?.split('@')[0] || 'Unknown'

            try {
                // IDPテーブルをチェック
                const existingIdp = await prisma.userIDP.findUnique({
                    where: { supabaseUid },
                    include: { user: true }
                })

                if (!existingIdp) {
                    // 新規ユーザー作成
                    // トランザクションで User と UserIDP を同時に作成
                    await prisma.$transaction(async (tx) => {
                        // メールアドレスで既存ユーザーを検索 (念のため)
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

                        await tx.userIDP.create({
                            data: {
                                supabaseUid,
                                userId
                            }
                        })
                    })
                    console.log(`User synced: ${email}`)
                }
            } catch (err) {
                console.error('Error syncing user:', err)
                // エラーがあってもセッションは有効なのでリダイレクトは許可するが、
                // アプリケーション側でユーザーデータが見つからない可能性がある。
                // ここではログ出力のみに留める。
            }

            const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
            const isLocalEnv = process.env.NODE_ENV === 'development'
            if (isLocalEnv) {
                // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
