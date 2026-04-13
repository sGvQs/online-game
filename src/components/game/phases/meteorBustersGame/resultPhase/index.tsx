"use client";

import { resultPhase } from "./styles";
import type { MeteorBustersResult } from "@/types";

interface ResultPhaseProps {
	result: MeteorBustersResult;
	isHost: boolean;
	onReturnToTitle: () => void;
}

export function ResultPhase({
	result,
	isHost,
	onReturnToTitle,
}: ResultPhaseProps) {
	const styles = resultPhase();
	const destroyRatePct = Math.round(result.destroyRate * 100);

	return (
		<div className={styles.container()}>
			<div
				className={`${styles.badge()} ${
					result.isCleared ? styles.badgeCleared() : styles.badgeFailed()
				}`}
			>
				{result.isCleared ? "CLEARED!" : "FAILED"}
			</div>

			<div className={styles.card()}>
				<div>
					<p className={styles.rateDisplay()}>{destroyRatePct}%</p>
					<p className={styles.rateLabel()}>撃破率</p>
				</div>

				<div className="space-y-2 border-t border-[rgba(129,140,248,0.15)] pt-4">
					<div className={styles.statsRow()}>
						<span className={styles.statsLabel()}>撃破数</span>
						<span className={styles.statsValue()}>{result.destroyedCount}</span>
					</div>
					<div className={styles.statsRow()}>
						<span className={styles.statsLabel()}>出現数</span>
						<span className={styles.statsValue()}>{result.spawnedCount}</span>
					</div>
					<div className={styles.statsRow()}>
						<span className={styles.statsLabel()}>クリアライン</span>
						<span className={styles.statsValue()}>80%</span>
					</div>
					{result.isCleared && (
						<div className={styles.statsRow()}>
							<span className={styles.statsLabel()}>獲得ポイント</span>
							<span className="text-brand-400">+pt</span>
						</div>
					)}
				</div>

				{isHost && (
					<button onClick={onReturnToTitle} className={styles.returnBtn()}>
						タイトルに戻る
					</button>
				)}
				{!isHost && (
					<p className="text-xs text-brand-500/40 mt-2 font-dot-gothic-16 tracking-wider">
						ホストがタイトルに戻るまでお待ちください
					</p>
				)}
			</div>
		</div>
	);
}
