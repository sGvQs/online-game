"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { playingPhase } from "./styles";
import { Typography } from "@/components/ui/typography";
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
	totalSpawnCount: number;
	difficulty: MeteorDifficulty;
	currentUserId: string;
	players: { userId: string; name?: string | null }[];
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
	totalSpawnCount,
	difficulty,
	currentUserId,
	players,
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

	const remaining = Math.max(0, totalSpawnCount - destroyedCount);

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
				players={players}
			/>

			{/* 中央上: のこり隕石数（スナックバーの下・チュートリアル以外） */}
			{difficulty !== "TUTORIAL" && (
				<div className={styles.remainingHud()}>
					<Typography variant="label" as="span" font="cherry-bomb-one" className={styles.remainingLabel()}>
						のこり
					</Typography>
					<div className="flex items-center gap-3">
						<div className="relative w-10 h-10">
							<Image src="/svg/object/metor.svg" alt="" fill className="object-contain" />
						</div>
						<span className="text-white/60 text-2xl">×</span>
						<motion.div
							key={remaining}
							initial={{ scale: 1 }}
							animate={{ scale: [1, 2, 1], x: [0, -3, 3, -3, 3, 0] }}
							transition={{ duration: 0.25, ease: "easeOut" }}
						>
							<Typography variant="h2" as="span" font="cherry-bomb-one" className={styles.remainingCount()}>
								{remaining}
							</Typography>
						</motion.div>
					</div>
				</div>
			)}

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
					totalSpawnCount={totalSpawnCount}
					onUnlockSpawn={onUnlockSpawn}
				/>
			)}
		</div>
	);
}
