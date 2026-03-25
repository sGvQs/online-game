"use client";

import { motion } from "framer-motion";
import { Typography } from "@/components/ui/typography";
import { rankingList } from "./styles";

interface RankingEntry {
	userId: string;
	name: string;
	rank: number;
	points: number;
}

interface RankingListProps {
	rankings: RankingEntry[];
	currentUserId: string;
}

export function RankingList({ rankings, currentUserId }: RankingListProps) {
	const styles = rankingList();

	return (
		<section className={styles.wrapper()}>
			{rankings.length === 0 ? (
				<Typography variant="body" className={styles.empty()}>
					まだランキングデータがありません
				</Typography>
			) : (
				<ul className={styles.list()}>
					{rankings.map((r, i) => (
						<motion.li
							key={r.userId}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4, delay: i * 0.08 }}
							className={
								r.userId === currentUserId
									? styles.itemHighlight()
									: styles.item()
							}
						>
							<Typography variant="small" font="dot-gothic-16" className={styles.rank()}>
								{r.rank}位
							</Typography>
							<Typography variant="small" className={styles.name()}>
								{r.name}
							</Typography>
							<Typography variant="small" className={styles.points()}>
								{r.points}pt
							</Typography>
						</motion.li>
					))}
				</ul>
			)}
		</section>
	);
}
