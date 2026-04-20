"use client";

import { memo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { GLOW_COLORS, ORBIT_TRACKS, ORBIT_CENTER_Y_RATIO, RIPPLE_DURATION_MS } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorObject, RippleEffect } from "@/types";

// tilt の cos/sin はトラック定義が変わらない限り不変なので起動時に一度だけ計算
const TRACK_TRIG = ORBIT_TRACKS.map((t) => ({
	cos: Math.cos(t.tilt),
	sin: Math.sin(t.tilt),
}));

interface MeteorRendererProps {
	meteors: MeteorObject[];
	rippleEffects: RippleEffect[];
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
	if (!track || !trig) return { x: containerWidth / 2, y: containerHeight / 2, scale: 1, zIndex: 11 };
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
	// 星は z-10（zIndex:10）。奥(depth=-1)→0、星面(depth=0)→10、手前(depth=+1)→20
	// depth < 0 のとき zIndex < 10 → 星の裏に隠れる
	const zIndex = Math.round(depth * 10) + 10;
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

/** 球の発射間隔（秒）。小さくするほど連射が速い */
const DINO_BALL_INTERVAL = 0.2;
/** 球が飛ぶ時間（秒）。小さくするほど球が速い */
const DINO_BALL_DURATION = 1.2;
/** 継続的に見えるために必要な球数（duration / interval で自動計算） */
const DINO_BALL_COUNT = Math.ceil(DINO_BALL_DURATION / DINO_BALL_INTERVAL);
/** w-72 = 288px → 半径 144px（固定サイズ） */
const STAR_RADIUS_PX = 144;
const DINO_GAP = 4;
/** 恐竜の縦位置調整。containerHeight に対する比率（負の値で上に移動） */
const DINO_Y_OFFSET_RATIO = -0.028;
const BALL_TRAVEL_PX = 220;
/** 恐竜の球の照射角度のランダム幅（±度数）*/
const DINO_BALL_SPREAD_DEG = 10;
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
	// 各ボールのランダム角度オフセット（±2度、マウント時に1回生成）
	const ballAnglesRef = useRef<number[]>(
		Array.from({ length: DINO_BALL_COUNT }, () => (Math.random() * 2 - 1) * DINO_BALL_SPREAD_DEG * (Math.PI / 180))
	);
	useEffect(() => {
		setActiveBalls(1);
		const timers = Array.from({ length: DINO_BALL_COUNT - 1 }, (_, i) =>
			setTimeout(() => setActiveBalls(i + 2), DINO_BALL_INTERVAL * (i + 1) * 1000)
		);
		return () => timers.forEach(clearTimeout);
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
	const dinoY = starCY + dndy * (STAR_RADIUS_PX + DINO_GAP) + containerHeight * DINO_Y_OFFSET_RATIO;

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
	// 基準方向（spawn 方向の逆）
	const baseDx = -bnx;
	const baseDy = -bny;

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
			{Array.from({ length: activeBalls }, (_, i) => {
				const angleOffset = ballAnglesRef.current[i] ?? 0;
				const cos = Math.cos(angleOffset);
				const sin = Math.sin(angleOffset);
				const rotDx = baseDx * cos - baseDy * sin;
				const rotDy = baseDx * sin + baseDy * cos;
				const ballToX = mouthX + rotDx * BALL_TRAVEL_PX;
				const ballToY = mouthY + rotDy * BALL_TRAVEL_PX;
				return (
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
				);
			})}
		</>
	);
});

export const MeteorRenderer = memo(function MeteorRenderer({
	meteors,
	rippleEffects,
	containerWidth,
	containerHeight,
}: MeteorRendererProps) {
	if (containerWidth === 0) return null;

	return (
		<>
			<OrbitGuides containerWidth={containerWidth} containerHeight={containerHeight} />
			<DinoGuard containerWidth={containerWidth} containerHeight={containerHeight} />

			{/* 中ボス破壊波紋エフェクト */}
			{rippleEffects.map((ripple) => (
				<motion.div
					key={ripple.id}
					className="absolute pointer-events-none"
					style={{
						left: ripple.x - ripple.maxRxPx,
						top: ripple.y - ripple.maxRyPx,
						width: ripple.maxRxPx * 2,
						height: ripple.maxRyPx * 2,
						borderRadius: "50%",
						border: "2px solid rgba(34,197,94,0.9)",
						boxShadow: "0 0 16px rgba(34,197,94,0.7), 0 0 32px rgba(34,197,94,0.3)",
						transform: `rotate(${ripple.tilt * (180 / Math.PI)}deg)`,
						transformOrigin: "center",
						zIndex: 25,
					}}
					initial={{ scale: 0, opacity: 1 }}
					animate={{ scale: 1, opacity: 0 }}
					transition={{ duration: RIPPLE_DURATION_MS / 1000, ease: "easeOut" }}
				/>
			))}

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
				// ボスは 1.5 倍サイズ
				const sizePx = Math.max(4, Math.round(48 * scale * meteor.sizeFactor));

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
						{/* 本体（ボスはオーラなし） */}
						<div
							style={{
								width: sizePx,
								height: sizePx,
								position: "relative",
								filter: meteor.isBoss
									? undefined
									: `drop-shadow(0 0 ${Math.round(10 * scale)}px ${color}) drop-shadow(0 0 ${Math.round(20 * scale)}px ${color}66)`,
							}}
						>
							<Image
								src="/svg/object/metor.svg"
								alt=""
								fill
								className="object-contain"
							/>
						</div>

						{/* HP バー（ボスは緑・太め） */}
						<div
							className="absolute left-1/2 -translate-x-1/2"
							style={{ bottom: -6 - sizePx * 0.1, width: Math.max(24, sizePx * 0.8) }}
						>
							<div
								className="w-full bg-white/10 rounded-full overflow-hidden"
								style={{ height: meteor.isBoss ? 4 : 4 }}
							>
								<div
									className="h-full rounded-full transition-all duration-100"
									style={{
										width: `${hpRate * 100}%`,
										backgroundColor: meteor.isBoss ? "#22c55e" : color,
										boxShadow: meteor.isBoss ? "0 0 6px #22c55e88" : `0 0 4px ${color}`,
									}}
								/>
							</div>
						</div>
					</div>
				);
			})}
		</>
	);
});
