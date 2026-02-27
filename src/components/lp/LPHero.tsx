'use client'

import Link from 'next/link'

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
            <Link
                href="/login"
                className="mt-10 group relative inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider text-white transition-all duration-300 hover:scale-105"
                style={{
                    fontFamily: DOT_GOTHIC_FONT,
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                    border: '1px solid rgba(129,140,248,0.4)',
                    boxShadow: '0 0 0 0 rgba(129,140,248,0), inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
                onMouseEnter={e => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 24px rgba(129,140,248,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(129,140,248,0.7)'
                }}
                onMouseLeave={e => {
                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 0 0 rgba(129,140,248,0), inset 0 1px 0 rgba(255,255,255,0.08)'
                    ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(129,140,248,0.4)'
                }}
            >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                ログインして始める
                <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </Link>

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
