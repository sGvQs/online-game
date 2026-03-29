"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { ICONS } from "@/constants/starShieldGame/constants";
import {
	SPECIAL_ATTACK_LEVEL_PARAMS,
	type SpecialAttackLevel,
} from "@/constants/starShieldGame/skillConfig";
import type { SpecialAttackChoice } from "@/utils/starShieldGame";

type SpecBullet = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	alpha: number;
};

export function SpecialAttackLoadoutPreview({
	specialAttackId,
	level,
	bulletColor,
}: {
	specialAttackId: SpecialAttackChoice;
	level: number;
	bulletColor: string;
}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const lvl = Math.max(1, Math.min(10, level)) as SpecialAttackLevel;
	const params = SPECIAL_ATTACK_LEVEL_PARAMS[lvl];
	const { spreadDeg, waveCount, bulletsPerWave, waveDelayMs } = params;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;
		const c = ctx;

		const W = canvas.width;
		const H = canvas.height;
		const DINO_X = 18;
		const ORIGIN_Y = H / 2 - 2;
		const FIRE_INTERVAL = 1800;
		const SPEED = 3.4;
		const COLOR = bulletColor;

		const bullets: SpecBullet[] = [];
		let lastFire = -FIRE_INTERVAL;
		let animId: number;

		function spawnWave(_waveIndex: number) {
			const displayCount = Math.min(bulletsPerWave, 24);
			if (displayCount <= 1) {
				bullets.push({
					x: DINO_X + 18,
					y: ORIGIN_Y,
					vx: SPEED,
					vy: 0,
					alpha: 0.95,
				});
				return;
			}
			for (let i = 0; i < displayCount; i++) {
				const angle = (i / (displayCount - 1) - 0.5) * spreadDeg;
				const rad = (angle * Math.PI) / 180;
				bullets.push({
					x: DINO_X + 18,
					y: ORIGIN_Y,
					vx: Math.cos(rad) * SPEED,
					vy: Math.sin(rad) * SPEED,
					alpha: 0.95,
				});
			}
		}

		const timeouts: ReturnType<typeof setTimeout>[] = [];

		function fire() {
			if (waveCount <= 1) {
				spawnWave(0);
				return;
			}
			for (let w = 0; w < waveCount; w++) {
				timeouts.push(setTimeout(() => spawnWave(w), w * waveDelayMs));
			}
		}

		function draw(now: number) {
			c.clearRect(0, 0, W, H);
			if (now - lastFire >= FIRE_INTERVAL) {
				fire();
				lastFire = now;
			}
			for (let i = bullets.length - 1; i >= 0; i--) {
				const b = bullets[i]!;
				b.x += b.vx;
				b.y += b.vy;
				b.alpha -= 0.012;
				if (b.alpha <= 0 || b.x > W + 12 || b.y < -12 || b.y > H + 12) {
					bullets.splice(i, 1);
					continue;
				}
				const alphaHex = Math.round(Math.max(0, b.alpha) * 255)
					.toString(16)
					.padStart(2, "0");
				c.save();
				c.shadowBlur = 8;
				c.shadowColor = COLOR;
				c.beginPath();
				c.arc(b.x, b.y, 2.4, 0, Math.PI * 2);
				c.fillStyle = COLOR + alphaHex;
				c.fill();
				c.restore();
			}
			animId = requestAnimationFrame(draw);
		}
		animId = requestAnimationFrame(draw);
		return () => {
			cancelAnimationFrame(animId);
			timeouts.forEach((t) => clearTimeout(t));
			bullets.length = 0;
		};
	}, [
		specialAttackId,
		level,
		bulletColor,
		spreadDeg,
		waveCount,
		bulletsPerWave,
		waveDelayMs,
	]);

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
					className="w-1.5 h-1.5 rounded-full shrink-0 bg-(--bc) shadow-[0_0_6px_var(--bc-shadow)]"
					style={
						{
							"--bc": bulletColor,
							"--bc-shadow": `${bulletColor}99`,
						} as CSSProperties
					}
				/>
				<span className="text-[9px] text-white font-dot-gothic-16">
					必殺技 Lv.{level}
				</span>
			</div>
		</div>
	);
}
