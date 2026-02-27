'use client'

import Link from 'next/link'
import Image from 'next/image'
import { LPHero } from '@/components/lp/LPHero'
import { ErrorHunterDemo } from '@/components/lp/ErrorHunterDemo'
import { NullHandDemo } from '@/components/lp/NullHandDemo'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'

export default function Home() {
    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* 宇宙背景 */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,#1e1b4b_0%,#020617_60%)]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/15 blur-[120px] rounded-full animate-pulse-slow" />
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-80 animate-pulse" />
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-brand-400 rounded-full opacity-60" />
                <div className="absolute bottom-1/4 left-1/2 w-1.5 h-1.5 bg-white rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* ヒーロー */}
                <LPHero />

                {/* ゲーム紹介 */}
                <section className="w-full max-w-5xl px-8 py-16 space-y-20">
                    {/* Error Hunter */}
                    <div className="glass-card p-8 rounded-2xl border border-brand-200/20 relative">
                        <div className="flex flex-col gap-6 relative">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <h2
                                        className="text-3xl font-black text-brand-900 mb-4"
                                        style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                                    >
                                        ERROR HUNTER
                                    </h2>
                                    <p className="text-brand-700 dark:text-brand-200 mb-4 text-sm leading-relaxed">
                                        エラーダイアログが出現したら、最速でクリック！反射神経が試される、スリル満点のクリックバトル！
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-200/30 bg-brand-100/20 shrink-0">
                                    <div className="relative w-10 h-10">
                                        <Image
                                            src="/svg/charactor/annoying-dinosaur.svg"
                                            alt=""
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="text-xs text-brand-800" style={{ fontFamily: 'var(--font-cherry-bomb-one)' }}>
                                        エラー狩りは楽しいぞ。体験してみろ。
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl overflow-hidden border-2 border-brand-500/50">
                                <ErrorHunterDemo />
                            </div>
                        </div>
                    </div>

                    {/* Null Hand */}
                    <div className="glass-card p-8 rounded-2xl border border-brand-200/20">
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="flex-1">
                                    <h2
                                        className="text-3xl font-black text-brand-900 mb-4"
                                        style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                                    >
                                        NULL HAND
                                    </h2>
                                    <p className="text-brand-700 dark:text-brand-200 mb-4 text-sm leading-relaxed">
                                        ホストが選ぶREALかBLUFFか。ゲストはホストの心理を読んで勝負！名もなき恐竜が手を選んでいる様子を体験してみよう。
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-200/30 bg-brand-100/20 shrink-0">
                                    <div className="relative w-10 h-10">
                                        <Image
                                            src="/svg/charactor/annoying-dinosaur.svg"
                                            alt=""
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                    <p className="text-xs text-brand-800" style={{ fontFamily: 'var(--font-cherry-bomb-one)' }}>
                                        僕が選ぶ手、当てられるか？
                                    </p>
                                </div>
                            </div>
                            <div className="rounded-xl overflow-hidden border-2 border-brand-500/50">
                                <NullHandDemo />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-20 px-8">
                    <div className="glass-card p-10 rounded-2xl text-center max-w-xl border-t border-white/20">
                        <p className="text-brand-800 mb-6" style={{ fontFamily: 'var(--font-dot-gothic-16)' }}>
                            ゲームで待ってるぜ。
                        </p>
                        <Link
                            href="/login"
                            className="inline-block px-10 py-4 rounded-xl font-bold text-lg transition-all bg-brand-400 hover:bg-brand-500 text-white border-2 border-brand-500"
                            style={{ fontFamily: RUBIK_PUDDLES_FONT }}
                        >
                            ログインして始める
                        </Link>
                        <p className="mt-6 text-xs text-brand-600">
                            <Link href="/terms" className="underline hover:opacity-80">利用規約</Link>
                            {' '}・{' '}
                            <Link href="/privacy" className="underline hover:opacity-80">プライバシーポリシー</Link>
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-8 text-center text-sm text-brand-600">
                    <p style={{ fontFamily: RUBIK_PUDDLES_FONT }}>Pukapuka Space</p>
                    <p className="mt-1 text-xs opacity-70">Music by Dream or real?</p>
                </footer>
            </div>
        </main>
    )
}
