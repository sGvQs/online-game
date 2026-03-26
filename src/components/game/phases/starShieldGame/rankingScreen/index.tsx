"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AuroraGlow } from "@/components/game/common/starShield/auroraGlow";
import { StarShieldTitle } from "@/components/game/common/starShield/starShieldTitle";
import { Typography } from "@/components/ui/typography";
import { button } from "@/components/ui/button/styles";
import type { PairRanking } from "@/server/actions/game/starShieldRankingActions";
import { rankingScreen } from "./styles";

const MEDALS = ["🥇", "🥈", "🥉"];

interface StarShieldRankingScreenProps {
	roomId: string;
	rankings: PairRanking[];
	memberUserIds: string[];
}

export function StarShieldRankingScreen({
	roomId,
	rankings,
	memberUserIds,
}: StarShieldRankingScreenProps) {
	const styles = rankingScreen();

	const isMemberPair = (r: PairRanking) =>
		memberUserIds.includes(r.user1Id) && memberUserIds.includes(r.user2Id);

	return (
		<div className={styles.container()}>
			<AuroraGlow width={600} height={300} opacity={0.2} blur={50} />

			<StarShieldTitle size="md" />

			<Typography variant="h2" font="cherry-bomb-one" className="text-white">
				こわしたかずランキング
			</Typography>

			<div className="w-full max-w-xl">
				{rankings.length === 0 ? (
					<p className={styles.emptyState()}>まだ記録がありません</p>
				) : (
					<ol className={styles.list()}>
						{rankings.map((r, i) => {
							const isMe = isMemberPair(r);
							return (
								<motion.li
									key={`${r.user1Id}-${r.user2Id}`}
									initial={{ opacity: 0, y: 20 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.4, delay: i * 0.08 }}
									className={isMe ? styles.myRankRow() : styles.rankRow()}
								>
									{r.rank <= 3 ? (
										<span className={styles.medalBadge()}>
											{MEDALS[r.rank - 1]}
										</span>
									) : (
										<span className={styles.rankNum()}>{r.rank}</span>
									)}
									<span className={isMe ? styles.myPairName() : styles.pairName()}>
										{r.user1Name} &amp; {r.user2Name}
									</span>
									{isMe && <span className={styles.myBadge()}>あなたたち</span>}
									<span className={styles.destroyedCount()}>
										{r.bestDestroyedCount}個
									</span>
								</motion.li>
							);
						})}
					</ol>
				)}
			</div>

			<Link
				href={`/game/${roomId}/star-shield`}
				className={button({ variant: "success", size: "lg" })}
			>
				<Typography variant="label" font="cherry-bomb-one" className="text-white">
					タイトルにもどる
				</Typography>
			</Link>
		</div>
	);
}
