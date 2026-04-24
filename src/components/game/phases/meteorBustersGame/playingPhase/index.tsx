"use client";

import { useRef, useEffect, useState } from "react";
import { playingPhase } from "./styles";
import { MeteorRenderer } from "@/components/game/common/meteorBusters/meteorRenderer";
import { PlayerCursors } from "@/components/game/common/meteorBusters/playerCursor";
import { ShooterBullets } from "@/components/game/common/shooter/ShooterBullets";
import { ShooterCursor } from "@/components/game/common/shooter/ShooterCursor";
import { ShooterCollisionFx } from "@/components/game/common/shooter/ShooterCollisionFx";
import { ShooterAmmoHud } from "@/components/game/common/shooter/ShooterAmmoHud";
import { GLOW_COLORS, ORBIT_CENTER_Y_RATIO } from "@/constants/meteorBustersGame/gameConfig";
import { SHOOTER_AMMO_MAX } from "@/lib/shooter/config";
import type {
	MeteorObject,
	PlayerCursorState,
	MeteorBulletType,
	MeteorDifficulty,
	BulletAnim,
} from "@/types";

const BULLET_ORDER: readonly MeteorBulletType[] = ["A", "B", "C"];
import type { CollisionFx } from "@/components/game/common/shooter/ShooterCollisionFx";
import { TutorialOverlay } from "./TutorialOverlay";

interface PlayingPhaseProps {
	meteors: MeteorObject[];
	bulletType: MeteorBulletType;
	ammoRemaining: number;
	playerCursors: PlayerCursorState[];
	bulletAnims: BulletAnim[];
	collisions: CollisionFx[];
	cursorX: number;
	cursorY: number;
	destroyedCount: number;
	spawnedCount: number;
	totalSpawnCount: number;
	difficulty: MeteorDifficulty;
	currentUserId: string;
	onUnlockSpawn: () => void;
}


export function PlayingPhase({
	meteors,
	bulletType,
	ammoRemaining,
	playerCursors,
	bulletAnims,
	collisions,
	cursorX,
	cursorY,
	destroyedCount,
	spawnedCount,
	totalSpawnCount,
	difficulty,
	currentUserId,
	onUnlockSpawn,
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

	const currentIdx = BULLET_ORDER.indexOf(bulletType);
	const nextBulletType = BULLET_ORDER[(currentIdx + 1) % BULLET_ORDER.length]!;
	const nextNextBulletType = BULLET_ORDER[(currentIdx + 2) % BULLET_ORDER.length]!;
	const nextColor = GLOW_COLORS[nextBulletType];
	const nextNextColor = GLOW_COLORS[nextNextBulletType];

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
			<div className={styles.star()} style={{ top: `${ORBIT_CENTER_Y_RATIO * 100}%` }}>
				<div
					className="w-72 h-72 rounded-full"
					style={{
						background:
							"radial-gradient(circle at 35% 35%, rgb(255,255,230) 0%, rgb(255,220,160) 25%, rgb(220,160,80) 55%, rgb(160,80,20) 80%, rgb(102,51,0) 100%)",
						filter: "drop-shadow(0 0 120px rgba(180,150,90,0.7))",
						boxShadow:
							"0 0 80px rgba(255,200,100,0.6), 0 0 180px rgba(200,130,50,0.4), 0 0 360px rgba(150,80,20,0.3)",
					}}
				/>
			</div>

			{/* 隕石レンダラー */}
			<MeteorRenderer
				meteors={meteors}
				containerWidth={containerSize.w}
				containerHeight={containerSize.h}
			/>

			{/* 弾ビーム（HOME 緊急モードと同一実装） */}
			<ShooterBullets bullets={bulletAnims} />

			{/* 衝突エフェクト */}
			<ShooterCollisionFx collisions={collisions} />

			{/* 照準カーソル */}
			<ShooterCursor x={cursorX} y={cursorY} visible={cursorX >= 0} />

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
					{difficulty}
				</p>
			</div>

			{/* 右下 弾数HUD（HOME と同じスタイル） */}
			<div className={styles.hud()}>
				<ShooterAmmoHud
					ammo={ammoRemaining}
					ammoMax={SHOOTER_AMMO_MAX}
					activeColor={GLOW_COLORS[bulletType]}
					nextColor={nextColor}
					nextNextColor={nextNextColor}
				/>
			</div>

			{/* チュートリアルオーバーレイ */}
			{difficulty === "TUTORIAL" && (
				<TutorialOverlay
					cursorX={cursorX}
					cursorY={cursorY}
					bulletAnims={bulletAnims}
					ammoRemaining={ammoRemaining}
					bulletType={bulletType}
					destroyedCount={destroyedCount}
					onUnlockSpawn={onUnlockSpawn}
				/>
			)}
		</div>
	);
}
