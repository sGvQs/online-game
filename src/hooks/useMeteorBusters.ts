"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { resetAllReady } from "@/server/actions/room";
import {
	startMeteorBustersMatch,
	finishMeteorBustersMatch,
	getMeteorBustersMatch,
} from "@/server/actions/game";
import {
	DIFFICULTY_CONFIG,
	BOSS_CONFIG,
	DAMAGE_MATCH,
	DAMAGE_MISMATCH,
	BULLET_HIT_RADIUS,
	MAX_Y_OFFSET,
	GAME_END_DELAY_MS,
	CLEAR_RATE,
	GLOW_COLORS,
	ORBIT_TRACKS,
	ORBIT_CENTER_Y_RATIO,
	CHAIN_RANGE_RATIO,
	CHAIN_SPREAD_MS,
	CHAIN_DAMAGE,
} from "@/constants/meteorBustersGame/gameConfig";
import { makeBulletAnims } from "@/lib/shooter/trajectory";
import { SHOOTER_AMMO_MAX, SHOOTER_BULLET_SPEED_PX_S } from "@/lib/shooter/config";
import { useSE } from "./useSE";
import type {
	MeteorObject,
	PlayerCursorState,
	MeteorBulletType,
	MeteorDifficulty,
	MeteorBustersPhase,
	MeteorBustersResult,
	BulletAnim,
} from "@/types";
import type { CollisionFx } from "@/components/game/common/shooter/ShooterCollisionFx";

export type { BulletAnim };

// ============================================
// Broadcast ペイロード型
// ============================================

interface ShotPayload {
	playerId: string;
	bulletType: MeteorBulletType;
	cursorXPct: number; // cursor X as fraction 0-1 of container width
	cursorYPct: number; // cursor Y as fraction 0-1 of container height
	meteorId: string | null;
}

interface CursorPayload {
	playerId: string;
	xPct: number;
	yPct: number;
	bulletType: MeteorBulletType;
}

interface MeteorSpawnPayload {
	id: string;
	type: MeteorBulletType;
	orbitTrack: number;
	hp: number;
	maxHp: number;
	yOffset: number;
	orbitDurationMs: number;
	spawnAngle: number;
	collisionAngle: number;
	spawnTime: number;
	isBoss: boolean;
	isFinalBoss: boolean;
	sizeFactor: number;
	totalSpawned: number; // ホストの累積 spawnedCount（ゲスト側の自己修正用）
}

interface MeteorUpdatePayload {
	meteorId: string;
	hp: number;
	totalSpawned: number; // ホストの累積 spawnedCount（ゲスト側の自己修正用）
	shooterId?: string; // hp === 0 のときのみ付与（ゲスト側スコア同期用）
}

interface MeteorMissedPayload {
	meteorId: string;
	totalSpawned: number; // 同上
}

interface GameStartPayload {
	matchId: string;
	difficulty: MeteorDifficulty;
}

interface DifficultySelectPayload {
	difficulty: MeteorDifficulty;
}

interface GameEndPayload {
	destroyedCount: number;
	spawnedCount: number;
	destroyRate: number;
	isCleared: boolean;
}

// ============================================
// Hook の戻り値
// ============================================

export interface UseMeteorBustersReturn {
	phase: MeteorBustersPhase;
	difficulty: MeteorDifficulty;
	titleDifficulty: MeteorDifficulty;
	handleDifficultySelect: (difficulty: MeteorDifficulty) => void;
	meteors: MeteorObject[];
	bulletType: MeteorBulletType;
	ammoRemaining: number;
	playerCursors: PlayerCursorState[];
	bulletAnims: BulletAnim[];
	collisions: CollisionFx[];
	result: MeteorBustersResult | null;
	destroyedCount: number;
	spawnedCount: number;
	totalSpawnCount: number;
	/** プレイヤーごとの撃破数 (userId → count) */
	playerScores: Record<string, number>;
	isProcessing: boolean;
	handleStartGame: (difficulty: MeteorDifficulty) => Promise<void>;
	handleShoot: (cursorX: number, cursorY: number, containerRect: DOMRect) => void;
	handleReload: () => void;
	handleSwitchBullet: () => void;
	handleCursorMove: (x: number, y: number) => void;
	handleReturnToTitle: () => void;
	/** チュートリアル用: ステップ4完了時に呼ぶと隕石スポーンが開始される */
	unlockTutorialSpawn: () => void;
}


// ============================================
// Hook 本体
// ============================================

