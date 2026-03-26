"use client";

import { useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Asteroid, Bullet } from "@/types/starShieldGame";
import { getAsteroidPosition, getBulletPosition } from "@/utils/starShieldGame";
import { shooterView } from "./styles";
import {
	BULLET_RADIUS,
	DINO_X,
	DINO_Y,
} from "@/constants/starShieldGame/gameConfig";
import {
	DEFAULT_BULLET_COLOR,
	TECHNIQUES,
} from "@/constants/starShieldGame/techniques";
import { ProtectedStar } from "../protectedStar";
import { ICONS } from "@/constants/starShieldGame/constants";
import { StarHpBar } from "../typistView/StarHpBar";

interface ShooterViewProps {
	asteroids: Asteroid[];
	bullets: Bullet[];
	aimRef: React.RefObject<{ x: number; y: number }>;
	onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
	maxHp: number;
	contactExplosion: { x: number; y: number; asteroidId: string } | null;
	onContactExplosionComplete: () => void;
	chainHits?: {
		primaryPos: { x: number; y: number };
		targets: { pos: { x: number; y: number }; asteroidId: string }[];
		color: string;
	} | null;
	onChainHitsComplete?: () => void;
}

function AsteroidCircle({
	asteroid,
	maxHp,
}: {
	asteroid: Asteroid;
	maxHp: number;
}) {
	const divRef = useRef<HTMLDivElement>(null);
	const update = useCallback(() => {
		if (!divRef.current) return;
		const pos = getAsteroidPosition(asteroid, Date.now());
		divRef.current.style.left = `${pos.x * 100}%`;
		divRef.current.style.top = `${pos.y * 100}%`;
	}, [asteroid]);
	useEffect(() => {
		let rafId: number;
		const loop = () => {
			update();
			rafId = requestAnimationFrame(loop);
		};
		rafId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafId);
	}, [update]);
	const destroyed = !!asteroid.destroyedAt;
	const isBoss = !!asteroid.isBoss;

	if (isBoss) {
		return (
			<motion.div
				ref={divRef}
				className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
				animate={
					destroyed ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }
				}
				initial={{ scale: 0.3, opacity: 0 }}
				transition={
					destroyed
						? { duration: 0.5, ease: "easeOut" }
						: { duration: 0.8, ease: "easeOut" }
				}
			>
				<div className="absolute inset-0 rounded-full bg-purple-600/40 blur-xl scale-150 animate-pulse" />
				<div className="relative w-36 h-36">
					<Image
						src={ICONS.METOR}
						alt="巨大隕石"
						fill
						className="object-contain drop-shadow-[0_0_24px_rgba(192,132,252,0.8)]"
						style={{ filter: "hue-rotate(260deg) saturate(2) brightness(0.7)" }}
					/>
				</div>
			</motion.div>
		);
	}

	return (
		<motion.div
			ref={divRef}
			className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
			animate={destroyed ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
			initial={{ scale: 0.5, opacity: 0 }}
			transition={
				destroyed
					? { duration: 0.25, ease: "easeOut" }
					: { duration: 0.3, ease: "easeOut" }
			}
		>
			<div
				className="absolute -top-4 left-1/2 -translate-x-1/2 h-1.5 rounded-full bg-stone-600/80 overflow-hidden shrink-0"
				style={{
					width: `${Math.max(1.5, Math.min(10, 1.5 + ((maxHp - 3) * 4) / 97))}rem`,
				}}
			>
				<div
					className={shooterView().asteroidHpBar()}
					style={{
						["--asteroid-hp-pct" as string]: `${Math.max(0, (asteroid.hp / maxHp) * 100)}%`,
					}}
				/>
			</div>
			<div className="absolute inset-0 rounded-full bg-orange-400/30 blur-md scale-150" />
			<div className="relative w-12 h-12">
				<Image
					src={ICONS.METOR}
					alt="隕石"
					fill
					className="object-contain drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
				/>
			</div>
		</motion.div>
	);
}

