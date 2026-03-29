"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useMotionValue } from "framer-motion";
import { SoundContext } from "@/lib/sound-context";
import { AMMO_MAX, HomeAmmoProvider } from "@/lib/home-ammo-context";
import { orbitBridge } from "@/components/home/orbitBridge";

const BALL_W = 6; // 球の幅 (px)
const BALL_H = 22; // 基準の高さ (px)
const BALL_RED_H = BALL_H * 5; // キーボード赤（従来の赤の5倍）
const BALL_LONG_H = BALL_H * 5; // クリック黄（赤と同じ倍率の細長い弾）
const BALL_DURATION = 0.45; // 飛行時間 (秒)

const DAMAGE_KEYBOARD = 1;
const DAMAGE_CLICK = 5;

// 【当たり判定半径】カーソル位置と星の距離がこの値以内ならヒット (px)
const HIT_RADIUS = 40;

interface Ball {
	id: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	angle: number;
	height: number;
	bulletClassName: string;
}

interface Collision {
	id: number;
	x: number;
	y: number;
}

let nextId = 0;

function isEditableFocusTarget(el: EventTarget | null): boolean {
	if (!(el instanceof HTMLElement)) return false;
	const tag = el.tagName;
	if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
	return el.isContentEditable;
}

const MODIFIER_ONLY_CODES = new Set([
	"ControlLeft",
	"ControlRight",
	"ShiftLeft",
	"ShiftRight",
	"AltLeft",
	"AltRight",
	"MetaLeft",
	"MetaRight",
]);

export function HomeCursor({ children }: { children: React.ReactNode }) {
	const sound = useContext(SoundContext);
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);
	const [balls, setBalls] = useState<Ball[]>([]);
	const [collisions, setCollisions] = useState<Collision[]>([]);
	const [ammo, setAmmo] = useState(AMMO_MAX);
	const ammoRef = useRef(AMMO_MAX);
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

	const fireToward = useCallback(
		(
			toX: number,
			toY: number,
			options?: {
				syntheticClickTarget?: HTMLElement;
				mode?: "keyboard" | "click";
			},
		): boolean => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return false;

			const w = rect.width;
			const h = rect.height;

			const inside = toX >= 0 && toY >= 0 && toX <= w && toY <= h;
			if (!inside) return false;

			const mode = options?.mode ?? "keyboard";
			const isClick = mode === "click";
			if (!isClick) {
				if (ammoRef.current <= 0) return false;
				ammoRef.current -= 1;
				setAmmo(ammoRef.current);
			}
			const damage = isClick ? DAMAGE_CLICK : DAMAGE_KEYBOARD;
			const ballHeight = isClick ? BALL_LONG_H : BALL_RED_H;
			const bulletClassName = isClick
				? "bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.55)]"
				: "bg-red-500";

			const sources = [
				{ fromX: 0, fromY: h },
				{ fromX: w, fromY: h },
			];
			const newBalls: Ball[] = sources.map(({ fromX, fromY }) => ({
				id: nextId++,
				fromX,
				fromY,
				toX,
				toY,
				angle: Math.atan2(toY - fromY, toX - fromX) * (180 / Math.PI) + 90,
				height: ballHeight,
				bulletClassName,
			}));
			setBalls((prev) => [...prev, ...newBalls]);

			if (sound?.isPlaying) {
				const audio = new Audio("/se/shooting-se.mp3");
				audio.volume = 0.1;
				audio.play().catch(() => {});
			}

			const target = options?.syntheticClickTarget;
			setTimeout(() => {
				const starX = orbitBridge.clientX - rect.left;
				const starY = orbitBridge.clientY - rect.top;
				const dist = Math.hypot(toX - starX, toY - starY);
				if (dist < HIT_RADIUS) {
					orbitBridge.triggerHit?.(damage);
					const colId = nextId++;
					setCollisions((prev) => [...prev, { id: colId, x: toX, y: toY }]);
					setTimeout(() => {
						setCollisions((prev) => prev.filter((c) => c.id !== colId));
					}, 600);
				}

				if (target) {
					delayedClickRef.current = true;
					target.click();
					delayedClickRef.current = false;
				}
			}, BALL_DURATION * 1000);
			return true;
		},
		[sound],
	);

	const handleClickCapture = useCallback(
		(e: React.MouseEvent) => {
			if (delayedClickRef.current) return;
			e.stopPropagation();

			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			const toX = e.clientX - rect.left;
			const toY = e.clientY - rect.top;
			fireToward(toX, toY, {
				syntheticClickTarget: e.target as HTMLElement,
				mode: "click",
			});
		},
		[fireToward],
	);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (isEditableFocusTarget(document.activeElement)) return;

			if (e.code === "Space" || e.key === " ") {
				if (e.repeat) return;
				e.preventDefault();
				ammoRef.current = AMMO_MAX;
				setAmmo(AMMO_MAX);
				return;
			}

			if (e.repeat) return;
			if (e.code === "Tab") return;
			if (MODIFIER_ONLY_CODES.has(e.code)) return;

			const toX = cursorX.get();
			const toY = cursorY.get();
			if (fireToward(toX, toY, { mode: "keyboard" })) {
				e.preventDefault();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [cursorX, cursorY, fireToward]);

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
			<HomeAmmoProvider ammo={ammo} ammoMax={AMMO_MAX}>
				{children}
			</HomeAmmoProvider>

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
					className={`absolute top-0 left-0 pointer-events-none z-9998 rounded-full ${b.bulletClassName}`}
					style={{
						width: BALL_W,
						height: b.height,
						rotate: b.angle,
					}}
					initial={{
						x: b.fromX - BALL_W / 2,
						y: b.fromY - b.height / 2,
						scale: 2.5,
					}}
					animate={{
						x: b.toX - BALL_W / 2,
						y: b.toY - b.height / 2,
						scale: 0,
					}}
					transition={{ duration: BALL_DURATION, ease: "linear" }}
					onAnimationComplete={() => removeBall(b.id)}
				/>
			))}
		</div>
	);
}
