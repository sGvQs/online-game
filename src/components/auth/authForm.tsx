'use client'

import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useState } from 'react'

const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'
const CHERRY_BOMB_FONT = 'var(--font-cherry-bomb-one)'

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
        <div
            className="w-full rounded-2xl px-8 py-8 flex flex-col items-center gap-6"
            style={{
                background: 'rgba(129,140,248,0.05)',
                border: '1px solid rgba(129,140,248,0.18)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* ヘッダー */}
            <div className="text-center">
                <h3
                    className="text-xl text-white"
                    style={{ fontFamily: CHERRY_BOMB_FONT }}
                >
                    ログインはここからよろしく。
                </h3>
                <p className="mt-1.5 text-[10px] text-brand-700" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                    Google アカウントで一発ログイン
                </p>
            </div>

            {/* セパレーター */}
            <div className="w-full h-px bg-brand-500/10" />

            {/* エラー */}
            {error && (
                <div
                    className="w-full p-3 bg-red-900/40 text-red-300 border border-red-700/50 rounded-xl text-[11px]"
                    style={{ fontFamily: DOT_GOTHIC_FONT }}
                >
                    {error}
                </div>
            )}

            {/* Googleボタン */}
            <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full text-sm font-semibold tracking-wide text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:pointer-events-none"
                style={{
                    fontFamily: DOT_GOTHIC_FONT,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                    border: '1px solid rgba(129,140,248,0.4)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(129,140,248,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.08)'
                }}
            >
                {loading ? (
                    <span className="text-brand-400">Connecting...</span>
                ) : (
                    <>
                        <svg className="w-4 h-4 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.836.86-3.048.86-2.344 0-4.328-1.584-5.036-3.715H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                            <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.159 6.656 3.58 9 3.58z" fill="#EA4335" />
                        </svg>
                        <span>Google でサインイン</span>
                    </>
                )}
            </button>

            {/* 利用規約 */}
            <p
                className="text-[10px] text-center text-brand-700/60 leading-relaxed"
                style={{ fontFamily: DOT_GOTHIC_FONT }}
            >
                <Link href="/terms" className="hover:text-brand-500 transition-colors underline underline-offset-2">
                    利用規約
                </Link>
                {' '}と{' '}
                <Link href="/privacy" className="hover:text-brand-500 transition-colors underline underline-offset-2">
                    プライバシーポリシー
                </Link>
                {'\n'}に同意の上、ご利用ください。
            </p>
        </div>
    )
}
