'use client'

import Link from 'next/link'
import { lpHero } from './lpHero.styles'
import { button } from '@/components/ui/button'
import { Typography } from '@/components/ui/typography'

const styles = lpHero()

export function LPHero() {
    return (
        <section className={styles.section()}>
            {/* スペックカード行 */}
            <div className={styles.specBadgesRow()}>
                {[
                    { icon: '🌐', title: 'オンライン対戦', sub: '友達と宇宙で遊ぶ' },
                    { icon: '🏆', title: 'ランキングあり', sub: '誰が一番強いか競え' },
                    { icon: '✦',  title: '完全無料',       sub: 'いつでも始められる' },
                ].map(({ icon, title, sub }) => (
                    <div key={title} className={styles.specBadge()}>
                        <span className="text-base leading-none">{icon}</span>
                        <div className="text-left">
                            <p className={styles.specBadgeTitle()}>{title}</p>
                            <p className={styles.specBadgeSub()}>{sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* メインタイトル */}
            <Typography variant="display" className={styles.titleBlock()}>
                <span className={styles.titleSpanWhite()}>Pukapuka</span>
                <span className={styles.titleSpanPurple()}>Space</span>
            </Typography>

            {/* キャッチコピー */}
            <p className={styles.catchCopy()}>
                さあ、宇宙の果てで
                <span className="text-brand-400 font-bold">誰かと</span>
                人生の大事な時間を
                <br />
                <span className="text-brand-500 font-bold">無駄にする</span>準備はできた？
            </p>

            {/* CTAボタン */}
            <Link href="/login" className={button({ variant: 'primary', size: 'xl', className: 'mt-10 gap-2.5 font-dot-gothic-16 tracking-wider' })}>
                <span className={styles.ctaPulse()} />
                ログインして始める
                <svg className={styles.ctaArrow()} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
            </Link>

            {/* スクロールインジケーター */}
            <div className={styles.scrollIndicator()}>
                <span className={styles.scrollLabel()}>SCROLL</span>
                <div className={styles.scrollBar()} />
            </div>
        </section>
    )
}
