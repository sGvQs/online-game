"use client";

import { useContext, useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { SoundContext } from "@/lib/sound-context";
import { orbitBridge } from "@/components/home/orbitBridge";

const OBJECTS = [
	{ src: "/svg/object/blue-star.svg", label: "blue-star" },
	{ src: "/svg/object/earth.svg", label: "earth" },
	{ src: "/svg/object/moon.svg", label: "moon" },
	{ src: "/svg/object/purple-star.svg", label: "purple-star" },
] as const;

// ── 軌道チューニング定数 ──────────────────────────────────────
const ORBIT_CENTER_Y = 0;
const ORBIT_CENTER_X = 0;
const PERIOD = 10000;
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

// ── HP ────────────────────────────────────────────────────────
const MAX_HP = 10;
const RESPAWN_DELAY = 2000; // ms
const PARTICLE_COLORS = [
	"bg-yellow-300",
	"bg-orange-400",
	"bg-yellow-100",
	"bg-white",
	"bg-red-400",
	"bg-yellow-400",
];
// ─────────────────────────────────────────────────────────────

interface Particle {
	id: number;
	angle: number;
	dist: number;
	color: string;
}

export function LogoWithOrbit() {
	const sound = useContext(SoundContext);
	const [currentIndex, setCurrentIndex] = useState(0);
	const objectRef = useRef<HTMLDivElement>(null);
	const angleRef = useRef(0);
	const lastTimeRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);

	// HP system
	const hpRef = useRef(MAX_HP);
	const [displayHp, setDisplayHp] = useState(MAX_HP);
	const explodingRef = useRef(false);
	const [exploding, setExploding] = useState(false);
	const lastPosRef = useRef({ x: 0, y: 0 });
	const [particles, setParticles] = useState<Particle[]>([]);
	// 爆発時に表示する星のsrcを保持（exploding中にcurrentIndexが変わっても表示が崩れないよう）
	const explodingSrcRef = useRef<(typeof OBJECTS)[number]["src"]>(OBJECTS[0].src);

	const handleHit = useCallback(() => {
		if (explodingRef.current) return;

		// 音はONのみ（OFFにはしない）
		if (!sound?.isPlaying) {
			sound?.setIsPlaying(true);
			const audio = new Audio("/se/switch-se.mp3");
			audio.volume = 0.1;
			audio.play().catch(() => {});
		}

		hpRef.current -= 1;
		setDisplayHp(hpRef.current);
		if (hpRef.current <= 0) {
			// 爆発開始
			explodingRef.current = true;
			explodingSrcRef.current = OBJECTS[currentIndex].src;
			if (objectRef.current) objectRef.current.style.visibility = "hidden";

			// 爆発SE
			const dmgAudio = new Audio("/se/star-damage-se.mp3");
			dmgAudio.volume = 0.3;
			dmgAudio.play().catch(() => {});

			const newParticles: Particle[] = Array.from({ length: 12 }, (_, i) => ({
				id: i,
				angle: (i / 12) * 360,
				dist: 60 + Math.random() * 50,
				color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
			}));
			setParticles(newParticles);
			setExploding(true);

			setTimeout(() => {
				hpRef.current = MAX_HP;
				setDisplayHp(MAX_HP);
				setCurrentIndex((prev) => (prev + 1) % OBJECTS.length);
				explodingRef.current = false;
				setExploding(false);
				setParticles([]);
				if (objectRef.current) objectRef.current.style.visibility = "visible";
			}, RESPAWN_DELAY);
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
		const animate = (time: number) => {
			if (lastTimeRef.current !== null) {
				const delta = time - lastTimeRef.current;
				const speedMult = Math.sin(angleRef.current) > 0 ? SPEED_LEFT : SPEED_RIGHT;
				angleRef.current += (delta / PERIOD) * 2 * Math.PI * speedMult;
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
						className="absolute top-1/2 left-1/2 w-12 h-12 pointer-events-none z-20"
						style={{
							transform: `translate(calc(-50% + ${explosionPos.x}px), calc(-50% + ${explosionPos.y}px))`,
						}}
					>
						<motion.div
							className="w-full h-full"
							initial={{ scale: 1, opacity: 1 }}
							animate={{ scale: 4, opacity: 0 }}
							transition={{ duration: 0.5, ease: "easeOut" }}
						>
							<Image
								src={explodingSrcRef.current}
								alt="explosion"
								fill
								className="object-contain"
							/>
						</motion.div>
					</div>

					{/* パーティクル */}
					{particles.map((p) => (
						<div
							key={p.id}
							className="absolute top-1/2 left-1/2 w-2 h-2 pointer-events-none z-20"
							style={{
								transform: `translate(calc(-50% + ${explosionPos.x}px), calc(-50% + ${explosionPos.y}px))`,
							}}
						>
							<motion.div
								className={`w-full h-full rounded-full ${p.color}`}
								initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
								animate={{
									x: Math.cos((p.angle * Math.PI) / 180) * p.dist,
									y: Math.sin((p.angle * Math.PI) / 180) * p.dist,
									opacity: 0,
									scale: 0,
								}}
								transition={{ duration: 0.8, ease: "easeOut" }}
							/>
						</div>
					))}
				</>
			)}
		</div>

		{/* HP インジケーター */}
		<div className="flex gap-1.5">
			{Array.from({ length: MAX_HP }, (_, i) => (
				<div
					key={i}
					className={`w-2 h-2 rounded-full transition-all duration-200 ${
						i < displayHp
							? "bg-yellow-300 shadow-[0_0_4px_rgba(253,224,71,0.8)]"
							: "bg-white/20"
					}`}
				/>
			))}
		</div>
		</div>
	);
}
