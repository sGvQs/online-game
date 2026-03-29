"use client";

import { useCallback, useContext, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { SoundContext } from "@/lib/sound-context";
import { orbitBridge } from "@/components/home/orbitBridge";

const BALL_W = 6;         // 球の幅 (px)
const BALL_H = 22;        // 球の高さ (px) — 細長い形状
const BALL_DURATION = 0.45; // 飛行時間 (秒)

interface Ball {
	id: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	angle: number; // 進行方向の回転角 (deg)
}

let nextId = 0;

/** 線分 (x1,y1)→(x2,y2) と点 (px,py) の最短距離と、線分上の最近点パラメータ t (0〜1) */
function linePointDist(
	x1: number, y1: number,
	x2: number, y2: number,
	px: number, py: number,
): { dist: number; t: number } {
	const dx = x2 - x1, dy = y2 - y1;
	const lenSq = dx * dx + dy * dy;
	if (lenSq === 0) return { dist: Math.hypot(px - x1, py - y1), t: 0 };
	const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / lenSq));
	return {
		dist: Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy)),
		t,
	};
}

export function HomeCursor({ children }: { children: React.ReactNode }) {
	const sound = useContext(SoundContext);
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);
	const [balls, setBalls] = useState<Ball[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	// 命中済み ball id を追跡して重複発火を防ぐ
	const hitIdsRef = useRef<Set<number>>(new Set());

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			cursorX.set(e.clientX - rect.left);
			cursorY.set(e.clientY - rect.top);
		},
		[cursorX, cursorY],
	);

	const handleMouseLeave = useCallback(() => {
		cursorX.set(-100);
		cursorY.set(-100);
	}, [cursorX, cursorY]);

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			const toX = e.clientX - rect.left;
			const toY = e.clientY - rect.top;
			const w = rect.width;
			const h = rect.height;

			// shooting SE
			if (sound?.isPlaying) {
				const audio = new Audio("/se/shooting-se.mp3");
				audio.volume = 0.1;
				audio.play().catch(() => {});
			}

			// 星の位置をコンテナ相対座標に変換
			const starX = orbitBridge.clientX - rect.left;
			const starY = orbitBridge.clientY - rect.top;

			const sources = [
				{ fromX: 0, fromY: h },   // 左下
				{ fromX: w, fromY: h },   // 右下
			];

			const newBalls: Ball[] = sources.map(({ fromX, fromY }) => {
				const id = nextId++;
				const angle =
					Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI) + 90;

				// 当たり判定: 軌道が星の近くを通るか
				const { dist, t } = linePointDist(fromX, fromY, toX, toY, starX, starY);
				if (dist < orbitBridge.hitRadius) {
					// 命中タイミングに合わせて発火 (t * duration ms 後)
					setTimeout(() => {
						if (hitIdsRef.current.has(id)) return; // 重複防止
						hitIdsRef.current.add(id);
						setBalls((prev) => prev.filter((b) => b.id !== id));
						orbitBridge.triggerHit?.();
					}, t * BALL_DURATION * 1000);
				}

				return { id, fromX, fromY, toX, toY, angle };
			});

			setBalls((prev) => [...prev, ...newBalls]);
		},
		[sound],
	);

	const removeBall = useCallback((id: number) => {
		hitIdsRef.current.delete(id);
		setBalls((prev) => prev.filter((b) => b.id !== id));
	}, []);

	return (
		<div
			ref={containerRef}
			className="relative h-screen w-full cursor-none"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onClick={handleClick}
		>
			{children}

			{/* target cursor */}
			<motion.div
				className="absolute top-0 left-0 w-12 h-12 pointer-events-none z-9999"
				style={{
					x: cursorX,
					y: cursorY,
					translateX: "-50%",
					translateY: "-50%",
				}}
			>
				<Image
					src="/svg/object/target-circle.svg"
					alt="cursor"
					fill
					className="object-contain"
				/>
			</motion.div>

			{/* bullets */}
			{balls.map((b) => (
				<motion.div
					key={b.id}
					className="absolute top-0 left-0 pointer-events-none z-9998 bg-red-500 rounded-full"
					style={{ width: BALL_W, height: BALL_H, rotate: b.angle }}
					initial={{ x: b.fromX - BALL_W / 2, y: b.fromY - BALL_H / 2, scale: 2.5 }}
					animate={{ x: b.toX - BALL_W / 2, y: b.toY - BALL_H / 2, scale: 0 }}
					transition={{ duration: BALL_DURATION, ease: "linear" }}
					onAnimationComplete={() => removeBall(b.id)}
				/>
			))}
		</div>
	);
}