function BulletCircle({ bullet }: { bullet: Bullet }) {
	const divRef = useRef<HTMLDivElement>(null);
	const update = useCallback(() => {
		if (!divRef.current) return;
		const pos = getBulletPosition(bullet, Date.now());
		divRef.current.style.left = `${pos.x * 100}%`;
		divRef.current.style.top = `${pos.y * 100}%`;
	}, [bullet]);
	useEffect(() => {
		let rafId: number;
		const loop = () => {
			update();
			rafId = requestAnimationFrame(loop);
		};
		rafId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafId);
	}, [update]);
	const bulletRadius = bullet.radius ?? BULLET_RADIUS;
	const sizePx = Math.max(8, bulletRadius * 400);
	const bulletColor =
		bullet.technique && bullet.technique in TECHNIQUES
			? TECHNIQUES[bullet.technique as keyof typeof TECHNIQUES].color
			: DEFAULT_BULLET_COLOR;
	const styles = shooterView();
	return (
		<div
			ref={divRef}
			className={styles.bulletCircle()}
			style={{
				["--bullet-size" as string]: `${sizePx}px`,
				["--bullet-color" as string]: bulletColor,
			}}
		>
			<div className={styles.bulletInner()} />
		</div>
	);
}

const CHAIN_PROJECTILE_DURATION = 0.22;

function ChainProjectile({
	from,
	to,
	color,
}: {
	from: { x: number; y: number };
	to: { x: number; y: number };
	color: string;
}) {
	const styles = shooterView();
	return (
		<motion.div
			className={styles.chainProjectile()}
			style={{ ["--chain-color" as string]: color }}
			initial={{
				left: `${from.x * 100}%`,
				top: `${from.y * 100}%`,
				opacity: 1,
			}}
			animate={{
				left: `${to.x * 100}%`,
				top: `${to.y * 100}%`,
				opacity: 0.3,
			}}
			transition={{ duration: CHAIN_PROJECTILE_DURATION, ease: "easeOut" }}
		/>
	);
}

function ChainHitsEffect({
	chainHits,
	onComplete,
}: {
	chainHits: {
		primaryPos: { x: number; y: number };
		targets: { pos: { x: number; y: number }; asteroidId: string }[];
		color: string;
	};
	onComplete: () => void;
}) {
	useEffect(() => {
		const t = setTimeout(onComplete, CHAIN_PROJECTILE_DURATION * 1000 + 50);
		return () => clearTimeout(t);
	}, [onComplete]);

	return (
		<>
			{chainHits.targets.map((t, i) => (
				<ChainProjectile
					key={`${t.asteroidId}-${i}`}
					from={chainHits.primaryPos}
					to={t.pos}
					color={chainHits.color}
				/>
			))}
		</>
	);
}

const FIRE_SCALE_KEYFRAMES = [
	0.2,
	1,
	1.6,
	1.8,
	2,
	1.8,
	2,
	1.8,
	2.2,
	2,
	2,
	1.8,
	2.2,
	2,
	2,
	1.8,
	2.2,
	2,
	3, // 2倍サイズ
];
const FIRE_SCALE_TIMES: number[] = [
	...[
		0, 0.07, 0.14, 0.21, 0.28, 0.35, 0.42, 0.53, 0.64, 0.75, 0.81, 0.86, 0.92,
		0.97,
	].map((t) => t * 0.75),
	0.75,
	0.75,
	0.75,
	0.75,
	1,
];
const FIRE_OPACITY_KEYFRAMES = [
	1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
];
const CONTACT_EXPLOSION_DURATION = 1;

function ContactExplosionEffect({
	pos,
	onComplete,
}: {
	pos: { x: number; y: number };
	onComplete: () => void;
}) {
	const styles = shooterView();
	return (
		<motion.div
			className={styles.contactExplosion()}
			style={{
				["--exp-left" as string]: `${pos.x * 100}%`,
				["--exp-top" as string]: `${pos.y * 100}%`,
			}}
		>
			<motion.div
				className={styles.explosionCore()}
				initial={{ scale: 0.1, opacity: 1 }}
				animate={{
					scale: FIRE_SCALE_KEYFRAMES,
					opacity: FIRE_OPACITY_KEYFRAMES,
				}}
				transition={{
					duration: CONTACT_EXPLOSION_DURATION,
					times: FIRE_SCALE_TIMES,
					ease: "easeInOut",
				}}
				onAnimationComplete={onComplete}
			>
				<div className="relative w-full h-full">
					<Image
						src={ICONS.FIRE}
						alt=""
						fill
						className={styles.explosionImage()}
					/>
				</div>
			</motion.div>
			<motion.div
				className={styles.explosionFlash()}
				initial={{ scale: 0.5, opacity: 1 }}
				animate={{ scale: 4, opacity: 0 }}
				transition={{ duration: 0.12 }}
			/>
		</motion.div>
	);
}

