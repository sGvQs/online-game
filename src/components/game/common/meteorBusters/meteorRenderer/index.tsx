"use client";

import { useRef } from "react";
import { GLOW_COLORS, ORBIT_RADIUS_X, ORBIT_RADIUS_Y } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorObject, BulletAnim } from "@/types";

interface MeteorRendererProps {
	meteors: MeteorObject[];
	bulletAnims: BulletAnim[];
	containerWidth: number;
	containerHeight: number;
}

function getMeteorScreenPos(
	angle: number,
	yOffset: number,
	containerWidth: number,
	containerHeight: number,
) {
	const cx = containerWidth / 2;
	const cy = containerHeight / 2;
	const rx = containerWidth * ORBIT_RADIUS_X;
	const ry = containerHeight * ORBIT_RADIUS_Y;
	const x = cx + rx * Math.cos(angle);
	const y = cy + ry * Math.sin(angle) + yOffset;
	const depth = Math.sin(angle); // -1(後) ～ +1(前)
	const scale = 0.35 + 0.65 * ((depth + 1) / 2);
	const zIndex = Math.round(depth * 10) + 20;
	const isVisible = depth > -0.7;
	return { x, y, scale, zIndex, isVisible };
}

export function MeteorRenderer({
	meteors,
	bulletAnims,
	containerWidth,
	containerHeight,
}: MeteorRendererProps) {
	if (containerWidth === 0) return null;

	const cx = containerWidth / 2;
	const cy = containerHeight / 2;

	return (
		<>
			{/* 軌道の視覚ガイド（薄い楕円） */}
			<div
				className="absolute pointer-events-none"
				style={{
					left: cx - containerWidth * ORBIT_RADIUS_X,
					top: cy - containerHeight * ORBIT_RADIUS_Y,
					width: containerWidth * ORBIT_RADIUS_X * 2,
					height: containerHeight * ORBIT_RADIUS_Y * 2,
					border: "1px solid rgba(129,140,248,0.1)",
					borderRadius: "50%",
				}}
			/>

			{/* 隕石 */}
			{meteors.map((meteor) => {
				const { x, y, scale, zIndex, isVisible } = getMeteorScreenPos(
					meteor.angle,
					meteor.yOffset,
					containerWidth,
					containerHeight,
				);
				if (!isVisible) return null;

				const color = GLOW_COLORS[meteor.type];
				const hpRate = meteor.hp / meteor.maxHp;

				return (
					<div
						key={meteor.id}
						className="absolute pointer-events-none"
						style={{
							left: x,
							top: y,
							transform: `translate(-50%, -50%) scale(${scale})`,
							zIndex,
						}}
					>
						{/* 隕石本体 */}
						<div
							className="relative"
							style={{
								width: 48,
								height: 48,
								filter: `drop-shadow(0 0 10px ${color}) drop-shadow(0 0 20px ${color}66)`,
							}}
						>
							{/* 隕石の形（石ころ風の多角形） */}
							<svg viewBox="0 0 48 48" width={48} height={48}>
								<polygon
									points="24,4 40,12 44,28 36,44 12,44 4,28 8,12"
									fill="#2a2a3a"
									stroke={color}
									strokeWidth="2"
								/>
								{/* ひび割れ模様 */}
								<line x1="24" y1="4" x2="20" y2="20" stroke={color} strokeWidth="0.5" opacity="0.4" />
								<line x1="40" y1="28" x2="26" y2="26" stroke={color} strokeWidth="0.5" opacity="0.4" />
							</svg>

							{/* HPバー */}
							<div
								className="absolute -bottom-4 left-1/2 -translate-x-1/2"
								style={{ width: 36 }}
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
					</div>
				);
			})}

			{/* 弾アニメーション */}
			{bulletAnims.map((anim) => {
				const targetMeteor = meteors.find((m) => m.id === anim.toMeteorId);
				if (!targetMeteor) return null;

				const target = getMeteorScreenPos(
					targetMeteor.angle,
					targetMeteor.yOffset,
					containerWidth,
					containerHeight,
				);
				const color = GLOW_COLORS[anim.type];

				const dx = target.x - anim.fromX;
				const dy = target.y - anim.fromY;
				const dist = Math.hypot(dx, dy);
				const angle = Math.atan2(dy, dx) * (180 / Math.PI);

				return (
					<div
						key={anim.id}
						className="absolute pointer-events-none"
						style={{
							left: anim.fromX,
							top: anim.fromY,
							width: dist,
							height: 2,
							transformOrigin: "0 50%",
							transform: `rotate(${angle}deg)`,
							zIndex: 50,
						}}
					>
						<div
							className="w-full h-full rounded-full animate-pulse"
							style={{
								background: `linear-gradient(to right, transparent, ${color})`,
								boxShadow: `0 0 4px ${color}`,
								opacity: 0.8,
							}}
						/>
					</div>
				);
			})}
		</>
	);
}
