'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { LPHero } from '@/components/lp/LPHero'
import { ErrorHunterDemo } from '@/components/lp/ErrorHunterDemo'
import { NullHandDemo } from '@/components/lp/NullHandDemo'
import { AnnoyingDinosaur } from '@/components/login/AnnoyingDinosaur'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'
const DOT_GOTHIC_FONT = 'var(--font-dot-gothic-16)'
const CHERRY_BOMB_FONT = 'var(--font-cherry-bomb-one)'

const GAMES = [
    {
        id: 'error-hunter',
        number: '01',
        title: 'ERROR HUNTER',
        tags: ['REFLEX', 'CLICK BATTLE', 'SPEED'],
        tagColor: '#ef4444',
        borderColor: '#ef4444',
        description: 'エラーダイアログが出現したら、最速でクリック！反射神経が試される、スリル満点のクリックバトル！',
        comment: 'エラーつぶしてみ、とぶぞ。',
        Demo: ErrorHunterDemo,
    },
    {
        id: 'null-hand',
        number: '02',
        title: 'NULL HAND',
        tags: ['MIND', 'PSYCHOLOGY', 'BLUFF'],
        tagColor: '#818cf8',
        borderColor: '#818cf8',
        description: 'ホストが出す手はSYSTEM SELECTIONかそれ以外か。開発者の持ち手を見抜いて勝負しよう。下のデモで今すぐ試せるぞ！',
        comment: 'ぼくのせんたく、あてられるかな？',
        Demo: NullHandDemo,
    },
]

export default function Home() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            <Suspense fallback={null}>
                <AnnoyingDinosaur />
            </Suspense>
            <div className="relative z-10 flex flex-col items-center">
                {/* ヒーロー */}
                <LPHero />

                {/* セクション区切り */}
                <div className="w-full max-w-5xl px-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-brand-500/40 to-transparent" />
                        <span
                            className="text-[10px] tracking-[0.4em] text-brand-600 uppercase"
                            style={{ fontFamily: DOT_GOTHIC_FONT }}
                        >
                            GAMES
                        </span>
                        <div className="h-px flex-1 bg-linear-to-r from-transparent via-brand-500/40 to-transparent" />
                    </div>
                </div>

                {/* ゲーム紹介 */}
                <section className="w-full max-w-5xl px-8 py-8 space-y-24">
                    {GAMES.map((game) => (
                        <div key={game.id} className="group">
                            {/* ゲーム番号バナー */}
                            <div className="flex items-center gap-4 mb-6">
                                <span
                                    className="text-[80px] font-black leading-none select-none"
                                    style={{
                                        fontFamily: RUBIK_PUDDLES_FONT,
                                        color: game.tagColor,
                                    }}
                                >
                                    {game.number}
                                </span>
                                <div>
                                    <div className="flex gap-2 mb-2 flex-wrap">
                                        {game.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 rounded text-[9px] font-bold tracking-[0.15em] border"
                                                style={{
                                                    borderColor: `${game.tagColor}60`,
                                                    color: game.tagColor,
                                                    backgroundColor: `${game.tagColor}15`,
                                                }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                    <h2
                                        className="text-4xl font-black"
                                        style={{
                                            fontFamily: RUBIK_PUDDLES_FONT,
                                            color: game.tagColor,
                                            textShadow: `0 0 30px ${game.tagColor}60`,
                                        }}
                                    >
                                        {game.title}
                                    </h2>
                                </div>
                            </div>

                            {/* カード本体 */}
                            <div
                                className="glass-card rounded-2xl overflow-hidden transition-all duration-500"
                                style={{
                                    borderLeft: `3px solid ${game.borderColor}`,
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                {/* カードヘッダー：説明 + 恐竜 */}
                                <div className="flex flex-col md:flex-row gap-6 items-start p-8 pb-4">
                                    <p
                                        className="flex-1 text-brand-700 text-sm leading-relaxed"
                                        style={{ fontFamily: DOT_GOTHIC_FONT }}
                                    >
                                        {game.description}
                                    </p>
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 rounded-xl shrink-0"
                                        style={{
                                            background: `${game.tagColor}0d`,
                                            border: `1px solid ${game.tagColor}30`,
                                        }}
                                    >
                                        <div className="relative w-10 h-10">
                                            <Image
                                                src="/svg/charactor/developer.svg"
                                                alt=""
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <p className="text-xs text-brand-800" style={{ fontFamily: CHERRY_BOMB_FONT }}>
                                            {game.comment}
                                        </p>
                                    </div>
                                </div>

                                {/* デモエリア */}
                                <div
                                    className="mx-8 mb-8 rounded-xl overflow-hidden"
                                    style={{
                                        border: `2px solid ${game.borderColor}40`,
                                        boxShadow: `0 0 30px ${game.borderColor}20`,
                                    }}
                                >
                                    <game.Demo />
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* CTA */}
                <section className="py-24 px-8 w-full max-w-2xl">
                    <div className="relative text-center">
                        {/* 背景の淡いオーロラ */}
                        <div
                            className="absolute -inset-12 opacity-20 pointer-events-none"
                            style={{
                                background: 'radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                                filter: 'blur(40px)',
                            }}
                        />

                        {/* 小さな星くずデコレーション */}
                        <div className="absolute top-0 left-8 w-1 h-1 rounded-full bg-brand-400/60 animate-pulse" />
                        <div className="absolute top-6 right-12 w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-pulse" style={{ animationDelay: '0.7s' }} />
                        <div className="absolute bottom-12 left-16 w-1 h-1 rounded-full bg-pink-400/50 animate-pulse" style={{ animationDelay: '1.3s' }} />

                        <p
                            className="text-brand-600 text-[10px] tracking-[0.4em] uppercase mb-6"
                            style={{ fontFamily: DOT_GOTHIC_FONT }}
                        >
                            ✦ ready to play ✦
                        </p>

                        <h2
                            className="text-5xl md:text-6xl leading-snug mb-2"
                            style={{ fontFamily: CHERRY_BOMB_FONT }}
                        >
                            <span style={{
                                background: 'linear-gradient(135deg, #e0e7ff, #a5b4fc, #c084fc)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                            }}>
                                ゲームでまってるぜ。
                            </span>
                        </h2>


                        <Link
                            href="/login"
                            className="group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full text-sm font-semibold tracking-wider text-white transition-all duration-300 hover:scale-105"
                            style={{
                                fontFamily: DOT_GOTHIC_FONT,
                                background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(168,85,247,0.15))',
                                border: '1px solid rgba(129,140,248,0.4)',
                                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                            }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 24px rgba(129,140,248,0.25), inset 0 1px 0 rgba(255,255,255,0.08)'
                                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(129,140,248,0.7)'
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.08)'
                                ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(129,140,248,0.4)'
                            }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
                            ログインして始める
                            <svg className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>

                        <p className="mt-8 text-[11px] text-brand-700/60" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                            <Link href="/terms" className="hover:text-brand-500 transition-colors">利用規約</Link>
                            {' '}·{' '}
                            <Link href="/privacy" className="hover:text-brand-500 transition-colors">プライバシーポリシー</Link>
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="pb-12 text-center space-y-2">
                    <p
                        className="text-brand-500 font-bold tracking-widest"
                        style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                    >
                        Pukapuka Space
                    </p>
                    <p className="text-xs text-brand-700 opacity-60" style={{ fontFamily: DOT_GOTHIC_FONT }}>
                        Music by Dream or real?
                    </p>
                </footer>
            </div>
        </main>
    )
}
