"use client";

import {
	useContext,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	useCallback,
	type ReactNode,
} from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { SoundContext } from "@/lib/sound-context";
import { useSyncHomeOrbitHud } from "@/lib/home-orbit-hud-context";
import { orbitBridge } from "@/components/home/orbitBridge";
import { HomeAchievementToast } from "@/components/home/homeAchievementToast";
import { StarHpBar } from "@/components/game/phases/starShieldGame/playing/typistView/StarHpBar";
import {
	isAchievementUnlocked,
	tryUnlockAchievement,
} from "@/lib/local-storage-bridge";

/** 軌道オブジェクト破壊で解除する実績（任意）。`id` は永続化用の安定スラッグ */
export interface HomeOrbitAchievement {
	id: string;
	toastMessage: string;
}

/** ホーム軌道上の1オブジェクト（SVG・HP・公転周期・基準サイズ） */
export interface HomeOrbitObject {
	src: string;
	label: string;
	maxHp: number;
	periodMs: number;
	/** 何msごとにHPを+1回復するか（星ごとに調整用） */
	healIntervalMs: number;
	/** 軌道上の基準サイズ（px）。{@link resolveStarBaseSizePx} で 24〜128 に収める */
	starBaseSizePx: number;
	/** 破壊時に解除する実績（任意） */
	achievement?: HomeOrbitAchievement;
	/** 破壊時に飛ばす隕石の数（未指定時はデフォルト） */
	meteorCount?: number;
}

/** デフォルトの星ベース幅・高さ（px）。比例計算の基準にも使う */
export const DEFAULT_STAR_BASE_SIZE_PX = 48;

function clampStarBaseSizePx(px: number): number {
	return Math.round(Math.min(128, Math.max(24, px)));
}

/** `entry.starBaseSizePx` を 24〜128px に収めて返す */
export function resolveStarBaseSizePx(entry: HomeOrbitObject): number {
	return clampStarBaseSizePx(entry.starBaseSizePx);
}

type HomeOrbitStartResolution =
	| { kind: "progress"; index: number }
	| { kind: "allAchievementsUnlocked"; listLength: number };

/**
 * 実績状態から「進行中なら開始インデックス」「すべて解除済みならランダムが必要」を返す（ランダムは呼び出し側の ref で1回だけ）。
 */
function resolveHomeOrbitStart(
	list: readonly HomeOrbitObject[],
): HomeOrbitStartResolution {
	if (list.length === 0) return { kind: "progress", index: 0 };

	const withAchievement = list
		.map((o, i) => ({ o, i }))
		.filter(
			(
				x,
			): x is {
				o: HomeOrbitObject & { achievement: HomeOrbitAchievement };
				i: number;
			} => Boolean(x.o.achievement),
		);

	if (withAchievement.length === 0) return { kind: "progress", index: 0 };

	const ids = withAchievement.map((x) => x.o.achievement.id);
	const allUnlocked = ids.every((id) => isAchievementUnlocked(id));

	if (allUnlocked) {
		return { kind: "allAchievementsUnlocked", listLength: list.length };
	}

	for (const { o, i } of withAchievement) {
		if (!isAchievementUnlocked(o.achievement.id)) {
			return { kind: "progress", index: i };
		}
	}
	return { kind: "progress", index: 0 };
}

