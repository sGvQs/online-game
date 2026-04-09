"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useAnimationControls, useMotionValue } from "framer-motion";
import { SoundContext } from "@/lib/sound-context";
import { effectiveSeVolume } from "@/lib/sound-volume";
import { AMMO_MAX, HomeAmmoProvider } from "@/lib/home-ammo-context";
import {
	HOME_SHOOTER_MODES,
	HOME_SHOOTER_SE,
	type HomeShooterModeKey,
} from "@/lib/home-shooter-config";
import {
	HomeModalOpenProvider,
	useHomeModalOpen,
} from "@/lib/home-modal-context";
import {
	orbitBridge,
	type OrbitScreenShakeStrength,
} from "@/components/home/orbitBridge";
import { HOME_ORBIT_SCREEN_SHAKE } from "@/lib/home-orbit-screen-shake";

/** 隕石（z-30〜40）より手前。下部 HUD（z-[60]）より下にして UI を隠さない */
const HOME_BULLET_Z = "z-[45]";
const HOME_CURSOR_AND_FX_Z = "z-[46]";

interface Ball {
	id: number;
	fromX: number;
	fromY: number;
	toX: number;
	toY: number;
	angle: number;
	widthPx: number;
	height: number;
	bulletClassName: string;
	durationSec: number;
	ease: "linear";
	initialScale: number;
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
	return (
		<HomeModalOpenProvider>
			<HomeCursorInner>{children}</HomeCursorInner>
		</HomeModalOpenProvider>
	);
}

