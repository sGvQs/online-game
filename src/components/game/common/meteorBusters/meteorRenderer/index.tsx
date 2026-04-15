"use client";

import { memo, useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GLOW_COLORS, ORBIT_TRACKS, ORBIT_CENTER_Y_RATIO } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorObject } from "@/types";

// tilt の cos/sin はトラック定義が変わらない限り不変なので起動時に一度だけ計算
const TRACK_TRIG = ORBIT_TRACKS.map((t) => ({
	cos: Math.cos(t.tilt),
	sin: Math.sin(t.tilt),
}));

interface MeteorRendererProps {
	meteors: MeteorObject[];
	containerWidth: number;
	containerHeight: number;
}

function getMeteorScreenPos(
	angle: number,
	yOffset: number,
	containerWidth: number,
	containerHeight: number,
	orbitTrack: number,
) {
	const track = ORBIT_TRACKS[orbitTrack];
	const trig = TRACK_TRIG[orbitTrack];
	if (!track || !trig) return { x: containerWidth / 2, y: containerHeight / 2, scale: 1, zIndex: 20 };
	const ocx = containerWidth / 2 + containerWidth * track.offsetX;
	const ocy = containerHeight * ORBIT_CENTER_Y_RATIO + containerHeight * track.offsetY;
	const rx = containerWidth * track.rx;
	const ry = containerWidth * track.ry;
	const xLocal = rx * Math.cos(angle);
	const yLocal = ry * Math.sin(angle);
	const x = ocx + xLocal * trig.cos - yLocal * trig.sin;
	const y = ocy + xLocal * trig.sin + yLocal * trig.cos + yOffset;
	const depth = Math.sin(angle);
	const scale = track.minScale + (track.maxScale - track.minScale) * ((depth + 1) / 2);
	// zIndex: 奥(depth=-1)→10、星(depth=0)→20、手前(depth=+1)→30 の自然な前後順
	const zIndex = Math.round(depth * 10) + 20;
	return { x, y, scale, zIndex };
}

// 軌道ガイド楕円は containerWidth/Height が変わらない限り再描画不要
const OrbitGuides = memo(function OrbitGuides({
	containerWidth,
	containerHeight,
}: {
	containerWidth: number;
	containerHeight: number;
}) {
	const cx = containerWidth / 2;
	const cy = containerHeight * ORBIT_CENTER_Y_RATIO;
	return (
		<>
			{ORBIT_TRACKS.map((track, i) => {
				const rx = containerWidth * track.rx;
				const ry = containerWidth * track.ry;
				const ocx = cx + containerWidth * track.offsetX;
				const ocy = cy + containerHeight * track.offsetY;
				const opacity = i === 3 ? 0.12 : i <= 2 ? 0.08 : 0.05;
				return (
					<div
						key={i}
						className="absolute pointer-events-none"
						style={{
							left: ocx - rx,
							top: ocy - ry,
							width: rx * 2,
							height: ry * 2,
							border: `1px solid rgba(129,140,248,${opacity})`,
							borderRadius: "50%",
							transform: `rotate(${track.tilt * (180 / Math.PI)}deg)`,
						}}
					/>
				);
			})}
		</>
	);
});

