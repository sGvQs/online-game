"use client";

import { useCallback, useContext, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { SoundContext } from "@/lib/sound-context";
import { orbitBridge } from "@/components/home/orbitBridge";

const BALL_W = 6;           // 球の幅 (px)
const BALL_H = 22;          // 球の高さ (px) — 細長い形状
const BALL_DURATION = 0.45; // 飛行時間 (秒)

// 【当たり判定半径】カーソル位置と星の距離がこの値以内ならヒット (px)
// 小さくするほどシビアになる
const HIT_RADIUS = 40;

interface Ball {
	id: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	angle: number;
}

interface Collision {
	id: number;
	x: number;
	y: number;
}

let nextId = 0;

export function HomeCursor({ children }: { children: React.ReactNode }) {
	const sound = useContext(SoundContext);
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);
	const [balls, setBalls] = useState<Ball[]>([]);
	const [collisions, setCollisions] = useState<Collision[]>([]);
	const containerRef = useRef<HTMLDivElement>(null);
	const delayedClickRef = useRef(false);

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

	const handleClickCapture = useCallback(
		(e: React.MouseEvent) => {
			if (delayedClickRef.current) return; // 遅延再発火は素通り
			e.stopPropagation();

			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			const toX = e.clientX - rect.left;
			const toY = e.clientY - rect.top;
			const w = rect.width;
			const h = rect.height;

			// 弾を即座に生成
			const sources = [
				{ fromX: 0, fromY: h },  // 左下
				{ fromX: w, fromY: h },  // 右下
			];
			const newBalls: Ball[] = sources.map(({ fromX, fromY }) => ({
				id: nextId++,
				fromX,
				fromY,
				toX,
				toY,
				angle: Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI) + 90,
			}));
			setBalls((prev) => [...prev, ...newBalls]);

			// shooting SE は即時再生
			if (sound?.isPlaying) {
				const audio = new Audio("/se/shooting-se.mp3");
				audio.volume = 0.1;
				audio.play().catch(() => {});
			}

			// 着弾タイミングで orbit ヒット + ネイティブクリック再発火
			const target = e.target as HTMLElement;
			setTimeout(() => {
				const starX = orbitBridge.clientX - rect.left;
				const starY = orbitBridge.clientY - rect.top;
				const dist = Math.hypot(toX - starX, toY - starY);
				if (dist < HIT_RADIUS) {
					orbitBridge.triggerHit?.();
					// ヒット位置に collision.svg を一瞬表示
					const colId = nextId++;
					setCollisions((prev) => [...prev, { id: colId, x: toX, y: toY }]);
					setTimeout(() => {
						setCollisions((prev) => prev.filter((c) => c.id !== colId));
					}, 600);
				}

				delayedClickRef.current = true;
				target.click();
				delayedClickRef.current = false;
			}, BALL_DURATION * 1000);
		},
		[sound],
	);

	const removeBall = useCallback((id: number) => {
		setBalls((prev) => prev.filter((b) => b.id !== id));
	}, []);

	return (
		<div
			ref={containerRef}
			className="relative h-screen w-full cursor-none outline-none select-none"
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onClickCapture={handleClickCapture}
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

			{/* collision effects */}
			{collisions.map((c) => (
				<motion.div
					key={c.id}
					className="absolute top-0 left-0 w-16 h-16 pointer-events-none z-9999"
					style={{ x: c.x, y: c.y, translateX: "-50%", translateY: "-50%" }}
					initial={{ scale: 0.5, opacity: 1 }}
					animate={{ scale: 1.4, opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Image
						src="/svg/object/collision.svg"
						alt="collision"
						fill
						className="object-contain"
					/>
				</motion.div>
			))}

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
