"use client";

import {
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
import { soundOutputRef } from "@/lib/sound-context";
import { effectiveSeVolume } from "@/lib/sound-volume";
import { useSyncHomeOrbitHud, useSyncIsEmergencyMode } from "@/lib/home-orbit-hud-context";
import { useHomeStarted, HOME_FIRST_ACHIEVEMENT_ID } from "@/lib/home-started-context";
import { orbitBridge } from "@/components/home/orbitBridge";
import { HomeAchievementToast } from "@/components/home/homeAchievementToast";
import { StarHpBar } from "@/components/game/phases/starShieldGame/playing/typistView/StarHpBar";
import {
	isAchievementUnlocked,
	tryUnlockAchievement,
	getActiveOrbitStar,
	setActiveOrbitStar,
	clearActiveOrbitStar,
} from "@/lib/local-storage-bridge";

/** 軌道オブジェクト破壊で解除する実績（任意）。`id` は永続化用の安定スラッグ */
export interface HomeOrbitAchievement {
	id: string;
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
	/** 軌道中心から接近してフルサイズに到達するまでの秒数（警告フェーズ1と同期） */
	approachDurationSec: number;
	/**
	 * ページ訪問時の出現確率（0〜1）。
	 * 新規ユーザーの最初の星は常時表示のため参照しない。
	 */
	appearProbability: number;
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
	| { kind: "show"; index: number; fromSaved: boolean }
	| { kind: "none" };

/**
 * ページ訪問時に表示する星を決定する。
 * - 出現中の星が localStorage に保存されていればそれを優先（破壊されるまで維持）
 * - 未開始（最初の実績未解除）: 常に最初の星を表示して保存
 * - 全実績解除済み: 星なし
 * - それ以外: 各星の `appearProbability` で独立抽選し、当選した中からランダムに1つ保存
 */
function resolveHomeOrbitStart(
	list: readonly HomeOrbitObject[],
): HomeOrbitStartResolution {
	if (list.length === 0) return { kind: "none" };

	// 出現中の星が保存されていればそれを使う（演出スキップ）
	const saved = getActiveOrbitStar();
	if (saved !== null && saved >= 0 && saved < list.length) {
		return { kind: "show", index: saved, fromSaved: true };
	}

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

	if (withAchievement.length === 0) {
		return { kind: "show", index: 0, fromSaved: false };
	}

	const firstAchId = withAchievement[0].o.achievement.id;

	// 未開始ユーザー: 常に最初の星
	if (!isAchievementUnlocked(firstAchId)) {
		return { kind: "show", index: withAchievement[0].i, fromSaved: false };
	}

	// 全実績解除済み: 星なし
	if (withAchievement.every((x) => isAchievementUnlocked(x.o.achievement.id))) {
		return { kind: "none" };
	}

	// 各星の appearProbability で独立抽選（破壊済み＝実績解除済みはスキップ）
	const candidates: number[] = [];
	for (let i = 0; i < list.length; i++) {
		const obj = list[i];
		if (obj.achievement && isAchievementUnlocked(obj.achievement.id)) continue;
		if (Math.random() < obj.appearProbability) candidates.push(i);
	}
	if (candidates.length === 0) return { kind: "none" };

	const idx = candidates[Math.floor(Math.random() * candidates.length)];
	return { kind: "show", index: idx, fromSaved: false };
}

export const HOME_ORBIT_OBJECTS = [
	{
		src: "/svg/object/earth.svg",
		label: "earth",
		maxHp: 50,
		meteorCount: 100,
		periodMs: 30000,
		healIntervalMs: 10000,
		starBaseSizePx: 30,
		appearProbability: 0,
		approachDurationSec: 15,
		achievement: {
			id: "enemy-of-humanity",
		},
	},
	{
		src: "/svg/object/sun.svg",
		label: "sun",
		maxHp: 300,
		meteorCount: 300,
		periodMs: 30000,
		healIntervalMs: 10000,
		starBaseSizePx: 90,
		appearProbability: 0.16,
		approachDurationSec: 15,
		achievement: {
			id: "ice-age-onset",
		},
	},
	{
		src: "/svg/object/mars.svg",
		label: "mars",
		maxHp: 150,
		meteorCount: 150,
		periodMs: 3000,
		healIntervalMs: 1000,
		starBaseSizePx: 50,
		appearProbability: 0.08,
		approachDurationSec: 1.5,
		achievement: {
			id: "future-earth-destruction",
		},
	},
	{
		src: "/svg/object/neptune.svg",
		label: "neptune",
		maxHp: 300,
		meteorCount: 300,
		periodMs: 30000,
		healIntervalMs: 50,
		starBaseSizePx: 100,
		appearProbability: 0.04,
		approachDurationSec: 15,
		achievement: {
			id: "rapid-tap-master",
		},
	},
	{
		src: "/svg/object/death-star.svg",
		label: "death-star",
		maxHp: 30,
		meteorCount: 30,
		periodMs: 3000,
		healIntervalMs: 200,
		starBaseSizePx: 30,
		appearProbability: 0.02,
		approachDurationSec: 15,
		achievement: {
			id: "sniping-master",
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

const WARNING_MSG_1 = "未知の天体を検出。接近中。";
const WARNING_MSG_2 = "重力異常を確認。破壊せよ。";
/** 隕石フェーズが終わるまでの最大待機時間（脅威隕石の最大寿命 + バッファ） */
const METEOR_PHASE_END_MS = 55_000;

// ── HP / 破壊演出（微調整用）──────────────────────────────────
/** 実績に応じた開始インデックス確定後、この時間だけ待ってから星を表示しバウンス（初回のみ） */
const HOME_ORBIT_STAR_INTRO_DELAY_MS = 900;
const DEFAULT_HOME_ORBIT_METEOR_COUNT = 72;
/** 隕石のうち「手前に来る」方向の割合（脅威1体を除いた母集団に対して） */
const METEOR_TOWARD_CAMERA_RATIO = 0.3;
const METEOR_BOX_PX_MIN = 24;
const METEOR_BOX_PX_MAX = 64;
/** 隕石の命中判定（見た目より少し厳しめにする係数）。半径= (base*scale/2) * factor */
const METEOR_HIT_RADIUS_FACTOR = 0.82;
/** 弾側の命中半径をどれだけ加算するか（小さいほど厳しい） */
const BULLET_HIT_RADIUS_FACTOR = 0.55;
/** 脅威隕石の描画箱（px）。ほぼ 1px からスケールで成長 */
const METEOR_THREAT_BASE_PX = 1;
/** 脅威: この秒数で画面を覆うサイズまで線形成長（未到達時のフォールバックにも使用） */
const METEOR_THREAT_IMPACT_SEC = 40;
/** 脅威のみ。IMPACT 秒より長くし、到達前に消えないようにする */
const METEOR_THREAT_MAX_LIFE_SEC = 50;
const METEOR_MAX_LIFE_SEC = 28;
const METEOR_OFFSCREEN_MARGIN_PX = 420;
/** 「手前」隕石のスケール増分係数（秒に対して線形・頭打ちなし。旧 6.5s で +2.75 相当の傾き） */
const METEOR_TOWARD_SCALE_PER_SEC = 2.75 / 6.5;

const EXPLOSION_STAR_SCALE_END = 4;
const EXPLOSION_STAR_DURATION_SEC = 0.5;

const METEOR_SRC = "/svg/object/metor.svg";
/** 手前方向（toward）隕石撃破時の爆発 SVG（表示サイズは命中時の base×scale） */
const TOWARD_METEOR_EXPLOSION_SRC = "/svg/object/collision.svg";
const TOWARD_METEOR_EXPLOSION_DURATION_SEC = 0.48;
const EXPLOSION_STAR_EASE = "easeOut" as const;

/** ease-in: 遠くからゆっくり加速しながら接近する感覚（duration は星ごとに異なる） */
const STAR_APPROACH_EASE = [0.4, 0, 1, 1] as const;

type MeteorDepth = "threat" | "toward" | "away" | "lateral";

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

interface TowardHitExplosion {
	id: number;
	x: number;
	y: number;
	sizePx: number;
	rot: number;
}

function viewportCoverPx(): number {
	if (typeof window === "undefined") return 1200;
	return Math.hypot(window.innerWidth, window.innerHeight);
}

function playStarDamageSe(): void {
	if (!soundOutputRef.isPlaying) return;
	const audio = new Audio("/se/star-damage-se.mp3");
	audio.volume = effectiveSeVolume(0.3, soundOutputRef.masterVolume);
	audio.play().catch(() => {});
}

function spawnMeteors(count: number): MeteorSim[] {
	const out: MeteorSim[] = [];
	if (count <= 0) return out;

	const threatScale0 = 0.92 + Math.random() * 0.08;
	out.push({
		id: 0,
		x: 0,
		y: 0,
		vx: 0,
		vy: 0,
		depth: "threat",
		t0: performance.now(),
		baseSizePx: METEOR_THREAT_BASE_PX,
		scale0: threatScale0,
		scale: threatScale0 * 0.5,
		rot: 0,
		spin: ((Math.random() - 0.5) * 90 * Math.PI) / 180,
		alive: true,
	});

	for (let i = 1; i < count; i++) {
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
			x: depth === "toward" ? 0 : (Math.random() - 0.5) * 12,
			y: depth === "toward" ? 0 : (Math.random() - 0.5) * 12,
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

		if (m.depth === "threat") {
			const coverPx = viewportCoverPx();
			const scaleEnd = coverPx / METEOR_THREAT_BASE_PX;
			const scaleStart = m.scale0 * 0.5;
			const u = Math.min(1, t / METEOR_THREAT_IMPACT_SEC);
			m.scale = scaleStart + u * (scaleEnd - scaleStart);
			const rendered = m.baseSizePx * m.scale;
			const covered = rendered >= coverPx;
			const timeFallback = t >= METEOR_THREAT_IMPACT_SEC;
			if (covered || timeFallback) {
				m.alive = false;
				playStarDamageSe();
				orbitBridge.onScreenShake?.("large");
			} else if (t > METEOR_THREAT_MAX_LIFE_SEC) {
				m.alive = false;
			}
		} else if (m.depth === "toward") {
			m.scale = m.scale0 * (0.32 + METEOR_TOWARD_SCALE_PER_SEC * t);
		} else if (m.depth === "away") {
			m.scale = m.scale0 * Math.max(0.035, 1.08 * Math.exp(-t * 1.08));
		} else {
			m.scale = m.scale0 * (0.7 + 0.3 * (1 - Math.min(1, t / 8.5)));
		}
		m.rot += m.spin * dt;
		if (m.depth !== "threat") {
			if (
				Math.hypot(m.x, m.y) > maxDistFromCenterPx ||
				t > METEOR_MAX_LIFE_SEC
			) {
				m.alive = false;
			}
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
	const objects: readonly HomeOrbitObject[] =
		objectsProp.length > 0 ? objectsProp : HOME_ORBIT_OBJECTS;
	const objectsRef = useRef(objects);

	const { notifyStarted } = useHomeStarted();
	const setOrbitHud = useSyncHomeOrbitHud();
	const setIsEmergencyMode = useSyncIsEmergencyMode();
	const [currentIndex, setCurrentIndex] = useState<number | null>(null);
	const currentIndexRef = useRef(-1);
	const objectRef = useRef<HTMLDivElement>(null);
	const angleRef = useRef(0);
	const lastTimeRef = useRef<number | null>(null);
	const rafRef = useRef<number | null>(null);

	// HP system（開始インデックス確定までは 0。useLayoutEffect で同期）
	const hpRef = useRef<number>(0);
	const [displayHp, setDisplayHp] = useState<number>(0);
	const explodingRef = useRef(false);
	const [exploding, setExploding] = useState(false);
	const approachingRef = useRef(false);
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
	const [starEntranceSeq, setStarEntranceSeq] = useState(0);
	const [starSurfaceVisible, setStarSurfaceVisible] = useState(false);
	const starSurfaceVisibleRef = useRef(false);
	/** 現在の星が localStorage から復元されたものなら true（ポップ演出を使う） */
	const fromSavedRef = useRef(false);
	const [starIsFromSaved, setStarIsFromSaved] = useState(false);
	/** 接近/ポップ演出完了後 true になる。これが true になったタイミングで射撃解禁・HUD 表示 */
	const [isReadyToShoot, setIsReadyToShoot] = useState(false);
	/** 現在の星の接近演出秒数（RAF・transition・autoHideMs で共有） */
	const approachDurationSecRef = useRef(15);
	const introTimerRef = useRef<number | null>(null);
	const hasCompletedIntroDelayRef = useRef(false);
	const [towardHitExplosions, setTowardHitExplosions] = useState<
		TowardHitExplosion[]
	>([]);
	const towardExplosionNextIdRef = useRef(0);
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
	const [warningMessage, setWarningMessage] = useState<string | null>(null);
	const dismissWarning = useCallback(() => {
		// フェーズ1が消えたらフェーズ2へ、フェーズ2は手動クリアのみ
		setWarningMessage((prev) => (prev === WARNING_MSG_1 ? WARNING_MSG_2 : null));
	}, []);

	useEffect(() => {
		starSurfaceVisibleRef.current = starSurfaceVisible;
	}, [starSurfaceVisible]);

	// 星が出現するたびに接近フェーズ開始 + 警告スナックバーフェーズ1
	useEffect(() => {
		if (currentIndex === null) return;
		if (fromSavedRef.current) {
			// localStorage から復元された星: 軌道上の通常位置からポップ表示
			angleRef.current = Math.PI / 4;
			approachingRef.current = false;
		} else {
			// 新規出現: 後方から接近演出
			angleRef.current = -Math.PI / 2;
			approachingRef.current = true;
			setWarningMessage(WARNING_MSG_1);
		}
		// starEntranceSeq が変化したときのみ発火させる
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [starEntranceSeq]);

	/* objects / 実績に応じた開始インデックス・HP・表示を同期（親の objects 変更時も再計算） */
	/* eslint-disable react-hooks/set-state-in-effect -- 実績・objects に応じた軌道状態の一括同期 */
	useLayoutEffect(() => {
		if (introTimerRef.current !== null) {
			clearTimeout(introTimerRef.current);
			introTimerRef.current = null;
		}

		// 新しい星のサイクル開始時にリセット
		setIsReadyToShoot(false);

		objectsRef.current = objects;
		const resolved = resolveHomeOrbitStart(objects);

		// 星なし（全実績解除済み or 確率外れ）
		if (resolved.kind === "none") {
			currentIndexRef.current = -1;
			setCurrentIndex(null);
			setStarSurfaceVisible(false);
			hpRef.current = 0;
			setDisplayHp(0);
			return;
		}

		const i = resolved.index;
		currentIndexRef.current = i;
		setCurrentIndex(i);
		const entry = objects[i];
		if (!entry) return;
		hpRef.current = entry.maxHp;
		setDisplayHp(entry.maxHp);
		setExplosionOverlaySrc(entry.src);
		setExplosionStarDisplayPx(resolveStarBaseSizePx(entry));
		approachDurationSecRef.current = entry.approachDurationSec;

		fromSavedRef.current = resolved.fromSaved;

		if (!hasCompletedIntroDelayRef.current) {
			setStarSurfaceVisible(false);
			introTimerRef.current = window.setTimeout(() => {
				introTimerRef.current = null;
				hasCompletedIntroDelayRef.current = true;
				setStarIsFromSaved(fromSavedRef.current);
				setStarSurfaceVisible(true);
				setStarEntranceSeq((s) => s + 1);
			}, HOME_ORBIT_STAR_INTRO_DELAY_MS);
		} else {
			setStarIsFromSaved(resolved.fromSaved);
			setStarSurfaceVisible(true);
			setStarEntranceSeq((s) => s + 1);
		}

		return () => {
			if (introTimerRef.current !== null) {
				clearTimeout(introTimerRef.current);
				introTimerRef.current = null;
			}
		};
	}, [objects]);
	/* eslint-enable react-hooks/set-state-in-effect */

	const handleHit = useCallback(
		(damage: number) => {
			if (explodingRef.current) return;
			if (currentIndex === null) return;

			const list = objectsRef.current;
			const idx = currentIndex;

			hpRef.current -= damage;
			setDisplayHp(Math.max(0, hpRef.current));
			if (hpRef.current <= 0) {
				// 爆発開始 → 隕石フェーズ（全隕石消滅後またはフォールバックで自動クリーンアップ）
				explodingRef.current = true;
				const hitObject = list[idx] as HomeOrbitObject;
				setExplosionOverlaySrc(hitObject.src);
				setExplosionStarDisplayPx(resolveStarBaseSizePx(hitObject));
				frozenExplosionPosRef.current = { ...lastPosRef.current };
				setExplosionAnchorFrozen({ ...lastPosRef.current });
				const ach = hitObject.achievement;
				if (ach) {
					const isFirst = tryUnlockAchievement(ach.id);
					if (isFirst && ach.id === HOME_FIRST_ACHIEVEMENT_ID) {
						notifyStarted();
					}
				}
				clearActiveOrbitStar();
				setWarningMessage(null);
				setAchievementToastMessage("任務完了。重力の正常を確認。");
				if (objectRef.current) objectRef.current.style.visibility = "hidden";

				playStarDamageSe();
				orbitBridge.onScreenShake?.("medium");

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
				// 星は自動復活しない。全隕石消滅時に RAF ループがクリーンアップする。
				// フォールバックとして最大待機時間後に強制クリーンアップ
				window.setTimeout(() => {
					if (!meteorPhaseRef.current) return;
					meteorPhaseRef.current = false;
					orbitBridge.isMeteorPhase = false;
					orbitBridge.clientX = -1000;
					orbitBridge.clientY = -1000;
					orbitBridge.hitRadius = 0;
					setMeteorPhase(false);
					meteorSimsRef.current = [];
					setMeteorsForRender([]);
					setTowardHitExplosions([]);
					setExplosionAnchorFrozen(null);
					explodingRef.current = false;
					setExploding(false);
					currentIndexRef.current = -1;
					setCurrentIndex(null);
					setStarSurfaceVisible(false);
					hpRef.current = 0;
					setDisplayHp(0);
				}, METEOR_PHASE_END_MS);
			}
		},
		[currentIndex, notifyStarted],
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
				const halfSide = (m.baseSizePx * m.scale) / 2;
				const meteorR = halfSide * METEOR_HIT_RADIUS_FACTOR;
				const bulletR = bulletRadiusPx * BULLET_HIT_RADIUS_FACTOR;
				const rad = meteorR + bulletR;
				if (Math.hypot(clientX - mcx, clientY - mcy) < rad) {
					playStarDamageSe();
					orbitBridge.onScreenShake?.("small");
					if (m.depth === "toward") {
						const eid = ++towardExplosionNextIdRef.current;
						const sizePx = m.baseSizePx * m.scale;
						setTowardHitExplosions((prev) => [
							...prev,
							{ id: eid, x: m.x, y: m.y, sizePx, rot: m.rot },
						]);
						window.setTimeout(() => {
							setTowardHitExplosions((prev) =>
								prev.filter((e) => e.id !== eid),
							);
						}, TOWARD_METEOR_EXPLOSION_DURATION_SEC * 1000 + 80);
					}
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
		if (currentIndex === null || !starSurfaceVisible) return;
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
	}, [objects, currentIndex, starSurfaceVisible]);

	useEffect(() => {
		currentIndexRef.current = currentIndex ?? -1;
	}, [currentIndex]);

	useEffect(() => {
		const animate = (time: number) => {
			if (!explodingRef.current) {
				const idxRaw = currentIndexRef.current;

				if (lastTimeRef.current !== null && idxRaw >= 0) {
					const delta = time - lastTimeRef.current;
					if (approachingRef.current) {
						// 接近中: 後方→前方を固定角速度で通過
						angleRef.current += (Math.PI / approachDurationSecRef.current) * (delta / 1000);
					} else {
						const speedMult =
							Math.sin(angleRef.current) > 0 ? SPEED_LEFT : SPEED_RIGHT;
						const list = objectsRef.current;
						const idx = idxRaw % list.length;
						const periodMs = list[idx]?.periodMs ?? 10000;
						angleRef.current +=
							(delta / periodMs) * 2 * Math.PI * speedMult;
					}
				}

				const ta = angleRef.current;
				const xLocal = A * Math.cos(ta);
				const yLocal = B * Math.sin(ta);
				const x = xLocal * COS_TILT - yLocal * SIN_TILT + ORBIT_CENTER_X;
				const y = xLocal * SIN_TILT + yLocal * COS_TILT + ORBIT_CENTER_Y;

				const depth = (Math.sin(ta) + 1) / 2;
				const scale = SCALE_MIN + depth * (SCALE_MAX - SCALE_MIN);
				const zIndex = Math.sin(ta) > 0 ? 10 : 1;

				if (
					objectRef.current &&
					idxRaw >= 0 &&
					starSurfaceVisibleRef.current
				) {
					objectRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
					objectRef.current.style.zIndex = String(zIndex);

					const containerEl = objectRef.current.parentElement;
					const rect = containerEl?.getBoundingClientRect();
					if (rect) {
						orbitBridge.clientX = rect.left + rect.width / 2 + x;
						orbitBridge.clientY = rect.top + rect.height / 2 + y;
						const list = objectsRef.current;
						const idx = idxRaw % list.length;
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
			} else if (
				meteorPhaseRef.current &&
				meteorSimsRef.current.length > 0
			) {
				// 全隕石消滅 → クリーンアップ（次の星は出現しない）
				meteorPhaseRef.current = false;
				orbitBridge.isMeteorPhase = false;
				orbitBridge.clientX = -1000;
				orbitBridge.clientY = -1000;
				orbitBridge.hitRadius = 0;
				setMeteorPhase(false);
				meteorSimsRef.current = [];
				setMeteorsForRender([]);
				setTowardHitExplosions([]);
				setExplosionAnchorFrozen(null);
				explodingRef.current = false;
				setExploding(false);
				currentIndexRef.current = -1;
				setCurrentIndex(null);
				setStarSurfaceVisible(false);
				hpRef.current = 0;
				setDisplayHp(0);
				lastMeteorPhysicsAtRef.current = null;
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

	const currentObject =
		currentIndex !== null ? objects[currentIndex] : undefined;
	useEffect(() => {
		if (!setOrbitHud) return;
		if (meteorPhase) {
			setOrbitHud(null);
			return;
		}
		if (
			!isReadyToShoot ||
			currentIndex === null ||
			!starSurfaceVisible ||
			currentObject === undefined
		) {
			setOrbitHud(null);
			return;
		}
		setOrbitHud({ starHp: displayHp, maxStarHp: currentObject.maxHp });
	}, [
		meteorPhase,
		isReadyToShoot,
		setOrbitHud,
		displayHp,
		currentObject,
		currentIndex,
		starSurfaceVisible,
	]);

	useEffect(() => {
		return () => {
			setOrbitHud?.(null);
		};
	}, [setOrbitHud]);

	// 緊急モード同期: 演出完了（射撃解禁）または隕石フェーズ中なら true
	useEffect(() => {
		setIsEmergencyMode?.(isReadyToShoot || meteorPhase);
	}, [isReadyToShoot, meteorPhase, setIsEmergencyMode]);

	useEffect(() => {
		return () => {
			setIsEmergencyMode?.(false);
		};
	}, [setIsEmergencyMode]);

	const orbitStarSizePx = currentObject
		? resolveStarBaseSizePx(currentObject)
		: 0;
	const explosionPos = explosionAnchorFrozen ?? { x: 0, y: 0 };

	return (
		<div className="flex flex-col items-center gap-3">
			<HomeAchievementToast
				open={achievementToastMessage !== null}
				message={achievementToastMessage ?? ""}
				onDismiss={dismissAchievementToast}
				variant="success"
			/>
			<HomeAchievementToast
				open={warningMessage !== null}
				message={warningMessage ?? ""}
				onDismiss={dismissWarning}
				variant={warningMessage === WARNING_MSG_1 ? "danger" : "warning"}
				autoHideMs={warningMessage === WARNING_MSG_1 ? (currentObject?.approachDurationSec ?? 15) * 1000 : 0}
			/>
		<div ref={orbitFieldRef} className="relative inline-flex items-center justify-center">
			{/* z-5: ロゴ文字のスタッキングコンテキスト */}
			<PukapukaLogo size="large" className="relative z-5" disableInteraction />
			{currentIndex !== null &&
				starSurfaceVisible &&
				currentObject !== undefined &&
				orbitStarSizePx > 0 && (
					<div
						ref={objectRef}
						className="absolute top-1/2 left-1/2 opacity-100"
						style={{
							width: orbitStarSizePx,
							height: orbitStarSizePx,
						}}
					>
						<motion.div
							key={starEntranceSeq}
							className="relative h-full w-full"
							initial={starIsFromSaved ? { scale: 0, opacity: 0 } : { scale: 0.02, opacity: 1 }}
							animate={{ scale: 1, opacity: 1 }}
							transition={
								starIsFromSaved
									? { duration: 0.32, ease: [0, 0.8, 0.3, 1.1] }
									: { duration: currentObject?.approachDurationSec ?? 15, ease: STAR_APPROACH_EASE }
							}
							onAnimationComplete={() => {
								approachingRef.current = false;
								if (starIsFromSaved) {
									// ポップ完了 → 黄色スナックバー + 射撃解禁
									setWarningMessage(WARNING_MSG_2);
								} else {
									// 接近演出完了（軌道に乗ったタイミング）で localStorage に保存
									const idx = currentIndexRef.current;
									if (idx >= 0) setActiveOrbitStar(idx);
								}
								// 演出完了 = 黄スナックと同時に射撃解禁・HUD 表示
								setIsReadyToShoot(true);
							}}
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
						</motion.div>
					</div>
				)}

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
				towardHitExplosions.map((ex) => (
					<div
						key={`toward-boom-${ex.id}`}
						className="absolute top-1/2 left-1/2 pointer-events-none z-32"
						style={{
							width: ex.sizePx,
							height: ex.sizePx,
							transform: `translate(calc(-50% + ${explosionPos.x + ex.x}px), calc(-50% + ${explosionPos.y + ex.y}px)) rotate(${ex.rot}rad)`,
						}}
					>
						<motion.div
							className="h-full w-full"
							initial={{ scale: 0.88, opacity: 1 }}
							animate={{
								scale: 1.45,
								opacity: 0,
							}}
							transition={{
								duration: TOWARD_METEOR_EXPLOSION_DURATION_SEC,
								ease: EXPLOSION_STAR_EASE,
							}}
						>
							<Image
								src={TOWARD_METEOR_EXPLOSION_SRC}
								alt=""
								fill
								className="object-contain"
							/>
						</motion.div>
					</div>
				))}
			{meteorPhase &&
				meteorsForRender
					.filter((m) => m.alive)
					.map((m) => (
								<div
									key={m.id}
									className={
										m.depth === "threat"
											? "absolute top-1/2 left-1/2 pointer-events-none z-40 drop-shadow-[0_0_12px_rgba(255,90,40,0.45)]"
											: "absolute top-1/2 left-1/2 pointer-events-none z-30"
									}
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
