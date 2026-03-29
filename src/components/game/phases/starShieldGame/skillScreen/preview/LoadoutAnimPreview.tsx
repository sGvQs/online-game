"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import {
	TECHNIQUES,
	type TechniqueId,
} from "@/constants/starShieldGame/techniques";
import { ICONS } from "@/constants/starShieldGame/constants";
import {
	LEVEL_BULLET_COUNT,
	LEVEL_PINK_COUNT,
	PINK_CURVE_BULGE_FRACTION,
	PINK_CURVE_PEAK_T,
	PINK_ROCKET_SPREAD_HALF_DEG,
	LEVEL_SPREAD_DEG,
	LEVEL_PURPLE_SIZE,
	LEVEL_YELLOW_DAMAGE,
} from "@/constants/starShieldGame/gameConfig";

type PinkBezier = {
	p0: { x: number; y: number };
	p1: { x: number; y: number };
	p2: { x: number; y: number };
	t0: number;
	durationMs: number;
	/** t=1 での接線方向（正規化） */
	exitVx: number;
	exitVy: number;
};

type Bullet = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	color: string;
	alpha: number;
	radius: number;
	pinkBezier?: PinkBezier;
};


export function LoadoutAnimPreview({
	techniqueId,
	level,
}: {
	techniqueId: TechniqueId;
	level: number;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const tech = TECHNIQUES[techniqueId];

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctxOrNull = canvas.getContext("2d");
		if (!ctxOrNull) return;
		const c: CanvasRenderingContext2D = ctxOrNull;

		const lvl = Math.max(1, Math.min(5, level)) as 1 | 2 | 3 | 4 | 5;
		const bulletCount =
			techniqueId === "red"
				? LEVEL_BULLET_COUNT[lvl]
				: techniqueId === "pink"
					? LEVEL_PINK_COUNT[lvl]
					: 1;
		const spreadDeg = techniqueId === "red" ? LEVEL_SPREAD_DEG[lvl] : 0;
		const purpleRadius =
			techniqueId === "purple"
				? Math.min(3.5 * LEVEL_PURPLE_SIZE[lvl], 8)
				: 3.5;

		const DINO_X = 18;
		const H = canvas.height;
		const W = canvas.width;
		const ORIGIN_Y = H / 2 - 2;
		const FIRE_INTERVAL = 1400;

		const bullets: Bullet[] = [];
		let lastFire = -FIRE_INTERVAL;
		let animId: number;

		function fire(nowMs: number) {
			if (techniqueId === "pink") {
				const p0x = DINO_X + 18;
				const p0y = ORIGIN_Y;
				const p2x = W - 24;
				const p2y = ORIGIN_Y;
				let chordLen = Math.hypot(p2x - p0x, p2y - p0y);
				const ux =
					chordLen < 1e-6 ? 1 : (p2x - p0x) / chordLen;
				const uy =
					chordLen < 1e-6 ? 0 : (p2y - p0y) / chordLen;
				if (chordLen < 1e-6) chordLen = 1;
				const nx = -uy;
				const ny = ux;
				const spreadHalfRad =
					(PINK_ROCKET_SPREAD_HALF_DEG * Math.PI) / 180;
				const bMax =
					PINK_CURVE_BULGE_FRACTION > 0
						? chordLen *
							Math.tan(spreadHalfRad) *
							PINK_CURVE_BULGE_FRACTION
						: 0;
				const tPeak = PINK_CURVE_PEAK_T;
				const denom = Math.max(1e-9, 2 * (1 - tPeak) * tPeak);
				const durationMs = 1000;
				for (let i = 0; i < bulletCount; i++) {
					const s = bulletCount > 1 ? (2 * i) / (bulletCount - 1) - 1 : 0;
					const p1Off = (s * bMax) / denom;
					const p1 = {
						x: 0.5 * (p0x + p2x) + nx * p1Off,
						y: 0.5 * (p0y + p2y) + ny * p1Off,
					};
					const tgx = 2 * (p2x - p1.x);
					const tgy = 2 * (p2y - p1.y);
					const tgLen = Math.hypot(tgx, tgy);
					const exitVx = tgLen < 1e-9 ? ux : tgx / tgLen;
					const exitVy = tgLen < 1e-9 ? uy : tgy / tgLen;
					bullets.push({
						x: p0x,
						y: p0y,
						vx: 0,
						vy: 0,
						color: tech.color,
						alpha: 0.9,
						radius: 2.2,
						pinkBezier: {
							p0: { x: p0x, y: p0y },
							p1,
							p2: { x: p2x, y: p2y },
							t0: nowMs,
							durationMs,
							exitVx,
							exitVy,
						},
					});
				}
				return;
			}

			if (techniqueId === "yellow") {
				const count = 12;
				for (let i = 0; i < count; i++) {
					const delay = i * 40;
					setTimeout(() => {
						bullets.push({
							x: DINO_X + 18,
							y: ORIGIN_Y + (Math.random() - 0.5) * 3,
							vx: 4.4,
							vy: 0,
							color: tech.color,
							alpha: 0.9,
							radius: 1.8,
						});
					}, delay);
				}
				return;
			}

			const displayCount = Math.min(bulletCount, 18);

			if (displayCount === 1) {
				bullets.push({
					x: DINO_X + 18,
					y: ORIGIN_Y,
					vx: 3.8,
					vy: 0,
					color: tech.color,
					alpha: 1,
					radius: purpleRadius,
				});
			} else {
				for (let i = 0; i < displayCount; i++) {
					const angle = (i / (displayCount - 1) - 0.5) * spreadDeg;
					const rad = (angle * Math.PI) / 180;
					const speed = 3.4;
					bullets.push({
						x: DINO_X + 18,
						y: ORIGIN_Y,
						vx: Math.cos(rad) * speed,
						vy: Math.sin(rad) * speed,
						color: tech.color,
						alpha: 0.95,
						radius: 2.4,
					});
				}
			}
		}

		function draw(now: number) {
			c.clearRect(0, 0, W, H);

			if (now - lastFire >= FIRE_INTERVAL) {
				fire(now);
				lastFire = now;
			}

			if (techniqueId === "orange" && bullets.length >= 2) {
				c.save();
				c.strokeStyle = `${tech.color}44`;
				c.lineWidth = 0.8;
				for (let i = 0; i < Math.min(bullets.length - 1, 6); i++) {
					const b1 = bullets[i]!;
					const b2 = bullets[i + 1]!;
					if (Math.abs(b1.x - b2.x) < 50) {
						c.beginPath();
						c.moveTo(b1.x, b1.y);
						c.lineTo(b2.x, b2.y);
						c.stroke();
					}
				}
				c.restore();
			}

			for (let i = bullets.length - 1; i >= 0; i--) {
				const b = bullets[i]!;
				if (b.pinkBezier) {
					const pb = b.pinkBezier;
					const elapsed = now - pb.t0;
					if (elapsed <= pb.durationMs) {
						const te = Math.max(0, elapsed / pb.durationMs);
						const u = 1 - te;
						b.x =
							u * u * pb.p0.x +
							2 * u * te * pb.p1.x +
							te * te * pb.p2.x;
						b.y =
							u * u * pb.p0.y +
							2 * u * te * pb.p1.y +
							te * te * pb.p2.y;
					} else {
						const extra = elapsed - pb.durationMs;
						const speedPx = 0.45;
						b.x = pb.p2.x + pb.exitVx * speedPx * extra;
						b.y = pb.p2.y + pb.exitVy * speedPx * extra;
					}
				} else {
					b.x += b.vx;
					b.y += b.vy;
				}
				b.alpha -= techniqueId === "yellow" ? 0.028 : 0.015;

				if (b.alpha <= 0 || b.x > W + 12 || b.y < -12 || b.y > H + 12) {
					bullets.splice(i, 1);
					continue;
				}

				const alphaHex = Math.round(Math.max(0, b.alpha) * 255)
					.toString(16)
					.padStart(2, "0");

				c.save();
				c.shadowBlur = techniqueId === "purple" ? 16 : 8;
				c.shadowColor = b.color;
				c.beginPath();
				c.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
				c.fillStyle = b.color + alphaHex;
				c.fill();
				c.restore();

				if (techniqueId === "blue") {
					c.save();
					c.beginPath();
					c.arc(b.x - b.vx * 3.5, b.y, b.radius * 0.5, 0, Math.PI * 2);
					c.fillStyle =
						b.color +
						Math.round(b.alpha * 70)
							.toString(16)
							.padStart(2, "0");
					c.fill();
					c.restore();
				}
			}

			animId = requestAnimationFrame(draw);
		}

		animId = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(animId);
			bullets.length = 0;
		};
	}, [techniqueId, level]); // eslint-disable-line react-hooks/exhaustive-deps

	// suppress unused import warning
	void LEVEL_YELLOW_DAMAGE;

	return (
		<div className="relative mt-2 h-[88px] rounded-xl overflow-hidden border border-white/7 bg-black/35">
			<div className="absolute top-1/2 left-[38px] right-0 border-t border-dashed border-white/5 -translate-y-px" />
			<div className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 opacity-90 ptr-events-none">
				<Image src={ICONS.DINO} alt="Dino" width={24} height={24} />
			</div>
			<canvas
				ref={canvasRef}
				width={360}
				height={88}
				className="absolute inset-0 w-full h-full"
			/>
			<div className="absolute bottom-1.5 left-10 flex items-center gap-1.5">
				<span
					className="w-1.5 h-1.5 rounded-full shrink-0"
					style={{ backgroundColor: tech.color }}
				/>
				<span className="text-[9px] text-white font-dot-gothic-16">
					{tech.specialEffect ? tech.specialEffect.label: tech.label} Lv.{level}
				</span>
			</div>
		</div>
	);
}
