"use client";

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { StarHpBar } from "@/components/game/phases/starShieldGame/playing/typistView/StarHpBar";
import { SoundContext } from "@/lib/sound-context";
import { useHomeAmmo } from "@/lib/home-ammo-context";
import { orbitBridge } from "@/components/home/orbitBridge";

const OBJECTS = [
	{
		src: "/svg/object/blue-star.svg",
		label: "blue-star",
		maxHp: 100,
		periodMs: 10000,
	},
	{
		src: "/svg/object/earth.svg",
		label: "earth",
		maxHp: 120,
		periodMs: 12000,
	},
	{
		src: "/svg/object/moon.svg",
		label: "moon",
		maxHp: 80,
		periodMs: 8000,
	},
	{
		src: "/svg/object/purple-star.svg",
		label: "purple-star",
		maxHp: 300,
		periodMs: 14000,
	},
] as const;

// ── 軌道チューニング定数 ──────────────────────────────────────
const ORBIT_CENTER_Y = 0;
const ORBIT_CENTER_X = 0;
const SPEED_LEFT = 1.2;
const SPEED_RIGHT = 0.8;
const A = 400;
const B = 20;
const SCALE_MIN = 1;
const SCALE_MAX = 4;
// ─────────────────────────────────────────────────────────────

const TILT = -Math.PI / 6;
const COS_TILT = Math.cos(TILT);
const SIN_TILT = Math.sin(TILT);

// ── HP / 破壊演出（微調整用）──────────────────────────────────
const RESPAWN_DELAY_MS = 2000;

/** 中央の星が膨らんで消えるアニメ */
const EXPLOSION_STAR_SIZE_PX = 48; // 旧 w-12
const EXPLOSION_STAR_SCALE_END = 4;
const EXPLOSION_STAR_DURATION_SEC = 0.5;

/** 飛び散る隕石 SVG */
const METEOR_SRC = "/svg/object/metor.svg";
const METEOR_COUNT = 100;
const METEOR_BOX_PX = 32; // 1個あたりの表示枠（旧 w-8）
const METEOR_DIST_MIN_PX = 45;
const METEOR_DIST_SPREAD_PX = 140; // 上に加算するランダム幅
const METEOR_SPIN_RANGE_DEG = 1080; // (random - 0.5) * これ
const METEOR_DURATION_MIN_SEC = 0.5;
const METEOR_DURATION_SPREAD_SEC = 0.55;
const METEOR_START_SCALE_MIN = 0.45;
const METEOR_START_SCALE_SPREAD = 0.75;
const METEOR_MOTION_EASE = "easeOut" as const;
// ─────────────────────────────────────────────────────────────

interface MeteorParticle {
	id: number;
	angleRad: number;
	dist: number;
	spinDeg: number;
	duration: number;
	startScale: number;
}

