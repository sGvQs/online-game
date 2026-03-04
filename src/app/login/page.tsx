import { Suspense } from 'react'
import Link from 'next/link'
import AuthForm from '@/components/auth/authForm'
import { DashboardHeaderTitle } from '@/components/dashboard/dashboardHeaderTitle'
import { AnnoyingDinosaur } from '@/components/login/annoyingDinosaur'

const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'
const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'

export default function LoginPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
            {/* 戻るボタン（画面固定・左上） */}
            <Link
                href="/"
                className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-[11px] text-brand-700 hover:text-brand-500 transition-colors"
                style={{ fontFamily: DOT_GOTHIC_FONT }}
            >
                ← トップへ
            </Link>

            <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7">
                {/* ロゴ */}
                <DashboardHeaderTitle />

                {/* フレーバーテキスト */}
                <p
                    className="text-[11px] text-brand-700 tracking-widest text-center -mt-2"
                    style={{ fontFamily: DOT_GOTHIC_FONT }}
                >
                    ✦ ぷかぷか宇宙へ、ようこそ ✦
                </p>

                {/* ログインフォーム */}
                <AuthForm />

                {/* Music credit */}
                <p
                    className="text-[10px] font-black tracking-tight text-brand-900 flex items-center gap-1.5"
                    style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                >
                    <span>Music</span><span>by</span><span>Dream</span><span>or</span><span>real?</span>
                </p>
            </div>

            <Suspense fallback={null}>
                <AnnoyingDinosaur />
            </Suspense>
        </div>
    )
}
