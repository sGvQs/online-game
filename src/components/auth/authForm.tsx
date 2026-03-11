'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'
import { authForm } from './authForm.styles'
import { Button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'

const styles = authForm()

export default function AuthForm() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGoogleLogin = async () => {
        const supabase = await createClient()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
            },
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        }
    }

    return (
        <div className={styles.wrapper()}>
            {/* ヘッダー */}
            <div className={styles.header()}>
                <Typography variant="h3" className={styles.headerTitle()}>
                    ログインはここからよろしく。
                </Typography>
                <Typography variant="small" className={styles.headerSub()}>
                    Google アカウントで一発ログイン
                </Typography>
            </div>

            {/* セパレーター */}
            <div className={styles.separator()} />

            {/* エラー */}
            {error && (
                <div className={styles.errorBox()}>
                    <Typography variant="small">{error}</Typography>
                </div>
            )}

            {/* Googleボタン */}
            <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleGoogleLogin}
                disabled={loading}
            >
                {loading ? (
                    <span>Connecting...</span>
                ) : (
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        <Typography variant="small">Google でサインイン</Typography>
                    </div>
                )}
            </Button>

            {/* 利用規約 */}
            <Typography variant="caption" as="p" className={styles.legalText()}>
                <Link href="/terms" className={styles.legalLink()}>
                    利用規約
                </Link>
                {' '}と{' '}
                <Link href="/privacy" className={styles.legalLink()}>
                    プライバシーポリシー
                </Link>
                {'\n'}に同意の上、ご利用ください。
            </Typography>
        </div>
    )
}
