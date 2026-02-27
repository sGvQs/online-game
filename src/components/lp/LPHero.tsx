'use client'

import Link from 'next/link'
import Image from 'next/image'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'
const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'

export function LPHero() {
    return (
        <section className="relative z-10 flex flex-col items-center justify-center pt-28 pb-20 px-8 text-center w-full max-w-5xl">
            {/* バッジ行 */}
            <div className="flex gap-3 mb-8 flex-wrap justify-center">
                {['ONLINE', 'MULTIPLAYER', 'FREE'].map((tag) => (
                    <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-[10px] font-bold tracking-[0.2em] border border-brand-500/60 text-brand-500 bg-brand-500/10"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            {/* メインタイトル */}
            <h1
                className="text-6xl md:text-8xl font-black tracking-tight leading-none mb-2"
                style={{ fontFamily: RUBIK_PUDDLES_FONT }}
            >
                <span
                    className="block"
                    style={{
                        background: 'linear-gradient(135deg, #ffffff 0%, #818cf8 50%, #a78bfa 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 30px rgba(129,140,248,0.5))',
                    }}
                >
                    Pukapuka
                </span>
                <span
                    className="block"
                    style={{
                        background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 60%, #f472b6 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        filter: 'drop-shadow(0 0 30px rgba(192,132,252,0.5))',
                    }}
                >
                    Space
                </span>
            </h1>

            {/* キャッチコピー */}
            <p
                className="mt-8 text-brand-700 text-base md:text-lg max-w-md leading-relaxed"
                style={{ fontFamily: DOT_GOTHIC_FONT }}
            >
                さあ、人生の大事な時間を
                <br />
                <span className="text-brand-500 font-bold">無駄にする</span>準備はできた？
            </p>

            {/* CTAボタン */}
            <div className="mt-10 relative">
                {/* グロー */}
                <div className="absolute inset-0 rounded-xl bg-brand-400/40 blur-xl animate-pulse-slow" />
                <Link
                    href="/login"
                    className="relative inline-flex items-center gap-3 px-12 py-5 rounded-xl font-bold text-lg transition-all text-white border-2 border-brand-400 hover:border-brand-300"
                    style={{
                        fontFamily: RUBIK_PUDDLES_FONT,
                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                        boxShadow: '0 0 30px rgba(99,102,241,0.4), 0 4px 20px rgba(0,0,0,0.3)',
                    }}
                >
                    <Image src="/icon.svg" alt="" width={22} height={22} className="shrink-0 invert" />
                    ログインして始める
                </Link>
            </div>

            {/* スクロールインジケーター */}
            <div className="mt-16 flex flex-col items-center gap-2 opacity-60 animate-bounce">
                <span className="text-[10px] tracking-[0.3em] text-brand-600" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                    SCROLL
                </span>
                <div className="w-px h-8 bg-linear-to-b from-brand-500/80 to-transparent" />
            </div>
        </section>
    )
}