function HomeCursorInner({ children }: { children: React.ReactNode }) {
	const { isModalOpen } = useHomeModalOpen();
	const sound = useContext(SoundContext);
	const cursorX = useMotionValue(-100);
	const cursorY = useMotionValue(-100);
	const [balls, setBalls] = useState<Ball[]>([]);
	const [collisions, setCollisions] = useState<Collision[]>([]);
	const [ammo, setAmmo] = useState(AMMO_MAX);
	const ammoRef = useRef(AMMO_MAX);
	const containerRef = useRef<HTMLDivElement>(null);
	const delayedClickRef = useRef(false);
	const screenShake = useAnimationControls();

	useEffect(() => {
		const prev = document.body.style.overflow;
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = prev;
		};
	}, []);

	useEffect(() => {
		orbitBridge.onScreenShake = (
			strength: OrbitScreenShakeStrength = "large",
		) => {
			const preset = HOME_ORBIT_SCREEN_SHAKE[strength];
			void screenShake
				.start({
					x: [...preset.x],
					y: [...preset.y],
					transition: { duration: preset.durationSec, ease: "easeOut" },
				})
				.then(() => screenShake.set({ x: 0, y: 0 }));
		};
		return () => {
			orbitBridge.onScreenShake = null;
		};
	}, [screenShake]);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent) => {
			if (isModalOpen) return;
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			cursorX.set(e.clientX - rect.left);
			cursorY.set(e.clientY - rect.top);
		},
		[cursorX, cursorY, isModalOpen],
	);

	const handleMouseLeave = useCallback(() => {
		if (isModalOpen) return;
		cursorX.set(-100);
		cursorY.set(-100);
	}, [cursorX, cursorY, isModalOpen]);

	const fireToward = useCallback(
		(
			toX: number,
			toY: number,
			options?: {
				syntheticClickTarget?: HTMLElement;
				mode?: HomeShooterModeKey;
			},
		): boolean => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return false;

			const w = rect.width;
			const h = rect.height;

			const inside = toX >= 0 && toY >= 0 && toX <= w && toY <= h;
			if (!inside) return false;

			const modeKey: HomeShooterModeKey = options?.mode ?? "keyboard";
			const cfg = HOME_SHOOTER_MODES[modeKey];

			if (cfg.ammo.consumes) {
				const cost = cfg.ammo.cost;
				if (ammoRef.current < cost) {
					if (sound?.isPlaying) {
						const audio = new Audio(HOME_SHOOTER_SE.cannotShoot);
						audio.volume = effectiveSeVolume(0.12, sound.volume);
						audio.play().catch(() => {});
					}
					return false;
				}
				ammoRef.current -= cost;
				setAmmo(ammoRef.current);
			}

			const { damage, durationSec, ball, bulletClassName } = cfg;

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
				widthPx: ball.widthPx,
				height: ball.heightPx,
				bulletClassName,
				durationSec,
				ease: ball.ease,
				initialScale: ball.initialScale,
			}));
			setBalls((prev) => [...prev, ...newBalls]);

			if (sound?.isPlaying) {
				const audio = new Audio(HOME_SHOOTER_SE.shoot);
				audio.volume = effectiveSeVolume(0.1, sound.volume);
				audio.play().catch(() => {});
			}

			const target = options?.syntheticClickTarget;
			setTimeout(() => {
				const clientHitX = rect.left + toX;
				const clientHitY = rect.top + toY;
				const bulletR = Math.max(ball.widthPx, ball.heightPx) * 0.35;

				const hitMeteor = orbitBridge.tryHitMeteor?.(
					clientHitX,
					clientHitY,
					bulletR,
				);
				if (hitMeteor) {
					const colId = nextId++;
					setCollisions((prev) => [...prev, { id: colId, x: toX, y: toY }]);
					setTimeout(() => {
						setCollisions((prev) => prev.filter((c) => c.id !== colId));
					}, 600);
				} else if (!orbitBridge.isMeteorPhase) {
					const starX = orbitBridge.clientX - rect.left;
					const starY = orbitBridge.clientY - rect.top;
					const dist = Math.hypot(toX - starX, toY - starY);
					if (dist < orbitBridge.hitRadius) {
						orbitBridge.triggerHit?.(damage);
						const colId = nextId++;
						setCollisions((prev) => [...prev, { id: colId, x: toX, y: toY }]);
						setTimeout(() => {
							setCollisions((prev) => prev.filter((c) => c.id !== colId));
						}, 600);
					}
				}

				if (target) {
					delayedClickRef.current = true;
					target.click();
					delayedClickRef.current = false;
				}
			}, durationSec * 1000);
			return true;
		},
		[sound],
	);

	const handleClickCapture = useCallback(
		(e: React.MouseEvent) => {
			if (isModalOpen) return;
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
		[fireToward, isModalOpen],
	);

	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			if (isModalOpen) return;
			if (isEditableFocusTarget(document.activeElement)) return;

			if (e.code === "Space" || e.key === " ") {
				if (e.repeat) return;
				e.preventDefault();
				ammoRef.current = AMMO_MAX;
				setAmmo(AMMO_MAX);
				if (sound?.isPlaying) {
					const audio = new Audio(HOME_SHOOTER_SE.reload);
					audio.volume = effectiveSeVolume(0.12, sound.volume);
					audio.play().catch(() => {});
				}
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
	}, [cursorX, cursorY, fireToward, isModalOpen, sound]);

	const removeBall = useCallback((id: number) => {
		setBalls((prev) => prev.filter((b) => b.id !== id));
	}, []);

	return (
		<motion.div
			ref={containerRef}
			className={`relative h-screen w-full overflow-hidden outline-none select-none ${isModalOpen ? "cursor-auto" : "cursor-none"}`}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			onClickCapture={handleClickCapture}
			animate={screenShake}
		>
			<HomeAmmoProvider ammo={ammo} ammoMax={AMMO_MAX}>
				{children}
			</HomeAmmoProvider>

			{/* target cursor */}
			{!isModalOpen && (
				<motion.div
					className={`absolute top-0 left-0 w-12 h-12 pointer-events-none ${HOME_CURSOR_AND_FX_Z}`}
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
			)}

			{/* collision effects */}
			{collisions.map((c) => (
				<motion.div
					key={c.id}
					className={`absolute top-0 left-0 w-16 h-16 pointer-events-none ${HOME_CURSOR_AND_FX_Z}`}
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
					className={`absolute top-0 left-0 pointer-events-none ${HOME_BULLET_Z} rounded-full ${b.bulletClassName}`}
					style={{
						width: b.widthPx,
						height: b.height,
						rotate: b.angle,
					}}
					initial={{
						x: b.fromX - b.widthPx / 2,
						y: b.fromY - b.height / 2,
						scale: b.initialScale,
					}}
					animate={{
						x: b.toX - b.widthPx / 2,
						y: b.toY - b.height / 2,
						scale: 0,
					}}
					transition={{ duration: b.durationSec, ease: b.ease }}
					onAnimationComplete={() => removeBall(b.id)}
				/>
			))}
		</motion.div>
	);
}