export function LogoWithOrbit() {
	const sound = useContext(SoundContext);
	const homeAmmo = useHomeAmmo();
	const [currentIndex, setCurrentIndex] = useState(0);
	const currentIndexRef = useRef(0);
	const objectRef = useRef<HTMLDivElement>(null);
	const angleRef = useRef(0);
	const lastTimeRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);

	// HP system
	const hpRef = useRef<number>(OBJECTS[0].maxHp);
	const [displayHp, setDisplayHp] = useState<number>(OBJECTS[0].maxHp);
	const explodingRef = useRef(false);
	const [exploding, setExploding] = useState(false);
	const lastPosRef = useRef({ x: 0, y: 0 });
	const [meteors, setMeteors] = useState<MeteorParticle[]>([]);
	// 爆発時に表示する星のsrcを保持（exploding中にcurrentIndexが変わっても表示が崩れないよう）
	const explodingSrcRef = useRef<(typeof OBJECTS)[number]["src"]>(OBJECTS[0].src);

	const handleHit = useCallback((damage: number) => {
		if (explodingRef.current) return;

		// 音はONのみ（OFFにはしない）
		if (!sound?.isPlaying) {
			sound?.setIsPlaying(true);
			const audio = new Audio("/se/switch-se.mp3");
			audio.volume = 0.1;
			audio.play().catch(() => {});
		}

		hpRef.current -= damage;
		setDisplayHp(Math.max(0, hpRef.current));
		if (hpRef.current <= 0) {
			// 爆発開始
			explodingRef.current = true;
			explodingSrcRef.current = OBJECTS[currentIndex].src;
			if (objectRef.current) objectRef.current.style.visibility = "hidden";

			// 爆発SE
			const dmgAudio = new Audio("/se/star-damage-se.mp3");
			dmgAudio.volume = 0.3;
			dmgAudio.play().catch(() => {});

			const newMeteors: MeteorParticle[] = Array.from(
				{ length: METEOR_COUNT },
				(_, i) => ({
					id: i,
					angleRad: Math.random() * Math.PI * 2,
					dist:
						METEOR_DIST_MIN_PX + Math.random() * METEOR_DIST_SPREAD_PX,
					spinDeg: (Math.random() - 0.5) * METEOR_SPIN_RANGE_DEG,
					duration:
						METEOR_DURATION_MIN_SEC +
						Math.random() * METEOR_DURATION_SPREAD_SEC,
					startScale:
						METEOR_START_SCALE_MIN +
						Math.random() * METEOR_START_SCALE_SPREAD,
				}),
			);
			setMeteors(newMeteors);
			setExploding(true);

			setTimeout(() => {
				setCurrentIndex((prev) => {
					const next = (prev + 1) % OBJECTS.length;
					const maxHp = OBJECTS[next].maxHp;
					hpRef.current = maxHp;
					setDisplayHp(maxHp);
					return next;
				});
				explodingRef.current = false;
				setExploding(false);
				setMeteors([]);
				if (objectRef.current) objectRef.current.style.visibility = "visible";
			}, RESPAWN_DELAY_MS);
		}
	}, [sound, currentIndex]);

	// orbitBridge に triggerHit をセット・クリーンアップ
	useEffect(() => {
		orbitBridge.triggerHit = handleHit;
		return () => {
			orbitBridge.triggerHit = null;
		};
	}, [handleHit]);

	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		const animate = (time: number) => {
			if (lastTimeRef.current !== null) {
				const delta = time - lastTimeRef.current;
				const speedMult = Math.sin(angleRef.current) > 0 ? SPEED_LEFT : SPEED_RIGHT;
				const periodMs = OBJECTS[currentIndexRef.current].periodMs;
				angleRef.current += (delta / periodMs) * 2 * Math.PI * speedMult;
			}
			lastTimeRef.current = time;

			const t = angleRef.current;
			const xLocal = A * Math.cos(t);
			const yLocal = B * Math.sin(t);
			const x = xLocal * COS_TILT - yLocal * SIN_TILT + ORBIT_CENTER_X;
			const y = xLocal * SIN_TILT + yLocal * COS_TILT + ORBIT_CENTER_Y;

			const depth = (Math.sin(t) + 1) / 2;
			const scale = SCALE_MIN + depth * (SCALE_MAX - SCALE_MIN);
			const zIndex = Math.sin(t) > 0 ? 10 : 1;

			if (objectRef.current) {
				objectRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
				objectRef.current.style.zIndex = String(zIndex);

				const containerEl = objectRef.current.parentElement;
				const rect = containerEl?.getBoundingClientRect();
				if (rect) {
					if (!explodingRef.current) {
						orbitBridge.clientX = rect.left + rect.width / 2 + x;
						orbitBridge.clientY = rect.top + rect.height / 2 + y;
					}
					lastPosRef.current = { x, y };
				}
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
			lastTimeRef.current = null;
		};
	}, []);

	const currentObject = OBJECTS[currentIndex];
	const explosionPos = lastPosRef.current;

	return (
		<div className="flex flex-col items-center gap-3">
		<div className="relative inline-flex items-center justify-center">
			{/* z-5: ロゴ文字のスタッキングコンテキスト */}
			<PukapukaLogo size="large" className="relative z-5" disableInteraction />
			<div
				ref={objectRef}
				className="absolute top-1/2 left-1/2 w-12 h-12 opacity-100"
			>
				<Image
					src={currentObject.src}
					alt={currentObject.label}
					fill
					className="object-contain"
				/>
			</div>

			{/* 爆発オーバーレイ */}
			{exploding && (
				<>
					{/* 星がドカンと膨らんで消える */}
					<div
						className="absolute top-1/2 left-1/2 pointer-events-none z-20"
						style={{
							width: EXPLOSION_STAR_SIZE_PX,
							height: EXPLOSION_STAR_SIZE_PX,
							transform: `translate(calc(-50% + ${explosionPos.x}px), calc(-50% + ${explosionPos.y}px))`,
						}}
					>
						<motion.div
							className="w-full h-full"
							initial={{ scale: 1, opacity: 1 }}
							animate={{
								scale: EXPLOSION_STAR_SCALE_END,
								opacity: 0,
							}}
							transition={{
								duration: EXPLOSION_STAR_DURATION_SEC,
								ease: METEOR_MOTION_EASE,
							}}
						>
							<Image
								src={explodingSrcRef.current}
								alt="explosion"
								fill
								className="object-contain"
							/>
						</motion.div>
					</div>

					{/* 隕石パーティクル */}
					{meteors.map((p) => (
						<div
							key={p.id}
							className="absolute top-1/2 left-1/2 pointer-events-none z-20"
							style={{
								width: METEOR_BOX_PX,
								height: METEOR_BOX_PX,
								transform: `translate(calc(-50% + ${explosionPos.x}px), calc(-50% + ${explosionPos.y}px))`,
							}}
						>
							<motion.div
								className="relative w-full h-full"
								initial={{
									x: 0,
									y: 0,
									opacity: 1,
									scale: p.startScale,
									rotate: 0,
								}}
								animate={{
									x: Math.cos(p.angleRad) * p.dist,
									y: Math.sin(p.angleRad) * p.dist,
									opacity: 0,
									scale: 0,
									rotate: p.spinDeg,
								}}
								transition={{
									duration: p.duration,
									ease: METEOR_MOTION_EASE,
								}}
							>
								<Image
									src={METEOR_SRC}
									alt=""
									fill
									className="object-contain"
								/>
							</motion.div>
						</div>
					))}
				</>
			)}
		</div>

		<StarHpBar starHp={displayHp} maxStarHp={currentObject.maxHp} />

		{homeAmmo && (
			<div
				className="flex flex-wrap justify-center gap-1 mt-1"
				aria-hidden
			>
				{Array.from({ length: homeAmmo.ammoMax }, (_, i) => (
					<span
						key={i}
						className={`w-1.5 h-6 rounded-full shrink-0 ${
							i < homeAmmo.ammo
								? "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.55)]"
								: "bg-white/15"
						}`}
					/>
				))}
			</div>
		)}
		</div>
	);
}
