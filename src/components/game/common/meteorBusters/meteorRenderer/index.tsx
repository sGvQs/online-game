"use client";

import Image from "next/image";
import { GLOW_COLORS, ORBIT_RADIUS_X, ORBIT_RADIUS_Y } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorObject } from "@/types";

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
) {
	const cx = containerWidth / 2;
	const cy = containerHeight / 2;
	const rx = containerWidth * ORBIT_RADIUS_X;
	const ry = containerHeight * ORBIT_RADIUS_Y;
	const x = cx + rx * Math.cos(angle);
	const y = cy + ry * Math.sin(angle) + yOffset;
	const depth = Math.sin(angle); // -1(奥) ～ +1(手前)
	const scale = 0.35 + 0.65 * ((depth + 1) / 2);
	const zIndex = Math.round(depth * 10) + 20;
	const isVisible = depth > -0.7;
	return { x, y, scale, zIndex, isVisible };
}

export function MeteorRenderer({
	meteors,
	containerWidth,
	containerHeight,
}: MeteorRendererProps) {
	if (containerWidth === 0) return null;

	const cx = containerWidth / 2;
	const cy = containerHeight / 2;

	return (
		<>
			{/* 軌道ガイド楕円 */}
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
				const sizePx = Math.round(48 * scale);

				return (
					<div
						key={meteor.id}
						className="absolute pointer-events-none"
						style={{
							left: x,
							top: y,
							transform: "translate(-50%, -50%)",
							zIndex,
						}}
					>
						{/* 本体 — HOME と同じ metor.svg */}
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