function ExplosionEffect({ asteroid }: { asteroid: Asteroid }) {
	if (!asteroid.destroyedAt) return null;
	const pos = getAsteroidPosition(asteroid, asteroid.destroyedAt);
	const isStarContact = !!asteroid.hasDamagedStar;
	const styles = shooterView();
	const posStyle = {
		["--exp-left" as string]: `${pos.x * 100}%`,
		["--exp-top" as string]: `${pos.y * 100}%`,
	};
	if (isStarContact) {
		return (
			<motion.div
				className={styles.explosionEffect()}
				style={posStyle}
				initial={{ opacity: 1, scale: 0.5 }}
				animate={{ opacity: 0, scale: 4 }}
				transition={{ duration: 0.7, ease: "easeOut" }}
			>
				<div className="relative w-32 h-32">
					<Image
						src={ICONS.FIRE}
						alt=""
						fill
						className={styles.explosionSmall()}
					/>
				</div>
			</motion.div>
		);
	}
	return (
		<motion.div
			className={styles.explosionEffect()}
			style={posStyle}
			initial={{ opacity: 1, scale: 0.5 }}
			animate={{ opacity: 0, scale: 6 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
		>
			<div className="w-20 h-20 rounded-full border-2 border-orange-400/80" />
		</motion.div>
	);
}

function Crosshair({
	aimRef,
}: {
	aimRef: React.RefObject<{ x: number; y: number }>;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let rafId: number;
		const loop = () => {
			if (ref.current) {
				ref.current.style.left = `${aimRef.current.x * 100}%`;
				ref.current.style.top = `${aimRef.current.y * 100}%`;
			}
			rafId = requestAnimationFrame(loop);
		};
		rafId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafId);
	}, [aimRef]);
	return (
		<div
			ref={ref}
			className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 w-12 h-12"
		>
			<div className="relative w-full h-full">
				<Image
					src={ICONS.TARGET_CIRCLE}
					alt="照準"
					fill
					className="object-contain"
				/>
			</div>
		</div>
	);
}

function Dinosaur({
	aimRef,
}: {
	aimRef: React.RefObject<{ x: number; y: number }>;
}) {
	const ref = useRef<HTMLDivElement>(null);
	useEffect(() => {
		let rafId: number;
		const loop = () => {
			if (ref.current) {
				const dx = aimRef.current.x - DINO_X;
				const dy = aimRef.current.y - DINO_Y;
				const angle = Math.atan2(dy, dx);
				ref.current.style.transform = `translate(-50%, 50%) rotate(${angle}rad)`;
			}
			rafId = requestAnimationFrame(loop);
		};
		rafId = requestAnimationFrame(loop);
		return () => cancelAnimationFrame(rafId);
	}, [aimRef]);
	const styles = shooterView();
	return (
		<div
			ref={ref}
			className={styles.dino()}
			style={{
				["--dino-left" as string]: `${DINO_X * 100}%`,
				["--dino-bottom" as string]: `${(1 - DINO_Y) * 100}%`,
			}}
		>
			<div className="relative w-24 h-24">
				<Image
					src={ICONS.DINO}
					alt="恐竜"
					fill
					className="object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
				/>
			</div>
		</div>
	);
}

export function ShooterView({
	asteroids,
	bullets,
	aimRef,
	onMouseMove,
	maxHp,
	contactExplosion,
	onContactExplosionComplete,
	chainHits,
	onChainHitsComplete,
}: ShooterViewProps) {
	const activeAsteroids = asteroids.filter(
		(a) => !a.destroyedAt && a.id !== contactExplosion?.asteroidId,
	);
	const destroyedAsteroids = asteroids.filter((a) => !!a.destroyedAt);
	return (
		<div
			className="absolute inset-0 cursor-none overflow-hidden"
			onMouseMove={onMouseMove}
		>
			<ProtectedStar />
			<Dinosaur aimRef={aimRef} />
			{activeAsteroids.map((a) => (
				<AsteroidCircle key={a.id} asteroid={a} maxHp={maxHp} />
			))}
			{bullets.map((b) => (
				<BulletCircle key={b.id} bullet={b} />
			))}
			{destroyedAsteroids.map((a) => (
				<ExplosionEffect key={`exp-${a.id}`} asteroid={a} />
			))}
			{contactExplosion && (
				<ContactExplosionEffect
					pos={{ x: contactExplosion.x, y: contactExplosion.y }}
					onComplete={onContactExplosionComplete}
				/>
			)}
			{chainHits && onChainHitsComplete && (
				<ChainHitsEffect
					chainHits={chainHits}
					onComplete={onChainHitsComplete}
				/>
			)}
			<Crosshair aimRef={aimRef} />
		</div>
	);
}