export const HOME_ORBIT_OBJECTS = [
	{
		src: "/svg/object/earth.svg",
		label: "earth",
		maxHp: 100,
		meteorCount: 100,
		periodMs: 30000,
		healIntervalMs: 10000,
		starBaseSizePx: 30,
		achievement: {
			id: "enemy-of-humanity",
			toastMessage: "人類の敵",
		},
	},
	{
		src: "/svg/object/sun.svg",
		label: "sun",
		maxHp: 300,
		meteorCount: 130,
		periodMs: 30000,
		healIntervalMs: 10000,
		starBaseSizePx: 90,
		achievement: {
			id: "ice-age-onset",
			toastMessage: "氷河期時代の到来",
		},
	},
	{
		src: "/svg/object/mars.svg",
		label: "mars",
		maxHp: 150,
		meteorCount: 68,
		periodMs: 3000,
		healIntervalMs: 1000,
		starBaseSizePx: 50,
		achievement: {
			id: "future-earth-destruction",
			toastMessage: "残された文明の道の破壊",
		},
	},
	{
		src: "/svg/object/neptune.svg",
		label: "neptune",
		maxHp: 300,
		meteorCount: 140,
		periodMs: 30000,
		healIntervalMs: 50,
		starBaseSizePx: 100,
		achievement: {
			id: "rapid-tap-master",
			toastMessage: "連打の達人",
		},
	},
	{
		src: "/svg/object/death-star.svg",
		label: "death-star",
		maxHp: 30,
		meteorCount: 52,
		periodMs: 3000,
		healIntervalMs: 200,
		starBaseSizePx: 30,
		achievement: {
			id: "sniping-master",
			toastMessage: "狙撃の達人",
		},
	},
] as const satisfies readonly HomeOrbitObject[];

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
/** 星破壊から次の軌道星が出るまで（隕石フェーズ） */
const NEXT_STAR_AFTER_DESTROY_MS = 45_000;
const DEFAULT_HOME_ORBIT_METEOR_COUNT = 72;
/** 隕石のうち「手前に来る」方向の割合（固定） */
const METEOR_TOWARD_CAMERA_RATIO = 0.15;
const METEOR_BOX_PX_MIN = 16;
const METEOR_BOX_PX_MAX = 44;
const METEOR_MAX_LIFE_SEC = 28;
const METEOR_OFFSCREEN_MARGIN_PX = 420;

const EXPLOSION_STAR_SCALE_END = 4;
const EXPLOSION_STAR_DURATION_SEC = 0.5;

const METEOR_SRC = "/svg/object/metor.svg";
const EXPLOSION_STAR_EASE = "easeOut" as const;

type MeteorDepth = "toward" | "away" | "lateral";

interface MeteorSim {
	id: number;
	x: number;
	y: number;
	vx: number;
	vy: number;
	depth: MeteorDepth;
	t0: number;
	baseSizePx: number;
	scale0: number;
	scale: number;
	rot: number;
	spin: number;
	alive: boolean;
}

function spawnMeteors(count: number): MeteorSim[] {
	const out: MeteorSim[] = [];
	for (let i = 0; i < count; i++) {
		const toward = Math.random() < METEOR_TOWARD_CAMERA_RATIO;
		const u = Math.random() * 2 * Math.PI;
		const v = Math.random() * 2 - 1;
		const phi = Math.acos(v);
		let dx = Math.sin(phi) * Math.cos(u);
		let dy = Math.sin(phi) * Math.sin(u);
		let dz = Math.cos(phi);
		if (toward) {
			dz = 0.35 + Math.random() * 0.65;
			const horiz = Math.hypot(dx, dy) || 1;
			dx = (dx / horiz) * (0.2 + Math.random() * 0.55);
			dy = (dy / horiz) * (0.2 + Math.random() * 0.55) + 0.38;
			const nn = Math.hypot(dx, dy, dz) || 1;
			dx /= nn;
			dy /= nn;
			dz /= nn;
		}
		const speed = 95 + Math.random() * 215;
		const vx = dx * speed;
		const vy = (dy + dz * 0.92) * speed;
		let depth: MeteorDepth;
		if (toward) depth = "toward";
		else if (dz < -0.12) depth = "away";
		else depth = "lateral";
		const scale0 = 0.2 + Math.random() * 0.58;
		out.push({
			id: i,
			x: (Math.random() - 0.5) * 12,
			y: (Math.random() - 0.5) * 12,
			vx,
			vy,
			depth,
			t0: performance.now(),
			baseSizePx: Math.round(
				METEOR_BOX_PX_MIN +
					Math.random() * (METEOR_BOX_PX_MAX - METEOR_BOX_PX_MIN),
			),
			scale0,
			scale: scale0,
			rot: 0,
			spin: ((Math.random() - 0.5) * 1080 * Math.PI) / 180,
			alive: true,
		});
	}
	return out;
}

