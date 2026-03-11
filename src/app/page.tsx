'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { LPHero } from '@/components/lp/lpHero'
import { ErrorHunterDemo } from '@/components/lp/errorHunterDemo'
import { NullHandDemo } from '@/components/lp/nullHandDemo'
import { AnnoyingDinosaur } from '@/components/login/annoyingDinosaur'
import { lpPage } from './page.styles'
import { Typography } from '@/components/ui/typography'

const styles = lpPage()

const GAMES = [
    {
        id: 'error-hunter',
        number: '01',
        title: 'ERROR HUNTER',
        tags: ['REFLEX', 'CLICK BATTLE', 'SPEED'],
        tagColor: '#14b8a6',
        borderColor: '#14b8a6',
        description: 'エラーダイアログ出現と同時に連打開始――最も多くクリックした者が7ptを掴み取り、さらにリザルトで自分の煽りコメントを敗者に叩きつけろ！',
        comment: 'エラーつぶしてみ、とぶぞ。',
        Demo: ErrorHunterDemo,
    },
    {
        id: 'null-hand',
        number: '02',
        title: 'NULL HAND',
        tags: ['MIND', 'PSYCHOLOGY', 'BLUFF'],
        tagColor: '#ef4444',
        borderColor: '#ef4444',
        description: 'ホストが繰り出すのは「SYSTEM SELECTION」か、それともフェイクか――その一瞬を見抜いて勝利を掴め！下のデモでは開発者と対戦できるぞ。さあ挑戦してみよう…まあ、たぶん君が負けるけどね？',
        comment: 'ぼくのせんたく、あてられるかな？',
        Demo: NullHandDemo,
    },
]

export default function Home() {
    return (
        <main className={styles.main()}>
            <Suspense fallback={null}>
                <AnnoyingDinosaur />
            </Suspense>
            <div className={styles.contentWrapper()}>
                {/* ヒーロー */}
                <LPHero />

                {/* セクション区切り */}
                <div className={styles.sectionDivider()}>
                    <div className={styles.dividerRow()}>
                        <div className={styles.dividerLine()} />
                        <Typography variant="label" as="span" className={styles.dividerLabel()}>GAMES</Typography>
                        <div className={styles.dividerLine()} />
                    </div>
                    <Typography variant="small" as="p" className={styles.dividerSub()}>
                        各ゲームにはランキングがある。上を目指すもよし、友達と遊ぶもよし。
                    </Typography>
                </div>

                {/* ゲーム紹介 */}
                <section className={styles.gamesSection()}>
                    {GAMES.map((game) => (
                        <div
                            key={game.id}
                            className={styles.gameEntry()}
                            style={{ '--game-color': game.tagColor, '--game-border': game.borderColor } as React.CSSProperties}
                        >
                            {/* ゲーム番号バナー */}
                            <div className={styles.gameBanner()}>
                                <Typography variant="caption" as="span" font="rubik-puddles" className={styles.gameNumber()} style={{ color: game.tagColor }}>
                                    {game.number}
                                </Typography>
                                <div>
                                    <div className={styles.gameTags()}>
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
                                    <Typography
                                        variant="h2"
                                        font="rubik-puddles"
                                        className={styles.gameTitle()}
                                        style={{ color: game.tagColor, textShadow: `0 0 30px ${game.tagColor}60` }}
                                    >
                                        {game.title}
                                    </Typography>
                                </div>
                            </div>

                            {/* カード本体 */}
                            <div
                                className={styles.gameCard()}
                                style={{
                                    borderLeft: `3px solid ${game.borderColor}`,
                                    borderTop: '1px solid rgba(255,255,255,0.06)',
                                    borderRight: '1px solid rgba(255,255,255,0.06)',
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                }}
                            >
                                {/* カードヘッダー：説明 + 恐竜 */}
                                <div className={styles.gameCardHeader()}>
                                    <Typography variant="body" className={styles.gameDescription()}>
                                        {game.description}
                                    </Typography>
                                    <div
                                        className={styles.gameDeveloper()}
                                        style={{
                                            background: `${game.tagColor}0d`,
                                            border: `1px solid ${game.tagColor}30`,
                                        }}
                                    >
                                        <div className={styles.devAvatar()}>
                                            <Image
                                                src="/svg/charactor/developer.svg"
                                                alt=""
                                                fill
                                                className="object-contain"
                                            />
                                        </div>
                                        <Typography variant="body" font="cherry-bomb-one" className={styles.devComment()}>{game.comment}</Typography>
                                    </div>
                                </div>

                                {/* デモエリア */}
                                <div
                                    className={styles.gameDemoWrapper()}
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
                <section className={styles.ctaSection()}>
                    <div className={styles.ctaInner()}>
                        {/* 背景の淡いオーロラ */}
                        <div
                            className={styles.ctaAurora()}
                            style={{
                                background: 'radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)',
                                filter: 'blur(40px)',
                            }}
                        />

                        {/* 小さな星くずデコレーション */}
                        <div className="absolute top-0 left-8 w-1 h-1 rounded-full bg-brand-400/60 animate-pulse" />
                        <div className="absolute top-6 right-12 w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-pulse" style={{ animationDelay: '0.7s' }} />
                        <div className="absolute bottom-12 left-16 w-1 h-1 rounded-full bg-pink-400/50 animate-pulse" style={{ animationDelay: '1.3s' }} />

                        <Typography variant="label" as="p" className={styles.ctaReadyLabel()}>
                            ✦ ready to play ✦
                        </Typography>

                        <Typography variant="h2" className={styles.ctaHeading()}>
                            <span className={styles.ctaHeadingSpan()}>
                                ゲームでまってるぞ。
                            </span>
                        </Typography>

                        <Link href="/login" className={styles.ctaButton()}>
                            <span className={styles.ctaPulse()} />
                            ログインして始める
                            <svg className={styles.ctaArrow()} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>

                        <Typography variant="small" as="p" className={styles.ctaFreeLabel()}>
                            ✦ アカウント登録 無料 ✦
                        </Typography>

                        <Typography variant="caption" as="p" className={styles.ctaLegal()}>
                            <Link href="/terms" className={styles.ctaLegalLink()}>利用規約</Link>
                            {' '}·{' '}
                            <Link href="/privacy" className={styles.ctaLegalLink()}>プライバシーポリシー</Link>
                        </Typography>
                    </div>
                </section>

                {/* Footer */}
                <footer className={styles.footer()}>
                    <Typography variant="body" font="rubik-puddles" className={styles.footerTitle()}>Pukapuka Space</Typography>
                    <Typography variant="small" className={styles.footerSub()}>Music by Dream or real?</Typography>
                </footer>
            </div>
        </main>
    )
}
