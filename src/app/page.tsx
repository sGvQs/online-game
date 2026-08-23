"use client";

import Link from "next/link";
import { Suspense } from "react";
import { LPHero } from "@/components/lp/lpHero";
import { AnnoyingDinosaur } from "@/components/login/annoyingDinosaur";
import { lpPage } from "./page.styles";
import { Typography } from "@/components/ui/typography";

const styles = lpPage();

export default function Home() {
	return (
		<main className={styles.main()}>
			<Suspense fallback={null}>
				<AnnoyingDinosaur />
			</Suspense>
			<div className={styles.contentWrapper()}>
				{/* ヒーロー */}
				<LPHero />

				{/* CTA */}
				<section className={styles.ctaSection()}>
					<div className={styles.ctaInner()}>
						{/* 背景の淡いオーロラ */}
						<div
							className={styles.ctaAurora()}
							style={{
								background:
									"radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)",
								filter: "blur(40px)",
							}}
						/>

						{/* 小さな星くずデコレーション */}
						<div className="absolute top-0 left-8 w-1 h-1 rounded-full bg-brand-400/60 animate-pulse" />
						<div
							className="absolute top-6 right-12 w-1.5 h-1.5 rounded-full bg-purple-400/50 animate-pulse"
							style={{ animationDelay: "0.7s" }}
						/>
						<div
							className="absolute bottom-12 left-16 w-1 h-1 rounded-full bg-pink-400/50 animate-pulse"
							style={{ animationDelay: "1.3s" }}
						/>

						<Typography
							variant="label"
							as="p"
							className={styles.ctaReadyLabel()}
						>
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
							<svg
								className={styles.ctaArrow()}
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								strokeWidth={2}
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</Link>

						<Typography
							variant="small"
							as="p"
							className={styles.ctaFreeLabel()}
						>
							✦ アカウント登録 無料 ✦
						</Typography>

						<Typography variant="caption" as="p" className={styles.ctaLegal()}>
							<Link href="/terms" className={styles.ctaLegalLink()}>
								利用規約
							</Link>{" "}
							·{" "}
							<Link href="/privacy" className={styles.ctaLegalLink()}>
								プライバシーポリシー
							</Link>
						</Typography>
					</div>
				</section>

				{/* Footer */}
				<footer className={styles.footer()}>
					<Typography
						variant="body"
						font="rubik-puddles"
						className={styles.footerTitle()}
					>
						Pukapuka Space
					</Typography>
					<Typography variant="small" className={styles.footerSub()}>
						Music by Dream or real?
					</Typography>
				</footer>
			</div>
		</main>
	);
}