function stepMeteors(
	sims: MeteorSim[],
	dt: number,
	nowMs: number,
	maxDistFromCenterPx: number,
): void {
	for (const m of sims) {
		if (!m.alive) continue;
		m.x += m.vx * dt;
		m.y += m.vy * dt;
		const t = (nowMs - m.t0) / 1000;
		if (m.depth === "toward") {
			m.scale = m.scale0 * (0.32 + 2.75 * Math.min(1, t / 6.5));
		} else if (m.depth === "away") {
			m.scale = m.scale0 * Math.max(0.035, 1.08 * Math.exp(-t * 1.08));
		} else {
			m.scale = m.scale0 * (0.7 + 0.3 * (1 - Math.min(1, t / 8.5)));
		}
		m.rot += m.spin * dt;
		if (
			Math.hypot(m.x, m.y) > maxDistFromCenterPx ||
			t > METEOR_MAX_LIFE_SEC
		) {
			m.alive = false;
		}
	}
}
// ─────────────────────────────────────────────────────────────

export interface LogoWithOrbitProps {
	/** 省略時は {@link HOME_ORBIT_OBJECTS} */
	objects?: readonly HomeOrbitObject[];
	/** ロゴ・軌道の直下（旧 HP ブロック位置）に表示するノード（例: タグライン） */
	children?: ReactNode;
}

