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
        description: 'ホストが選ぶREALかBLUFFか。ゲストはホストの心理を読んで勝負！名もなき恐竜が手を選んでいる様子を体験してみよう。',
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
                <section className="py-24 px-8 w-full max-w-3xl">
                    <div className="relative rounded-3xl overflow-hidden">
                        {/* 背景グロー */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'radial-gradient(ellipse at 50% 0%, rgba(129,140,248,0.5) 0%, transparent 70%)',
                            }}
                        />
                        <div
                            className="glass-card relative p-12 text-center rounded-3xl"
                            style={{
                                border: '1px solid rgba(129,140,248,0.3)',
                                boxShadow: '0 0 60px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
                            }}
                        >
                            {/* コーナーデコレーション */}
                            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-brand-500/50 rounded-tl-md" />
                            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-brand-500/50 rounded-tr-md" />
                            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-brand-500/50 rounded-bl-md" />
                            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-brand-500/50 rounded-br-md" />

                            <p
                                className="text-brand-600 text-xs tracking-[0.3em] uppercase mb-4"
                                style={{ fontFamily: DOT_GOTHIC_FONT }}
                            >
                                READY TO PLAY?
                            </p>
                            <h2
                                className="text-5xl md:text-6xl font-black mb-4"
                                style={{
                                    fontFamily: RUBIK_PUDDLES_FONT,
                                    background: 'linear-gradient(135deg, #ffffff, #818cf8)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                ゲームで
                            </h2>
                            <h2
                                className="text-5xl md:text-6xl font-black mb-8"
                                style={{
                                    fontFamily: RUBIK_PUDDLES_FONT,
                                    background: 'linear-gradient(135deg, #818cf8, #c084fc)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    backgroundClip: 'text',
                                }}
                            >
                                待ってるぜ。
                            </h2>

                            <div className="relative inline-block">
                                <div
                                    className="absolute inset-0 rounded-xl animate-pulse-slow"
                                    style={{ background: 'rgba(99,102,241,0.4)', filter: 'blur(12px)' }}
                                />
                                <Link
                                    href="/login"
                                    className="relative inline-flex items-center gap-3 px-12 py-5 rounded-xl font-bold text-lg text-white border-2 border-brand-400 hover:border-brand-300 transition-all hover:scale-105"
                                    style={{
                                        fontFamily: RUBIK_PUDDLES_FONT,
                                        background: 'linear-gradient(135deg, #6366f1, #818cf8)',
                                        boxShadow: '0 0 30px rgba(99,102,241,0.4)',
                                    }}
                                >
                                    ログインして始める
                                </Link>
                            </div>

                            <p className="mt-8 text-xs text-brand-600">
                                <Link href="/terms" className="underline hover:opacity-80 transition-opacity">利用規約</Link>
                                {' '}・{' '}
                                <Link href="/privacy" className="underline hover:opacity-80 transition-opacity">プライバシーポリシー</Link>
                            </p>
                        </div>
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
