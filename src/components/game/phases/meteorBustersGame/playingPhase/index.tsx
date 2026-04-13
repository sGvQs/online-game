"use client";

import { useRef, useEffect, useState } from "react";
import { playingPhase } from "./styles";
import { BulletHud } from "@/components/game/common/meteorBusters/bulletHud";
import { MeteorRenderer } from "@/components/game/common/meteorBusters/meteorRenderer";
import { PlayerCursors } from "@/components/game/common/meteorBusters/playerCursor";
import type {
	MeteorObject,
	PlayerCursorState,
	MeteorBulletType,
	MeteorDifficulty,
} from "@/types";
import type { BulletAnim } from "@/types";

interface PlayingPhaseProps {
	meteors: MeteorObject[];
	bulletType: MeteorBulletType;
	ammoRemaining: number;
	playerCursors: PlayerCursorState[];
	bulletAnims: BulletAnim[];
	destroyedCount: number;
	spawnedCount: number;
	totalSpawnCount: number;
	difficulty: MeteorDifficulty;
	currentUserId: string;
}

export function PlayingPhase({
	meteors,
	bulletType,
	ammoRemaining,
	playerCursors,
	bulletAnims,
	destroyedCount,
	spawnedCount,
	totalSpawnCount,
	difficulty,
	currentUserId,
}: PlayingPhaseProps) {
	const styles = playingPhase();
	const containerRef = useRef<HTMLDivElement>(null);
	const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		const obs = new ResizeObserver((entries) => {
			const entry = entries[0];
			if (entry) {
				setContainerSize({
					w: entry.contentRect.width,
					h: entry.contentRect.height,
				});
			}
		});
		obs.observe(el);
		return () => obs.disconnect();
	}, []);

	const destroyRate =
		spawnedCount > 0 ? Math.round((destroyedCount / spawnedCount) * 100) : 0;

	const progressBarColor =
		destroyRate >= 80
			? "bg-linear-to-r from-indigo-400 to-purple-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"
			: destroyRate >= 60
				? "bg-linear-to-r from-yellow-400 to-orange-400"
				: "bg-linear-to-r from-red-400 to-rose-500";

	return (
		<div ref={containerRef} className={styles.container()}>
			{/* 中央の星 */}
			<div className={styles.star()}>
				<div
					className="w-16 h-16 rounded-full"
					style={{
						background:
							"radial-gradient(circle at 35% 35%, rgb(255,255,230) 0%, rgb(255,220,160) 25%, rgb(220,160,80) 55%, rgb(160,80,20) 80%, rgb(102,51,0) 100%)",
						filter: "drop-shadow(0 0 50px rgba(180,150,90,0.5))",
						boxShadow:
							"0 0 20px rgba(255,200,100,0.4), 0 0 60px rgba(200,130,50,0.3), 0 0 120px rgba(150,80,20,0.2)",
					}}
				/>
			</div>

			{/* 隕石・弾アニメ */}
			<MeteorRenderer
				meteors={meteors}
				bulletAnims={bulletAnims}
				containerWidth={containerSize.w}
				containerHeight={containerSize.h}
			/>

			{/* 他プレイヤーカーソル */}
			<PlayerCursors
				cursors={playerCursors}
				currentUserId={currentUserId}
				players={[]}
			/>

			{/* 左上スコア */}
			<div className={styles.score()}>
				<p className={styles.scoreLabel()}>撃破率</p>
				<p className={styles.scoreValue()}>{destroyRate}%</p>
				<p className={styles.scoreProgress()}>
					{destroyedCount} / {spawnedCount} 撃破 (残り{" "}
					{totalSpawnCount - spawnedCount})
				</p>
				<div className={styles.progressBarWrap()}>
					<div
						className={`${styles.progressBarFill()} ${progressBarColor}`}
						style={{
							width: `${Math.min(100, (spawnedCount / totalSpawnCount) * 100)}%`,
						}}
					/>
				</div>
				<p className={styles.difficultyLabel()}>
					{difficulty === "EASY" ? "EASY" : difficulty === "NORMAL" ? "NORMAL" : "HARD"}
				</p>
			</div>

			{/* 右上 弾HUD */}
			<div className={styles.hud()}>
				<BulletHud bulletType={bulletType} ammoRemaining={ammoRemaining} />
				<div className="text-[10px] text-brand-500/40 font-dot-gothic-16 text-right space-y-0.5">
					<p>クリック: 弾切替</p>
					<p>スペース: リロード</p>
					<p>任意キー: 射撃</p>
				</div>
			</div>
		</div>
	);
}