export function useMeteorBusters({
	roomId,
	isHost,
	initialMatchId,
	currentUserId,
	containerRef,
	onShake,
}: {
	roomId: string;
	isHost: boolean;
	initialMatchId: string | null;
	currentUserId: string;
	containerRef: React.RefObject<HTMLDivElement | null>;
	/** 隕石撃破時などに呼ぶスクリーンシェイクコールバック */
	onShake?: (strength: "small" | "medium" | "large") => void;
}): UseMeteorBustersReturn {
	const supabase = createClient();
	const { play } = useSE();

	// ---- State ----
	const [phase, setPhase] = useState<MeteorBustersPhase>("TITLE");
	const [difficulty, setDifficulty] = useState<MeteorDifficulty>("NORMAL");
	const [titleDifficulty, setTitleDifficulty] = useState<MeteorDifficulty>("NORMAL");
	const [meteors, setMeteors] = useState<MeteorObject[]>([]);
	const [bulletType, setBulletType] = useState<MeteorBulletType>("A");
	const [ammoRemaining, setAmmoRemaining] = useState(SHOOTER_AMMO_MAX);
	const [playerCursors, setPlayerCursors] = useState<PlayerCursorState[]>([]);
	const [bulletAnims, setBulletAnims] = useState<BulletAnim[]>([]);
	const [collisions, setCollisions] = useState<CollisionFx[]>([]);
	const [result, setResult] = useState<MeteorBustersResult | null>(null);
	const [destroyedCount, setDestroyedCount] = useState(0);
	const [spawnedCount, setSpawnedCount] = useState(0);
	const [totalSpawnCount, setTotalSpawnCount] = useState(0);
	const [playerScores, setPlayerScores] = useState<Record<string, number>>({});
	const [isProcessing, setIsProcessing] = useState(false);

	// ---- Refs ----
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const matchIdRef = useRef<string | null>(initialMatchId);
	const difficultyRef = useRef<MeteorDifficulty>("NORMAL");
	const spawnedCountRef = useRef(0);
	const destroyedCountRef = useRef(0);
	const missedCountRef = useRef(0);
	const playerScoresRef = useRef<Record<string, number>>({});
	const totalSpawnCountRef = useRef(0);
	const meteorsRef = useRef<Map<string, MeteorObject>>(new Map());
	/** ゲスト側: 受信済み meteor_spawn の ID セット（リトライ重複排除用） */
	const receivedMeteorIdsRef = useRef<Set<string>>(new Set());
	const bulletTypeRef = useRef<MeteorBulletType>("A");
	const ammoRef = useRef(SHOOTER_AMMO_MAX);
	const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const rafRef = useRef<number | null>(null);
	const gameStartTimeRef = useRef<number>(0);
	const phaseRef = useRef<MeteorBustersPhase>("TITLE");
	const cursorThrottleRef = useRef<number>(0);
	/** 最後の射撃カーソル位置（命中FX表示に使用） */
	const lastShotCursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
	const checkGameEndRef = useRef<() => void>(() => {});
	const initGameRef = useRef<(diff: MeteorDifficulty) => void>(() => {});
	/** ホストとしてリロード復帰した場合に true（subscribe 完了後に host_resumed を broadcast するため） */
	const resumedAsHostRef = useRef(false);
	/** RAF フレームカウンタ（setMeteors 間引き用） */
	const rafFrameCountRef = useRef(0);
	/** spawnNextMeteor の実呼び出し回数（ボスの effectiveCount に左右されないインターバル判定用） */
	const spawnCallCountRef = useRef(0);
	/** チュートリアル用スポーンゲート。TUTORIAL 難易度では unlockTutorialSpawn() が呼ばれるまで隕石を出さない */
	const tutorialSpawnUnlockedRef = useRef(false);
	/** ボット tick 関数（tickMeteors RAF に統合するための ref） */
	const botTickRef = useRef<(() => void) | null>(null);
	const getMeteorScreenPosRef = useRef<typeof getMeteorScreenPos | null>(null);
	const playRef = useRef<typeof play>(play);
	const onShakeRef = useRef<typeof onShake>(onShake);

	useEffect(() => {
		phaseRef.current = phase;
	}, [phase]);

	// ============================================
	// ユーティリティ
	// ============================================

	const generateMeteorId = () =>
		`meteor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

	const getMeteorScreenPos = useCallback(
		(angle: number, yOffset: number, containerRect: DOMRect, orbitTrack: number) => {
			const w = containerRect.width;
			const track = ORBIT_TRACKS[orbitTrack];
			if (!track) return { x: w / 2, y: containerRect.height * ORBIT_CENTER_Y_RATIO };
			const cx = w / 2 + w * track.offsetX;
			const cy = containerRect.height * ORBIT_CENTER_Y_RATIO + containerRect.height * track.offsetY;
			const rx = w * track.rx;
			const ry = w * track.ry;
			const cosTilt = Math.cos(track.tilt);
			const sinTilt = Math.sin(track.tilt);
			const xLocal = rx * Math.cos(angle);
			const yLocal = ry * Math.sin(angle);
			const x = cx + xLocal * cosTilt - yLocal * sinTilt;
			const y = cy + xLocal * sinTilt + yLocal * cosTilt + yOffset;
			return { x, y };
		},
		[],
	);

	const tickMeteors = useCallback(() => {
		rafFrameCountRef.current++;

		// ボット tick を統合実行（別 RAF ループを持たないようにする）
		botTickRef.current?.();

		const now = performance.now();
		let hasChange = false;
		const newCollisionFxs: CollisionFx[] = [];

		for (const meteor of meteorsRef.current.values()) {
			if (meteor.destroyed) continue;

			const elapsed = now - meteor.spawnTime;
			const progress = Math.min(elapsed / meteor.orbitDurationMs, 1);
			const angle =
				meteor.spawnAngle + progress * (meteor.collisionAngle - meteor.spawnAngle);

			if (progress >= 1) {
				// 執着地点で爆発（恐竜が壊した演出）
				const rect = containerRef.current?.getBoundingClientRect();
				if (rect) {
					const pos = getMeteorScreenPos(meteor.collisionAngle, 0, rect, meteor.orbitTrack);
					newCollisionFxs.push({ id: `dino_fx_${meteor.id}_${now}`, x: pos.x, y: pos.y });
				}
				if (isHost) {
					channelRef.current?.send({
						type: "broadcast",
						event: "meteor_missed",
						payload: { meteorId: meteor.id, totalSpawned: spawnedCountRef.current } satisfies MeteorMissedPayload,
					});
					const effectiveCount = meteor.isBoss
						? (BOSS_CONFIG[difficultyRef.current]?.effectiveCount ?? 1)
						: 1;
					missedCountRef.current += effectiveCount;
					checkGameEndRef.current();
				}
				meteorsRef.current.delete(meteor.id);
				hasChange = true;
				continue;
			}

			const updatedMeteor = { ...meteor, angle };
			meteorsRef.current.set(meteor.id, updatedMeteor);
			hasChange = true;
		}

		if (newCollisionFxs.length > 0) {
			setCollisions((prev) => [...prev, ...newCollisionFxs]);
			for (const fx of newCollisionFxs) {
				setTimeout(() => {
					setCollisions((prev) => prev.filter((c) => c.id !== fx.id));
				}, 600);
			}
		}

		// setMeteors は2フレームに1回に間引いて React 再レンダーコストを半減
		if (hasChange && rafFrameCountRef.current % 2 === 0) {
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		}

		rafRef.current = requestAnimationFrame(tickMeteors);
	}, [isHost, getMeteorScreenPos]);

	// ============================================
	// ホスト: 隕石スポーン管理
	// ============================================

	const spawnNextMeteor = useCallback(() => {
		if (phaseRef.current !== "PLAYING") return;
		if (spawnedCountRef.current >= totalSpawnCountRef.current) return;
		if (difficultyRef.current === "TUTORIAL" && !tutorialSpawnUnlockedRef.current) return;

		const diff = difficultyRef.current;
		const config = DIFFICULTY_CONFIG[diff];
		const bossConfig = BOSS_CONFIG[diff];
		const remaining = totalSpawnCountRef.current - spawnedCountRef.current;
		spawnCallCountRef.current += 1;

		// ボス判定
		let isBoss = false;
		let isFinalBoss = false;
		let meteorHp = config.meteorHp;
		let bossSpeedFactor = 1.0;
		let sizeFactor = 1.0;
		if (bossConfig) {
			if (remaining <= bossConfig.finalTriggerRemaining) {
				// 最終ボス
				isBoss = true;
				isFinalBoss = true;
				meteorHp = bossConfig.finalHp;
				bossSpeedFactor = bossConfig.finalSpeedFactor;
				sizeFactor = bossConfig.finalSizeFactor;
			} else if (
				bossConfig.regularInterval > 0 &&
				spawnCallCountRef.current % bossConfig.regularInterval === 0
			) {
				// 通常ボス（HARD のみ）。effectiveCount に左右されないよう実呼び出し回数で判定
				isBoss = true;
				meteorHp = bossConfig.regularHp;
				bossSpeedFactor = bossConfig.regularSpeedFactor;
				sizeFactor = bossConfig.regularSizeFactor;
			}
		}

		const types: MeteorBulletType[] = ["A", "B", "C"];
		const type = types[Math.floor(Math.random() * 3)];
		const yOffset = (Math.random() * 2 - 1) * MAX_Y_OFFSET;
		const orbitTrack = Math.floor(Math.random() * ORBIT_TRACKS.length);
		const track = ORBIT_TRACKS[orbitTrack];
		const meteor: Omit<MeteorSpawnPayload, "totalSpawned"> = {
			id: generateMeteorId(),
			type,
			orbitTrack,
			hp: meteorHp,
			maxHp: meteorHp,
			yOffset,
			orbitDurationMs: (config.orbitDurationMs / track.speedMultiplier) * bossSpeedFactor,
			spawnAngle: track.spawnAngle,
			collisionAngle: track.collisionAngles[Math.floor(Math.random() * track.collisionAngles.length)],
			spawnTime: performance.now(),
			isBoss,
			isFinalBoss,
			sizeFactor,
		};

		const meteorObj: MeteorObject = {
			...meteor,
			angle: track.spawnAngle,
			destroyed: false,
		};
		meteorsRef.current.set(meteor.id, meteorObj);

		// ボスは有効隕石換算 effectiveCount 個分をカウント
		const effectiveCount = isBoss ? (bossConfig?.effectiveCount ?? 1) : 1;
		spawnedCountRef.current += effectiveCount;
		setSpawnedCount(spawnedCountRef.current);

		const spawnPayload = { ...meteor, totalSpawned: spawnedCountRef.current };
		channelRef.current?.send({ type: "broadcast", event: "meteor_spawn", payload: spawnPayload });

		// fire-and-forget 欠損対策リトライ（ゲスト側は receivedMeteorIdsRef で重複排除）
		[700, 1800].forEach((delay) => {
			setTimeout(() => {
				if (phaseRef.current !== "PLAYING") return;
				channelRef.current?.send({ type: "broadcast", event: "meteor_spawn", payload: spawnPayload });
			}, delay);
		});

		if (spawnedCountRef.current < totalSpawnCountRef.current) {
			spawnTimerRef.current = setTimeout(
				spawnNextMeteor,
				config.spawnIntervalMs,
			);
		}
	}, []);

	// ============================================
	// ゲーム終了処理
	// ============================================

	const handleGameEnd = useCallback(
		async (payload: GameEndPayload) => {
			phaseRef.current = "RESULT";
			setPhase("RESULT");
			setResult(payload);

			if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
			if (endTimerRef.current) clearTimeout(endTimerRef.current);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);

			if (payload.isCleared) {
				play("tada");
			}

			if (isHost && matchIdRef.current) {
				await finishMeteorBustersMatch(
					matchIdRef.current,
					roomId,
					payload.destroyedCount,
					payload.spawnedCount,
				);
			}
		},
		[isHost, roomId, play],
	);

	// ============================================
	// 全隕石消滅チェック（ホストのみ）
	// ============================================

	const checkGameEnd = useCallback(() => {
		if (!isHost) return;
		if (phaseRef.current !== "PLAYING") return;
		if (spawnedCountRef.current < totalSpawnCountRef.current) return;
		const eliminated = destroyedCountRef.current + missedCountRef.current;
		if (eliminated < totalSpawnCountRef.current) return;

		const destroyed = destroyedCountRef.current;
		const spawned = spawnedCountRef.current;
		const rate = spawned > 0 ? destroyed / spawned : 0;
		const isCleared = rate >= CLEAR_RATE;

		const endPayload = {
			destroyedCount: destroyed,
			spawnedCount: spawned,
			destroyRate: rate,
			isCleared,
		} satisfies GameEndPayload;

		channelRef.current?.send({ type: "broadcast", event: "game_end", payload: endPayload });

		// fire-and-forget の欠損リスクに備えてリトライ（ゲスト側リスナーは冪等）
		[600, 1500].forEach((delay) => {
			setTimeout(() => {
				if (phaseRef.current !== "RESULT") return;
				channelRef.current?.send({ type: "broadcast", event: "game_end", payload: endPayload });
			}, delay);
		});

		handleGameEnd(endPayload);
	}, [isHost, handleGameEnd]);

	// checkGameEnd を ref に同期（tickMeteors から deps なしで呼べるように）
	useEffect(() => {
		checkGameEndRef.current = checkGameEnd;
	}, [checkGameEnd]);

	// getMeteorScreenPos / play / onShake を ref に同期（Realtime useEffect から deps なしで呼べるように）
	useEffect(() => {
		getMeteorScreenPosRef.current = getMeteorScreenPos;
	}, [getMeteorScreenPos]);
	useEffect(() => {
		playRef.current = play;
	}, [play]);
	useEffect(() => {
		onShakeRef.current = onShake;
	}, [onShake]);

	// ============================================
	// アクションハンドラ
	// ============================================

	const handleStartGame = useCallback(
		async (selectedDifficulty: MeteorDifficulty) => {
			if (!isHost || isProcessing) return;
			setIsProcessing(true);
			try {
				await resetAllReady(roomId);
				const match = await startMeteorBustersMatch(roomId, selectedDifficulty);
				matchIdRef.current = match.id;

				channelRef.current?.send({
					type: "broadcast",
					event: "game_start",
					payload: {
						matchId: match.id,
						difficulty: selectedDifficulty,
					} satisfies GameStartPayload,
				});

				initGame(selectedDifficulty);
			} catch (err) {
				console.error("ゲーム開始失敗:", err);
			} finally {
				setIsProcessing(false);
			}
		},
		[isHost, isProcessing, roomId],
	);

	const initGame = useCallback((diff: MeteorDifficulty) => {
		const config = DIFFICULTY_CONFIG[diff];
		difficultyRef.current = diff;
		totalSpawnCountRef.current = config.totalSpawnCount;
		spawnedCountRef.current = 0;
		destroyedCountRef.current = 0;
		missedCountRef.current = 0;
		spawnCallCountRef.current = 0;
		tutorialSpawnUnlockedRef.current = false;
		meteorsRef.current.clear();
		receivedMeteorIdsRef.current.clear();
		gameStartTimeRef.current = performance.now();

		playerScoresRef.current = {};

		setDifficulty(diff);
		setTotalSpawnCount(config.totalSpawnCount);
		setSpawnedCount(0);
		setDestroyedCount(0);
		setPlayerScores({});
		setMeteors([]);
		setBulletType("A");
		bulletTypeRef.current = "A";
		setAmmoRemaining(SHOOTER_AMMO_MAX);
		ammoRef.current = SHOOTER_AMMO_MAX;
		setBulletAnims([]);
		setPhase("PLAYING");
		phaseRef.current = "PLAYING";

		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(tickMeteors);

		if (isHost) {
			if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
			spawnTimerRef.current = setTimeout(spawnNextMeteor, 500);
		}
	}, [isHost, tickMeteors, spawnNextMeteor]);

	// initGame を ref に同期（マウント時復帰 useEffect から deps なしで呼べるように）
	useEffect(() => {
		initGameRef.current = initGame;
	}, [initGame]);

	/** 弾アニメを追加してタイムアウトで削除 */
	const addBulletAnims = useCallback((anims: BulletAnim[]) => {
		setBulletAnims((prev) => [...prev, ...anims]);
		const maxDuration = Math.max(...anims.map((a) => a.durationSec));
		const ids = new Set(anims.map((a) => a.id));
		setTimeout(() => {
			setBulletAnims((prev) => prev.filter((a) => !ids.has(a.id)));
		}, maxDuration * 1000 + 150);
	}, []);

	/** 射撃 */
	const handleShoot = useCallback(
		(cursorX: number, cursorY: number, containerRect: DOMRect) => {
			if (phaseRef.current !== "PLAYING") return;

			if (ammoRef.current <= 0) {
				play("cannot-shoot");
				return;
			}

			const w = containerRect.width;
			const h = containerRect.height;

			// 弾数消費 & 発射SE
			ammoRef.current = Math.max(0, ammoRef.current - 1);
			setAmmoRemaining(ammoRef.current);
			play("shooting");

			// 両下角から弾アニメ生成（弾種色で色付け）
			const idPrefix = `anim_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
			const bulletColor = GLOW_COLORS[bulletTypeRef.current];
			const anims = makeBulletAnims(cursorX, cursorY, w, h, idPrefix, bulletColor);
			addBulletAnims(anims);

			// カーソル付近の隕石を探す（当たり判定は隕石の表示サイズに比例）
			let closestMeteor: MeteorObject | null = null;
			let closestDist = Infinity;
			for (const meteor of meteorsRef.current.values()) {
				if (meteor.destroyed) continue;
				const track = ORBIT_TRACKS[meteor.orbitTrack];
				if (!track) continue;
				const depth = Math.sin(meteor.angle);
				const scale = track.minScale + (track.maxScale - track.minScale) * ((depth + 1) / 2);
				// sizePx = 48 * scale * sizeFactor、その半径分を当たり判定とする（最低 16px）
				const hitRadius = Math.max(16, 24 * scale * meteor.sizeFactor);
				const pos = getMeteorScreenPos(meteor.angle, meteor.yOffset, containerRect, meteor.orbitTrack);
				const dist = Math.hypot(pos.x - cursorX, pos.y - cursorY);
				if (dist < hitRadius && dist < closestDist) {
					closestDist = dist;
					closestMeteor = meteor;
				}
			}

			const currentBulletType = bulletTypeRef.current;

			// 命中FX・シェイク用にカーソル位置を記憶
			lastShotCursorRef.current = { x: cursorX, y: cursorY };

			// Broadcast
			channelRef.current?.send({
				type: "broadcast",
				event: "shot",
				payload: {
					playerId: currentUserId,
					bulletType: currentBulletType,
					cursorXPct: cursorX / w,
					cursorYPct: cursorY / h,
					meteorId: closestMeteor?.id ?? null,
				} satisfies ShotPayload,
			});

			const travelMs = Math.max(...anims.map((a) => a.durationSec)) * 1000;

			if (closestMeteor) {
				if (isHost) {
					// ホストがダメージ計算（弾の飛行時間だけ遅延させて視覚と同期）
					const meteorId = closestMeteor.id;
					setTimeout(() => {
						applyDamage(meteorId, currentBulletType, currentUserId);
					}, travelMs);
				} else {
					// 非ホストは命中FXだけローカルで生成（ダメージはホストが処理）
					setTimeout(() => {
						const fxId = `fx_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
						setCollisions((prev) => [...prev, { id: fxId, x: cursorX, y: cursorY }]);
						setTimeout(() => {
							setCollisions((prev) => prev.filter((c) => c.id !== fxId));
						}, 600);
					}, travelMs);
				}
			}
		},
		[isHost, currentUserId, getMeteorScreenPos, play, addBulletAnims],
	);

	/** ダメージ適用（ホストのみ） */
	const applyDamage = useCallback(
		(meteorId: string, bulletType: MeteorBulletType, _shooterId: string, overrideDamage?: number, fxPosition?: { x: number; y: number }) => {
			const meteor = meteorsRef.current.get(meteorId);
			if (!meteor || meteor.destroyed) return;

			const damage = overrideDamage ?? (meteor.type === bulletType ? DAMAGE_MATCH : DAMAGE_MISMATCH);
			const newHp = Math.max(0, meteor.hp - damage);

			// 命中FX（連鎖時は隕石位置、通常はカーソル位置）
			const { x: fx, y: fy } = fxPosition ?? lastShotCursorRef.current;
			const fxId = `fx_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
			setCollisions((prev) => [...prev, { id: fxId, x: fx, y: fy }]);
			setTimeout(() => {
				setCollisions((prev) => prev.filter((c) => c.id !== fxId));
			}, 600);

			if (newHp <= 0) {
				const updated = { ...meteor, hp: 0, destroyed: true };
				meteorsRef.current.set(meteorId, updated);
				const effectiveCount = meteor.isBoss
					? (BOSS_CONFIG[difficultyRef.current]?.effectiveCount ?? 1)
					: 1;
				destroyedCountRef.current += effectiveCount;
				setDestroyedCount(destroyedCountRef.current);

				// ホスト側プレイヤースコア更新（連鎖は "__chain__" のため除外）
				if (_shooterId !== "__chain__") {
					playerScoresRef.current = {
						...playerScoresRef.current,
						[_shooterId]: (playerScoresRef.current[_shooterId] ?? 0) + effectiveCount,
					};
					setPlayerScores({ ...playerScoresRef.current });
				}

				// 中ボス破壊時: 連鎖破壊（ホストのみ、波紋リングなし）
				if (meteor.isBoss && !meteor.isFinalBoss && isHost && getMeteorScreenPosRef.current) {
					const rect = containerRef.current?.getBoundingClientRect();
					if (rect) {
						const bossPos = getMeteorScreenPosRef.current(meteor.angle, meteor.yOffset, rect, meteor.orbitTrack);
						const track = ORBIT_TRACKS[meteor.orbitTrack];
						const maxRxPx = rect.width * CHAIN_RANGE_RATIO;
						const maxRyPx = track ? maxRxPx * (track.ry / track.rx) : maxRxPx;
						const tilt = track?.tilt ?? 0;
						const cosTilt = Math.cos(tilt);
						const sinTilt = Math.sin(tilt);
						const inRange: { id: string; type: MeteorBulletType; dist: number }[] = [];
						for (const m of meteorsRef.current.values()) {
							if (m.destroyed || m.id === meteorId || m.isBoss) continue;
							const mPos = getMeteorScreenPosRef.current!(m.angle, m.yOffset, rect, m.orbitTrack);
							const dx = mPos.x - bossPos.x;
							const dy = mPos.y - bossPos.y;
							const dxRot = dx * cosTilt + dy * sinTilt;
							const dyRot = -dx * sinTilt + dy * cosTilt;
							const normalizedDist = Math.sqrt((dxRot / maxRxPx) ** 2 + (dyRot / maxRyPx) ** 2);
							if (normalizedDist <= 1.0) {
								inRange.push({ id: m.id, type: m.type, dist: normalizedDist });
							}
						}
						inRange.sort((a, b) => a.dist - b.dist);
						for (const target of inRange) {
							const delay = Math.max(50, target.dist * CHAIN_SPREAD_MS);
							setTimeout(() => {
								if (phaseRef.current !== "PLAYING") return;
								const m = meteorsRef.current.get(target.id);
								if (!m || m.destroyed) return;
								const rect2 = containerRef.current?.getBoundingClientRect();
								const pos = rect2 && getMeteorScreenPosRef.current
									? getMeteorScreenPosRef.current(m.angle, m.yOffset, rect2, m.orbitTrack)
									: undefined;
								applyDamage(target.id, target.type, "__chain__", CHAIN_DAMAGE, pos);
							}, delay);
						}
					}
				}

				channelRef.current?.send({
					type: "broadcast",
					event: "meteor_update",
					payload: { meteorId, hp: 0, totalSpawned: spawnedCountRef.current, shooterId: _shooterId !== "__chain__" ? _shooterId : undefined } satisfies MeteorUpdatePayload,
				});
				play("star-damage");
				onShake?.("small");
				checkGameEnd();
			} else {
				const updated = { ...meteor, hp: newHp };
				meteorsRef.current.set(meteorId, updated);

				channelRef.current?.send({
					type: "broadcast",
					event: "meteor_update",
					payload: { meteorId, hp: newHp, totalSpawned: spawnedCountRef.current } satisfies MeteorUpdatePayload,
				});
			}

			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		},
		[play, onShake, checkGameEnd],
	);

	/** リロード */
	const handleReload = useCallback(() => {
		if (phaseRef.current !== "PLAYING") return;
		ammoRef.current = SHOOTER_AMMO_MAX;
		setAmmoRemaining(SHOOTER_AMMO_MAX);
		play("reload");
	}, [play]);

	/** チュートリアル用スポーン開放 */
	const unlockTutorialSpawn = useCallback(() => {
		tutorialSpawnUnlockedRef.current = true;
		spawnNextMeteor();
	}, [spawnNextMeteor]);

	/** 弾切り替え */
	const handleSwitchBullet = useCallback(() => {
		const order: MeteorBulletType[] = ["A", "B", "C"];
		const currentIdx = order.indexOf(bulletTypeRef.current);
		const nextType = order[(currentIdx + 1) % 3];
		bulletTypeRef.current = nextType;
		setBulletType(nextType);
	}, []);

	/** カーソル移動（throttle 50ms）*/
	const handleCursorMove = useCallback(
		(x: number, y: number) => {
			const now = Date.now();
			if (now - cursorThrottleRef.current < 50) return;
			cursorThrottleRef.current = now;

			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			channelRef.current?.send({
				type: "broadcast",
				event: "cursor",
				payload: {
					playerId: currentUserId,
					xPct: x / rect.width,
					yPct: y / rect.height,
					bulletType: bulletTypeRef.current,
				} satisfies CursorPayload,
			});
		},
		[currentUserId, containerRef],
	);

	/** 難易度選択（ホストのみ broadcast、ゲストは受信して表示を同期） */
	const handleDifficultySelect = useCallback((diff: MeteorDifficulty) => {
		if (!isHost) return;
		setTitleDifficulty(diff);
		channelRef.current?.send({
			type: "broadcast",
			event: "difficulty_select",
			payload: { difficulty: diff } satisfies DifficultySelectPayload,
		});
	}, [isHost]);

	/** タイトルに戻る */
	const handleReturnToTitle = useCallback(() => {
		if (isHost) {
			channelRef.current?.send({
				type: "broadcast",
				event: "return_to_title",
				payload: {},
			});
			// fire-and-forget の欠損リスクに備えてリトライ
			[600, 1500].forEach((delay) => {
				setTimeout(() => {
					if (phaseRef.current !== "TITLE") return;
					channelRef.current?.send({
						type: "broadcast",
						event: "return_to_title",
						payload: {},
					});
				}, delay);
			});
		}
		meteorsRef.current.clear();
		receivedMeteorIdsRef.current.clear();
		playerScoresRef.current = {};
		setMeteors([]);
		setResult(null);
		setPlayerScores({});
		setPhase("TITLE");
		phaseRef.current = "TITLE";
		setDestroyedCount(0);
		setSpawnedCount(0);
		setBulletType("A");
		bulletTypeRef.current = "A";
		setAmmoRemaining(SHOOTER_AMMO_MAX);
		ammoRef.current = SHOOTER_AMMO_MAX;
		setBulletAnims([]);
	}, [isHost]);

	// ============================================
	// 開発環境ボット（非ホスト自動射撃・人間らしい挙動）
	// ============================================

	useEffect(() => {
		if (process.env.NODE_ENV !== "development" || isHost) return;

		// クロージャ内で持ち続けるボット状態
		const BOT_PLAYER_ID = `__bot__${currentUserId}`;
		const botCursor = { x: 0, y: 0 };
		// ボット専用アモ（プレイヤーの ammoRef と独立させて干渉防止）
		let botAmmo = SHOOTER_AMMO_MAX;
		const aimTarget = { x: 0, y: 0 };
		let aimOffset = { x: 0, y: 0 };
		let lastTargetId: string | null = null;
		let lastCursorBroadcast = 0;
		let nextShootTime = Date.now() + 800; // 最初だけ少し待つ

		const tick = () => {
			if (phaseRef.current !== "PLAYING") return;

			const now = Date.now();
			const perfNow = performance.now();
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			// ── 1. ターゲット選定（軌道進行度が最大の隕石） ──
			let bestMeteor: MeteorObject | null = null;
			let bestProgress = -1;
			for (const meteor of meteorsRef.current.values()) {
				if (meteor.destroyed) continue;
				const progress = (perfNow - meteor.spawnTime) / meteor.orbitDurationMs;
				if (progress > bestProgress) {
					bestProgress = progress;
					bestMeteor = meteor;
				}
			}

			// ── 2. エイム目標を更新（新ターゲットでオフセット再抽選） ──
			if (bestMeteor && getMeteorScreenPosRef.current) {
				if (bestMeteor.id !== lastTargetId) {
					lastTargetId = bestMeteor.id;
					// ターゲット切替時に ±15px のランダムなズレを設定（上手い人レベル）
					aimOffset = {
						x: (Math.random() - 0.5) * 30,
						y: (Math.random() - 0.5) * 30,
					};
				}
				const pos = getMeteorScreenPosRef.current(
					bestMeteor.angle, bestMeteor.yOffset, rect, bestMeteor.orbitTrack,
				);
				aimTarget.x = pos.x + aimOffset.x;
				aimTarget.y = pos.y + aimOffset.y;
			}

			// ── 3. カーソルを目標へ緩やかに近づける（lerp + 微ジッター） ──
			const lerp = 0.14;
			botCursor.x += (aimTarget.x - botCursor.x) * lerp + (Math.random() - 0.5) * 1.5;
			botCursor.y += (aimTarget.y - botCursor.y) * lerp + (Math.random() - 0.5) * 1.5;

			// ── 4. カーソル位置を broadcast（他プレイヤーに動きが見える） ──
			if (now - lastCursorBroadcast > 50) {
				lastCursorBroadcast = now;
				channelRef.current?.send({
					type: "broadcast",
					event: "cursor",
					payload: {
						playerId: BOT_PLAYER_ID,
						xPct: botCursor.x / rect.width,
						yPct: botCursor.y / rect.height,
						bulletType: bulletTypeRef.current,
					} satisfies CursorPayload,
				});
			}

			// ── 5. 射撃タイミング ──
			if (now < nextShootTime) return;

			// 弾切れ → 自動リロード（リロード後は少し間を置く）
			if (botAmmo <= 0) {
				botAmmo = SHOOTER_AMMO_MAX;
				playRef.current("reload");
				nextShootTime = now + 600;
				return;
			}

			if (!bestMeteor) return;

			// 弾種切替（90%確率で即切替）
			if (bulletTypeRef.current !== bestMeteor.type && Math.random() < 0.9) {
				bulletTypeRef.current = bestMeteor.type;
				setBulletType(bestMeteor.type);
			}

			const cursorX = botCursor.x;
			const cursorY = botCursor.y;

			// 弾数消費 & 発射SE（ボット専用カウンター）
			botAmmo = Math.max(0, botAmmo - 1);
			playRef.current("shooting");

			// 弾アニメ
			const idPrefix = `anim_bot_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
			const bulletColor = GLOW_COLORS[bulletTypeRef.current];
			const anims = makeBulletAnims(cursorX, cursorY, rect.width, rect.height, idPrefix, bulletColor);
			addBulletAnims(anims);

			// 現在のカーソル位置で命中判定（ズレていれば miss になる）
			let hitMeteorId: string | null = null;
			if (getMeteorScreenPosRef.current) {
				for (const meteor of meteorsRef.current.values()) {
					if (meteor.destroyed) continue;
					const track = ORBIT_TRACKS[meteor.orbitTrack];
					if (!track) continue;
					const depth = Math.sin(meteor.angle);
					const scale = track.minScale + (track.maxScale - track.minScale) * ((depth + 1) / 2);
					const hitRadius = Math.max(16, 24 * scale * meteor.sizeFactor);
					const pos = getMeteorScreenPosRef.current(meteor.angle, meteor.yOffset, rect, meteor.orbitTrack);
					if (Math.hypot(pos.x - cursorX, pos.y - cursorY) < hitRadius) {
						hitMeteorId = meteor.id;
						break;
					}
				}
			}

			// Broadcast（ホストがダメージ処理）
			channelRef.current?.send({
				type: "broadcast",
				event: "shot",
				payload: {
					playerId: BOT_PLAYER_ID,
					bulletType: bulletTypeRef.current,
					cursorXPct: cursorX / rect.width,
					cursorYPct: cursorY / rect.height,
					meteorId: hitMeteorId,
				} satisfies ShotPayload,
			});

			// 命中FXは当たったときのみ
			if (hitMeteorId) {
				const travelMs = Math.max(...anims.map((a) => a.durationSec)) * 1000;
				setTimeout(() => {
					const fxId = `fx_bot_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
					setCollisions((prev) => [...prev, { id: fxId, x: cursorX, y: cursorY }]);
					setTimeout(() => {
						setCollisions((prev) => prev.filter((c) => c.id !== fxId));
					}, 600);
				}, travelMs);
			}

			// 次の射撃タイミング（150〜300ms 連打）
			nextShootTime = now + 60 + Math.random() * 60;
		};

		// tickMeteors の RAF に統合して二重 RAF を回避
		botTickRef.current = tick;
		return () => { botTickRef.current = null; };
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isHost, currentUserId, containerRef, addBulletAnims]);

	// ============================================
	// マウント時リロード復帰チェック
	// ============================================

	useEffect(() => {
		if (!initialMatchId) return;
		getMeteorBustersMatch(initialMatchId).then((match) => {
			if (!match || match.endedAt !== null) return;
			// endedAt が null → ゲーム継続中 → PLAYING に復帰
			if (isHost) {
				// ホストとして復帰した場合、subscribe 完了後に host_resumed を broadcast する
				resumedAsHostRef.current = true;
			}
			initGameRef.current(match.difficulty as MeteorDifficulty);
		});
		// マウント時のみ実行
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ============================================
	// Supabase Realtime
	// ============================================

	useEffect(() => {
		const channel = supabase.channel(`meteor-busters-${roomId}`);
		channelRef.current = channel;

		channel.on("broadcast", { event: "game_start" }, ({ payload }: { payload: GameStartPayload }) => {
			matchIdRef.current = payload.matchId;
			initGame(payload.difficulty);
		});

		channel.on("broadcast", { event: "meteor_spawn" }, ({ payload }: { payload: MeteorSpawnPayload }) => {
			if (isHost) return;
			// ホストの累積値で上書き（常に最新値に同期）
			spawnedCountRef.current = payload.totalSpawned;
			setSpawnedCount(payload.totalSpawned);
			// 受信済み ID の場合はリトライによる重複 → 隕石は再生成しない
			if (receivedMeteorIdsRef.current.has(payload.id)) return;
			receivedMeteorIdsRef.current.add(payload.id);
			const meteor: MeteorObject = {
				...payload,
				spawnTime: performance.now(), // ホストのクロックではなく自分のクロックで起算
				angle: payload.spawnAngle,
				destroyed: false,
			};
			meteorsRef.current.set(meteor.id, meteor);
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		});

		channel.on("broadcast", { event: "shot" }, ({ payload }: { payload: ShotPayload }) => {
			const p = payload;
			if (p.playerId === currentUserId) return;

			// 相手の弾アニメをコンテナサイズで再現
			const rect = containerRef.current?.getBoundingClientRect();
			if (rect) {
				const cursorX = p.cursorXPct * rect.width;
				const cursorY = p.cursorYPct * rect.height;
				const idPrefix = `anim_remote_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
				const remoteColor = GLOW_COLORS[p.bulletType];
				const anims = makeBulletAnims(cursorX, cursorY, rect.width, rect.height, idPrefix, remoteColor);
				setBulletAnims((prev) => [...prev, ...anims]);
				const maxDuration = Math.max(...anims.map((a) => a.durationSec));
				const ids = new Set(anims.map((a) => a.id));
				setTimeout(() => {
					setBulletAnims((prev) => prev.filter((a) => !ids.has(a.id)));
				}, maxDuration * 1000 + 150);
			}

			// ホストがダメージ計算（弾の飛行時間だけ遅延させて視覚と同期）
			if (isHost && p.meteorId) {
				const travelMs = (() => {
					const rect = containerRef.current?.getBoundingClientRect();
					if (!rect) return 120;
					const cx = p.cursorXPct * rect.width;
					const cy = p.cursorYPct * rect.height;
					// 左下コーナーからの距離で代表して計算（右下とほぼ同じ）
					const dist = Math.hypot(cx, cy - rect.height);
					return Math.max(120, (dist / SHOOTER_BULLET_SPEED_PX_S) * 1000);
				})();
				const meteorId = p.meteorId;
				setTimeout(() => {
					applyDamage(meteorId, p.bulletType, p.playerId);
				}, travelMs);
			}
		});

		channel.on("broadcast", { event: "meteor_update" }, ({ payload }: { payload: MeteorUpdatePayload }) => {
			if (isHost) return;
			const p = payload;
			// ホストの累積値で上書き（meteor_spawn 欠損の自己修正）
			spawnedCountRef.current = p.totalSpawned;
			setSpawnedCount(p.totalSpawned);
			const meteor = meteorsRef.current.get(p.meteorId);
			if (!meteor) {
				// meteor_spawn が欠損していて隕石が未登録の場合でも、
				// 破壊済みIDを記録して後のリトライで幽霊隕石が生成されるのを防ぐ
				if (p.hp <= 0) receivedMeteorIdsRef.current.add(p.meteorId);
				return;
			}

			if (p.hp <= 0) {
				const updated = { ...meteor, hp: 0, destroyed: true };
				meteorsRef.current.set(p.meteorId, updated);
				const effectiveCount = meteor.isBoss
					? (BOSS_CONFIG[difficultyRef.current]?.effectiveCount ?? 1)
					: 1;
				destroyedCountRef.current += effectiveCount;
				setDestroyedCount(destroyedCountRef.current);

				// ゲスト側プレイヤースコア更新
				if (p.shooterId) {
					playerScoresRef.current = {
						...playerScoresRef.current,
						[p.shooterId]: (playerScoresRef.current[p.shooterId] ?? 0) + effectiveCount,
					};
					setPlayerScores({ ...playerScoresRef.current });
				}

				// 破壊FX・SE・シェイク（非ホスト側）
				const rect = containerRef.current?.getBoundingClientRect();
				if (rect && getMeteorScreenPosRef.current) {
					const pos = getMeteorScreenPosRef.current(meteor.angle, meteor.yOffset, rect, meteor.orbitTrack);
					const fxId = `fx_remote_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
					setCollisions((prev) => [...prev, { id: fxId, x: pos.x, y: pos.y }]);
					setTimeout(() => {
						setCollisions((prev) => prev.filter((c) => c.id !== fxId));
					}, 600);

				}
				playRef.current("star-damage");
				onShakeRef.current?.("small");
			} else {
				meteorsRef.current.set(p.meteorId, { ...meteor, hp: p.hp });
			}
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		});

		channel.on("broadcast", { event: "meteor_missed" }, ({ payload }: { payload: MeteorMissedPayload }) => {
			if (isHost) return;
			// ホストの累積値で上書き（meteor_spawn 欠損の自己修正）
			spawnedCountRef.current = payload.totalSpawned;
			setSpawnedCount(payload.totalSpawned);
			// miss 済み ID を記録: meteor_spawn リトライで幽霊隕石が生成されるのを防ぐ
			receivedMeteorIdsRef.current.add(payload.meteorId);
			meteorsRef.current.delete(payload.meteorId);
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		});

		channel.on("broadcast", { event: "cursor" }, ({ payload }: { payload: CursorPayload }) => {
			if (payload.playerId === currentUserId) return;
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			setPlayerCursors((prev) => {
				const filtered = prev.filter((c) => c.playerId !== payload.playerId);
				return [...filtered, {
					playerId: payload.playerId,
					x: payload.xPct * rect.width,
					y: payload.yPct * rect.height,
					bulletType: payload.bulletType,
				}];
			});
		});

		channel.on("broadcast", { event: "game_end" }, ({ payload }: { payload: GameEndPayload }) => {
			if (isHost) return;
			if (phaseRef.current !== "PLAYING") return; // リトライが新ゲーム中に届いた場合を無視
			handleGameEnd(payload);
		});

		channel.on("broadcast", { event: "return_to_title" }, () => {
			if (isHost) return;
			if (phaseRef.current !== "RESULT") return; // リトライがゲーム中に届いた場合を無視
			handleReturnToTitle();
		});

		channel.on("broadcast", { event: "difficulty_select" }, ({ payload }: { payload: DifficultySelectPayload }) => {
			if (isHost) return;
			setTitleDifficulty(payload.difficulty);
		});

		// ホストがリロード復帰した際に非ホストの古い隕石状態をリセットする
		channel.on("broadcast", { event: "host_resumed" }, () => {
			if (isHost) return;
			meteorsRef.current.clear();
			setMeteors([]);
			spawnedCountRef.current = 0;
			setSpawnedCount(0);
			destroyedCountRef.current = 0;
			setDestroyedCount(0);
			missedCountRef.current = 0;
		});

		channel.subscribe((status: string) => {
			// ホストとしてリロード復帰した場合、subscribe 完了後に非ホストへリセットを通知
			if (status === "SUBSCRIBED" && resumedAsHostRef.current) {
				resumedAsHostRef.current = false;
				channel.send({
					type: "broadcast",
					event: "host_resumed",
					payload: {},
				});
			}
		});

		return () => {
			supabase.removeChannel(channel);
			channelRef.current = null;
			if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
			if (endTimerRef.current) clearTimeout(endTimerRef.current);
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
		};
	}, [supabase, roomId, isHost, currentUserId, initGame, applyDamage, handleGameEnd, containerRef, addBulletAnims]);

	return {
		phase,
		difficulty,
		meteors,
		bulletType,
		ammoRemaining,
		playerCursors,
		bulletAnims,
		collisions,
		result,
		destroyedCount,
		spawnedCount,
		totalSpawnCount,
		playerScores,
		isProcessing,
		titleDifficulty,
		handleStartGame,
		handleShoot,
		handleReload,
		handleSwitchBullet,
		handleCursorMove,
		handleReturnToTitle,
		handleDifficultySelect,
		unlockTutorialSpawn,
	};
}
