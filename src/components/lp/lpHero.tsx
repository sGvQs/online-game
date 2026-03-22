"use client";

import Link from "next/link";
import { lpHero } from "./lpHero.styles";
import { button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";

const styles = lpHero();

export function LPHero() {
	return (
		<section className={styles.section()}>
			{/* スペックカード行 */}
			<div className={styles.specBadgesRow()}>
				{[
					{ icon: "🌐", title: "オンライン対戦", sub: "友達と宇宙で遊ぶ" },
					{ icon: "🏆", title: "ランキングあり", sub: "誰が一番強いか競え" },
					{ icon: "✦", title: "完全無料", sub: "いつでも始められる" },
				].map(({ icon, title, sub }) => (
					<div key={title} className={styles.specBadge()}>
						<span className="text-base leading-none">{icon}</span>
						<div className="text-left">
							<Typography
								variant="label"
								as="p"
								className={styles.specBadgeTitle()}
							>
								{title}
							</Typography>
							<Typography
								variant="caption"
								as="p"
								className={styles.specBadgeSub()}
							>
								{sub}
							</Typography>
						</div>
					</div>
				))}
			</div>

			{/* メインタイトル */}
			<PukapukaLogo />

			{/* キャッチコピー */}
			<Typography variant="body" className={styles.catchCopy()}>
				さあ、宇宙の果てで
				<span className="text-brand-400 font-bold">誰かと</span>
				人生の大事な時間を
				<br />
				<span className="text-brand-500 font-bold">無駄にする</span>
				準備はできた？
			</Typography>

			{/* スクロールインジケーター */}
			<div className={styles.scrollIndicator()}>
				<span className={styles.scrollLabel()}>SCROLL</span>
				<div className={styles.scrollBar()} />
			</div>
		</section>
	);
}