export function LogoWithOrbit({
	objects: objectsProp = HOME_ORBIT_OBJECTS,
	children,
}: LogoWithOrbitProps) {
	const objects =
		objectsProp.length > 0 ? objectsProp : HOME_ORBIT_OBJECTS;
	const objectsRef = useRef(objects);

	const sound = useContext(SoundContext);
	const setOrbitHud = useSyncHomeOrbitHud();
	const [currentIndex, setCurrentIndex] = useState(0);
	const currentIndexRef = useRef(0);
	const objectRef = useRef<HTMLDivElement>(null);
	const angleRef = useRef(0);
	const lastTimeRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);

	// HP system
	const hpRef = useRef<number>(objects[0].maxHp);
	const [displayHp, setDisplayHp] = useState<number>(objects[0].maxHp);
	const explodingRef = useRef(false);
	const [exploding, setExploding] = useState(false);
	const lastPosRef = useRef({ x: 0, y: 0 });
	const frozenExplosionPosRef = useRef({ x: 0, y: 0 });
	const orbitFieldRef = useRef<HTMLDivElement>(null);
	const meteorSimsRef = useRef<MeteorSim[]>([]);
	const meteorPhaseRef = useRef(false);
	const lastMeteorPhysicsAtRef = useRef<number | null>(null);
	const [meteorPhase, setMeteorPhase] = useState(false);
	const [meteorsForRender, setMeteorsForRender] = useState<MeteorSim[]>([]);
	const [explosionAnchorFrozen, setExplosionAnchorFrozen] = useState<{
		x: number;
		y: number;
	} | null>(null);
	const bumpMeteorFrame = useCallback(() => {
		setMeteorsForRender((prev) => [...prev]);
	}, []);
	// 爆発オーバーレイ用（exploding 中に currentIndex が変わっても表示が崩れないよう state）
	const [explosionOverlaySrc, setExplosionOverlaySrc] = useState(
		objects[0].src,
	);
	const [explosionStarDisplayPx, setExplosionStarDisplayPx] = useState(() =>
		resolveStarBaseSizePx(objects[0]),
	);
	const [achievementToastMessage, setAchievementToastMessage] = useState<
		string | null
	>(null);
	const dismissAchievementToast = useCallback(() => {
		setAchievementToastMessage(null);
	}, []);

	/** 全実績解除時の開始位置ランダム（このマウントで1回だけ） */
	const allUnlockedOrbitRandomRef = useRef<number | null>(null);

	/* objects / 実績に応じた開始インデックス・HP・表示を同期（親の objects 変更時も再計算） */
	/* eslint-disable react-hooks/set-state-in-effect -- 実績・objects に応じた軌道状態の一括同期 */
	useLayoutEffect(() => {
		objectsRef.current = objects;
		const resolved = resolveHomeOrbitStart(objects);
		let i: number;
		if (resolved.kind === "progress") {
			allUnlockedOrbitRandomRef.current = null;
			i = resolved.index;
		} else {
			if (allUnlockedOrbitRandomRef.current === null) {
				allUnlockedOrbitRandomRef.current = Math.floor(
					Math.random() * resolved.listLength,
				);
			}
			i = allUnlockedOrbitRandomRef.current;
		}
		currentIndexRef.current = i;
		setCurrentIndex(i);
		const entry = objects[i];
		if (!entry) return;
		hpRef.current = entry.maxHp;
		setDisplayHp(entry.maxHp);
		setExplosionOverlaySrc(entry.src);
		setExplosionStarDisplayPx(resolveStarBaseSizePx(entry));
	}, [objects]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const handleHit = useCallback(
		(damage: number) => {
			if (explodingRef.current) return;

			// 音はONのみ（OFFにはしない）。switch-se は BGM 音量ボタン ON 時のみ
			if (!sound?.isPlaying) {
				sound?.setIsPlaying(true);
			}

			const list = objectsRef.current;
			const idx = currentIndex;

			hpRef.current -= damage;
			setDisplayHp(Math.max(0, hpRef.current));
			if (hpRef.current <= 0) {
				// 爆発開始 → 隕石フェーズ（NEXT_STAR_AFTER_DESTROY_MS 後に次の星）
				explodingRef.current = true;
				const hitObject = list[idx] as HomeOrbitObject;
				setExplosionOverlaySrc(hitObject.src);
				setExplosionStarDisplayPx(resolveStarBaseSizePx(hitObject));
				frozenExplosionPosRef.current = { ...lastPosRef.current };
				setExplosionAnchorFrozen({ ...lastPosRef.current });
				const ach = hitObject.achievement;
				if (ach && tryUnlockAchievement(ach.id)) {
					setAchievementToastMessage(ach.toastMessage);
				}
				if (objectRef.current) objectRef.current.style.visibility = "hidden";

				const dmgAudio = new Audio("/se/star-damage-se.mp3");
				dmgAudio.volume = 0.3;
				dmgAudio.play().catch(() => {});

				const mCount =
					hitObject.meteorCount ?? DEFAULT_HOME_ORBIT_METEOR_COUNT;
				const spawned = spawnMeteors(mCount);
				meteorSimsRef.current = spawned;
				setMeteorsForRender(spawned);
				meteorPhaseRef.current = true;
				orbitBridge.isMeteorPhase = true;
				setMeteorPhase(true);
				lastMeteorPhysicsAtRef.current = null;
				setExploding(true);

				window.setTimeout(() => {
					meteorPhaseRef.current = false;
					orbitBridge.isMeteorPhase = false;
					setMeteorPhase(false);
					meteorSimsRef.current = [];
					setMeteorsForRender([]);
					setExplosionAnchorFrozen(null);
					setCurrentIndex((prev) => {
						const len = objectsRef.current.length;
						const next = (prev + 1) % len;
						const maxHp = objectsRef.current[next].maxHp;
						hpRef.current = maxHp;
						setDisplayHp(maxHp);
						return next;
					});
					explodingRef.current = false;
					setExploding(false);
					if (objectRef.current) objectRef.current.style.visibility = "visible";
				}, NEXT_STAR_AFTER_DESTROY_MS);
			}
		},
		[sound, currentIndex],
	);

	// orbitBridge に triggerHit をセット・クリーンアップ
	useEffect(() => {
		orbitBridge.triggerHit = handleHit;
		return () => {
			orbitBridge.triggerHit = null;
		};
	}, [handleHit]);

	useEffect(() => {
		orbitBridge.tryHitMeteor = (
			clientX: number,
			clientY: number,
			bulletRadiusPx: number,
		) => {
			const field = orbitFieldRef.current;
			if (!field || !meteorPhaseRef.current) return false;
			const rect = field.getBoundingClientRect();
			const fx = frozenExplosionPosRef.current.x;
			const fy = frozenExplosionPosRef.current.y;
			const sims = meteorSimsRef.current;
			for (const m of sims) {
				if (!m.alive) continue;
				const mcx = rect.left + rect.width / 2 + fx + m.x;
				const mcy = rect.top + rect.height / 2 + fy + m.y;
				const rad = m.baseSizePx * m.scale * 0.45 + bulletRadiusPx;
				if (Math.hypot(clientX - mcx, clientY - mcy) < rad) {
					m.alive = false;
					bumpMeteorFrame();
					return true;
				}
			}
			return false;
		};
		return () => {
			orbitBridge.tryHitMeteor = null;
		};
	}, [bumpMeteorFrame]);

	useEffect(() => {
		return () => {
			orbitBridge.isMeteorPhase = false;
			orbitBridge.tryHitMeteor = null;
		};
	}, []);

	// 現在の星を自動回復（+1 / healIntervalMs）
	useEffect(() => {
		const entry = objects[currentIndex];
		if (!entry) return;
		const intervalMs =
			Number.isFinite(entry.healIntervalMs) && entry.healIntervalMs > 0
				? entry.healIntervalMs
				: 1000;

		const id = window.setInterval(() => {
			if (explodingRef.current) return;
			const maxHp = entry.maxHp;
			const next = Math.min(maxHp, hpRef.current + 1);
			if (next === hpRef.current) return;
			hpRef.current = next;
			setDisplayHp(next);
		}, intervalMs);

		return () => window.clearInterval(id);
	}, [objects, currentIndex]);

	useEffect(() => {
		currentIndexRef.current = currentIndex;
	}, [currentIndex]);

	useEffect(() => {
		const animate = (time: number) => {
			if (!explodingRef.current) {
				if (lastTimeRef.current !== null) {
					const delta = time - lastTimeRef.current;
					const speedMult =
						Math.sin(angleRef.current) > 0 ? SPEED_LEFT : SPEED_RIGHT;
					const list = objectsRef.current;
					const idx = currentIndexRef.current % list.length;
					const periodMs = list[idx]?.periodMs ?? 10000;
					angleRef.current +=
						(delta / periodMs) * 2 * Math.PI * speedMult;
				}

				const ta = angleRef.current;
				const xLocal = A * Math.cos(ta);
				const yLocal = B * Math.sin(ta);
				const x = xLocal * COS_TILT - yLocal * SIN_TILT + ORBIT_CENTER_X;
				const y = xLocal * SIN_TILT + yLocal * COS_TILT + ORBIT_CENTER_Y;

				const depth = (Math.sin(ta) + 1) / 2;
				const scale = SCALE_MIN + depth * (SCALE_MAX - SCALE_MIN);
				const zIndex = Math.sin(ta) > 0 ? 10 : 1;

				if (objectRef.current) {
					objectRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
					objectRef.current.style.zIndex = String(zIndex);

					const containerEl = objectRef.current.parentElement;
					const rect = containerEl?.getBoundingClientRect();
					if (rect) {
						orbitBridge.clientX = rect.left + rect.width / 2 + x;
						orbitBridge.clientY = rect.top + rect.height / 2 + y;
						const list = objectsRef.current;
						const idx = currentIndexRef.current % list.length;
						const entry = list[idx];
						if (entry) {
							orbitBridge.hitRadius =
								(resolveStarBaseSizePx(entry) * scale) / 2;
						}
						lastPosRef.current = { x, y };
					}
				}
			}

			lastTimeRef.current = time;

			if (
				meteorPhaseRef.current &&
				meteorSimsRef.current.some((m) => m.alive)
			) {
				if (lastMeteorPhysicsAtRef.current === null) {
					lastMeteorPhysicsAtRef.current = time;
				}
				const dt = Math.min(
					0.055,
					(time - lastMeteorPhysicsAtRef.current) / 1000,
				);
				lastMeteorPhysicsAtRef.current = time;
				const maxD =
					(typeof window !== "undefined"
						? Math.max(window.innerWidth, window.innerHeight)
						: 1200) *
						0.92 +
					METEOR_OFFSCREEN_MARGIN_PX;
				stepMeteors(meteorSimsRef.current, dt, time, maxD);
				setMeteorsForRender([...meteorSimsRef.current]);
			} else {
				lastMeteorPhysicsAtRef.current = null;
			}

			rafRef.current = requestAnimationFrame(animate);
		};

		rafRef.current = requestAnimationFrame(animate);

		return () => {
			if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
			lastTimeRef.current = null;
		};
	}, []);

	const currentObject = objects[currentIndex];
	useEffect(() => {
		if (!setOrbitHud) return;
		if (meteorPhase) {
			setOrbitHud(null);
			return;
		}
		setOrbitHud({ starHp: displayHp, maxStarHp: currentObject.maxHp });
	}, [meteorPhase, setOrbitHud, displayHp, currentObject.maxHp]);

	useEffect(() => {
		return () => {
			setOrbitHud?.(null);
		};
	}, [setOrbitHud]);

	const orbitStarSizePx = resolveStarBaseSizePx(currentObject);
	const explosionPos = explosionAnchorFrozen ?? { x: 0, y: 0 };

	return (
		<div className="flex flex-col items-center gap-3">
			<HomeAchievementToast
				open={achievementToastMessage !== null}
				message={achievementToastMessage ?? ""}
				onDismiss={dismissAchievementToast}
			/>
		<div ref={orbitFieldRef} className="relative inline-flex items-center justify-center">
			{/* z-5: ロゴ文字のスタッキングコンテキスト */}
			<PukapukaLogo size="large" className="relative z-5" disableInteraction />
			<div
				ref={objectRef}
				className="absolute top-1/2 left-1/2 opacity-100"
				style={{ width: orbitStarSizePx, height: orbitStarSizePx }}
			>
				<Image
					src={currentObject.src}
					alt={currentObject.label}
					fill
					className="object-contain"
				/>
				<div className="pointer-events-none absolute bottom-full left-1/2 z-10 flex -translate-x-1/2 justify-center whitespace-nowrap">
					<StarHpBar
						variant="home"
						starHp={displayHp}
						maxStarHp={currentObject.maxHp}
					/>
				</div>
			</div>

			{/* 爆発オーバーレイ（星の一瞬の膨張） */}
			{exploding && (
				<div
					className="absolute top-1/2 left-1/2 pointer-events-none z-20"
					style={{
						width: explosionStarDisplayPx,
						height: explosionStarDisplayPx,
						transform: `translate(calc(-50% + ${explosionPos.x}px), calc(-50% + ${explosionPos.y}px))`,
					}}
				>
					<motion.div
						className="h-full w-full"
						initial={{ scale: 1, opacity: 1 }}
						animate={{
							scale: EXPLOSION_STAR_SCALE_END,
							opacity: 0,
						}}
						transition={{
							duration: EXPLOSION_STAR_DURATION_SEC,
							ease: EXPLOSION_STAR_EASE,
						}}
					>
						<Image
							src={explosionOverlaySrc}
							alt="explosion"
							fill
							className="object-contain"
						/>
					</motion.div>
				</div>
			)}

			{meteorPhase &&
				meteorsForRender
					.filter((m) => m.alive)
					.map((m) => (
								<div
									key={m.id}
									className="absolute top-1/2 left-1/2 pointer-events-none z-30"
									style={{
										width: m.baseSizePx,
										height: m.baseSizePx,
										transform: `translate(calc(-50% + ${explosionPos.x + m.x}px), calc(-50% + ${explosionPos.y + m.y}px)) scale(${m.scale}) rotate(${m.rot}rad)`,
									}}
								>
									<Image
										src={METEOR_SRC}
										alt=""
										fill
										className="object-contain"
									/>
					</div>
				))}
		</div>

		{children}
		</div>
	);
}