const DINO_BALL_COUNT = 3;
const DINO_BALL_INTERVAL = 0.5;
const DINO_BALL_DURATION = 1.2;
/** w-72 = 288px → 半径 144px（固定サイズ） */
const STAR_RADIUS_PX = 144;
const DINO_GAP = 4;
/** 恐竜の縦位置調整。負の値で上に移動（px） */
const DINO_Y_OFFSET = -18;
const BALL_TRAVEL_PX = 220;
// 恐竜ガード（星の表面に接する位置に1匹配置し、常時球を発射）
const DinoGuard = memo(function DinoGuard({
	containerWidth,
	containerHeight,
}: {
	containerWidth: number;
	containerHeight: number;
}) {
	// delay の代わりに時間差で DOM に追加することで初回の口への溜まりを防ぐ
	const [activeBalls, setActiveBalls] = useState(0);
	useEffect(() => {
		setActiveBalls(1);
		const t1 = setTimeout(() => setActiveBalls(2), DINO_BALL_INTERVAL * 1000);
		const t2 = setTimeout(() => setActiveBalls(3), DINO_BALL_INTERVAL * 2 * 1000);
		return () => { clearTimeout(t1); clearTimeout(t2); };
	}, []);

	const track = ORBIT_TRACKS[0];
	const trig = TRACK_TRIG[0];
	if (!track || !trig) return null;

	const collisionAngle = track.collisionAngles[0];
	if (collisionAngle === undefined) return null;

	const ocx = containerWidth / 2 + containerWidth * track.offsetX;
	const ocy = containerHeight * ORBIT_CENTER_Y_RATIO + containerHeight * track.offsetY;
	const rx = containerWidth * track.rx;
	const ry = containerWidth * track.ry;

	const cxLocal = rx * Math.cos(collisionAngle);
	const cyLocal = ry * Math.sin(collisionAngle);
	const collisionX = ocx + cxLocal * trig.cos - cyLocal * trig.sin;
	const collisionY = ocy + cxLocal * trig.sin + cyLocal * trig.cos;

	const starCX = containerWidth / 2;
	const starCY = containerHeight * ORBIT_CENTER_Y_RATIO;
	const dcx = collisionX - starCX;
	const dcy = collisionY - starCY;
	const dcLen = Math.hypot(dcx, dcy);
	const dndx = dcLen > 0 ? dcx / dcLen : 1;
	const dndy = dcLen > 0 ? dcy / dcLen : 0;
	const dinoX = starCX + dndx * (STAR_RADIUS_PX + DINO_GAP);
	const dinoY = starCY + dndy * (STAR_RADIUS_PX + DINO_GAP) + DINO_Y_OFFSET;

	const depth = Math.sin(collisionAngle);
	const scale = track.minScale + (track.maxScale - track.minScale) * ((depth + 1) / 2);
	const sizePx = Math.max(16, Math.round(40 * scale));
	const zIndex = Math.round(depth * 10) + 21;

	// デフォルト照準方向（spawn 方向）
	const sxLocal = rx * Math.cos(track.spawnAngle);
	const syLocal = ry * Math.sin(track.spawnAngle);
	const spawnX = ocx + sxLocal * trig.cos - syLocal * trig.sin;
	const spawnY = ocy + sxLocal * trig.sin + syLocal * trig.cos;
	const bdx = spawnX - dinoX;
	const bdy = spawnY - dinoY;
	const bLen = Math.hypot(bdx, bdy);
	const bnx = bLen > 0 ? bdx / bLen : 0;
	const bny = bLen > 0 ? bdy / bLen : -1;

	const mouthX = dinoX - bnx * sizePx * 0.45;
	const mouthY = dinoY - bny * sizePx * 0.45;
	const ballToX = mouthX - bnx * BALL_TRAVEL_PX;
	const ballToY = mouthY - bny * BALL_TRAVEL_PX;

	return (
		<>
			{/* 恐竜本体（左右反転して正面を外向きに） */}
			<div
				className="absolute top-0 left-0 pointer-events-none"
				style={{
					transform: `translate(${dinoX}px, ${dinoY}px) translate(-50%, -50%) scaleX(-1)`,
					zIndex,
					width: sizePx,
					height: sizePx,
				}}
			>
				<Image
					src="/svg/charactor/annoying-dinosaur.svg"
					alt=""
					fill
					className="object-contain"
				/>
			</div>

			{/* 常時ループする球（時間差で DOM 追加してスタッガー、溜まり防止） */}
			{Array.from({ length: activeBalls }, (_, i) => (
				<motion.div
					key={`dino-ball-${i}`}
					className="absolute top-0 left-0 rounded-full pointer-events-none"
					style={{
						width: 8,
						height: 8,
						background: "#ff4444",
						boxShadow: "0 0 8px #ff4444, 0 0 16px #ff444466",
						zIndex: 35,
					}}
					initial={{ x: mouthX, y: mouthY, translateX: "-50%", translateY: "-50%", opacity: 1, scale: 1 }}
					animate={{ x: ballToX, y: ballToY, opacity: 0, scale: 0.3 }}
					transition={{
						duration: DINO_BALL_DURATION,
						ease: "linear",
						repeat: Infinity,
					}}
				/>
			))}
		</>
	);
});

export function MeteorRenderer({
	meteors,
	containerWidth,
	containerHeight,
}: MeteorRendererProps) {
	if (containerWidth === 0) return null;

	return (
		<>
			<OrbitGuides containerWidth={containerWidth} containerHeight={containerHeight} />
			<DinoGuard containerWidth={containerWidth} containerHeight={containerHeight} />

			{/* 隕石 — left/top ではなく transform で移動（reflow 回避） */}
			{meteors.map((meteor) => {
				const { x, y, scale, zIndex } = getMeteorScreenPos(
					meteor.angle,
					meteor.yOffset,
					containerWidth,
					containerHeight,
					meteor.orbitTrack,
				);

				const color = GLOW_COLORS[meteor.type];
				const hpRate = meteor.hp / meteor.maxHp;
				const sizePx = Math.round(48 * scale);

				return (
					<div
						key={meteor.id}
						className="absolute top-0 left-0 pointer-events-none"
						style={{
							transform: `translate(${x}px, ${y}px) translate(-50%, -50%)`,
							zIndex,
							willChange: "transform",
						}}
					>
						{/* 本体 */}
						<div
							style={{
								width: sizePx,
								height: sizePx,
								position: "relative",
								filter: `drop-shadow(0 0 ${Math.round(10 * scale)}px ${color}) drop-shadow(0 0 ${Math.round(20 * scale)}px ${color}66)`,
							}}
						>
							<Image
								src="/svg/object/metor.svg"
								alt=""
								fill
								className="object-contain"
							/>
						</div>

						{/* HP バー */}
						<div
							className="absolute left-1/2 -translate-x-1/2"
							style={{ bottom: -6 - sizePx * 0.1, width: Math.max(24, sizePx * 0.8) }}
						>
							<div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
								<div
									className="h-full rounded-full transition-all duration-100"
									style={{
										width: `${hpRate * 100}%`,
										backgroundColor: color,
										boxShadow: `0 0 4px ${color}`,
									}}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
}
