"use client";

import Image from "next/image";
import { GLOW_COLORS, ORBIT_RADIUS_X, ORBIT_RADIUS_Y, ORBIT_TILT, ORBIT_CENTER_Y_RATIO } from "@/constants/meteorBustersGame/gameConfig";
import type { MeteorObject } from "@/types";

const COS_TILT = Math.cos(ORBIT_TILT);
const SIN_TILT = Math.sin(ORBIT_TILT);

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
	const cy = containerHeight * ORBIT_CENTER_Y_RATIO;
	const rx = containerWidth * ORBIT_RADIUS_X;
	const ry = containerWidth * ORBIT_RADIUS_Y; // 幅基準で扁平楕円
	// HOMEの星軌道と同じ傾き (-30°) を適用
	const xLocal = rx * Math.cos(angle);
	const yLocal = ry * Math.sin(angle);
	const x = cx + xLocal * COS_TILT - yLocal * SIN_TILT;
	const y = cy + xLocal * SIN_TILT + yLocal * COS_TILT + yOffset;
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
	const cy = containerHeight * ORBIT_CENTER_Y_RATIO;

	return (
		<>
			{/* 軌道ガイド楕円（HOMEと同じ -30° 傾き） */}
			<div
				className="absolute pointer-events-none"
				style={{
					left: cx - containerWidth * ORBIT_RADIUS_X,
					top: cy - containerWidth * ORBIT_RADIUS_Y,
					width: containerWidth * ORBIT_RADIUS_X * 2,
					height: containerWidth * ORBIT_RADIUS_Y * 2,
					border: "1px solid rgba(129,140,248,0.12)",
					borderRadius: "50%",
					transform: "rotate(-30deg)",
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
