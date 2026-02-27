'use client'

import Link from 'next/link'
import Image from 'next/image'
import { DashboardHeaderTitle } from '@/components/dashboard/DashboardHeaderTitle'

const RUBIK_PUDDLES_FONT = 'var(--font-rubik-puddles)'

export function LPHero() {
    return (
        <section className="relative z-10 flex flex-col items-center justify-center py-24 px-8 text-center">
            <DashboardHeaderTitle />
            <p
                className="mt-6 text-xl text-brand-700 dark:text-brand-200 font-light max-w-xl"
                style={{ fontFamily: 'var(--font-dot-gothic-16)' }}
            >
                虚空を体験せよ。銀河を征服せよ。
                <br />
                友達とオンラインでゲームを楽しもう。
            </p>
            <Link
                href="/login"
                className="mt-10 px-10 py-4 rounded-xl font-bold text-lg transition-all bg-brand-400 hover:bg-brand-500 text-white border-2 border-brand-500 shadow-lg hover:shadow-brand-500/30"
                style={{ fontFamily: RUBIK_PUDDLES_FONT }}
            >
                ログインして始める
            </Link>

            {/* 名もなき恐竜（ヒーロー内） */}
            <div className="mt-12 flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-200/30 bg-brand-100/30 backdrop-blur-sm">
                <div className="relative w-12 h-12 shrink-0">
                    <Image
                        src="/svg/charactor/annoying-dinosaur.svg"
                        alt=""
                        fill
                        className="object-contain"
                    />
                </div>
                <p
                    className="text-sm text-brand-800"
                    style={{ fontFamily: 'var(--font-cherry-bomb-one)' }}
                >
                    やぁ。ここで待ってたぞ。ゲームで会おうぜ。
                </p>
            </div>
        </section>
    )
}
