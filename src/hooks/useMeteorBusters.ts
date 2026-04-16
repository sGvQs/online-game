"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { resetAllReady } from "@/server/actions/room";
import {
	startMeteorBustersMatch,
	finishMeteorBustersMatch,
} from "@/server/actions/game";
import {
	DIFFICULTY_CONFIG,
	DAMAGE_MATCH,
	DAMAGE_MISMATCH,
	BULLET_HIT_RADIUS,
	MAX_Y_OFFSET,
	GAME_END_DELAY_MS,
	CLEAR_RATE,
	GLOW_COLORS,
	ORBIT_TRACKS,
	ORBIT_CENTER_Y_RATIO,
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
}

interface MeteorUpdatePayload {
	meteorId: string;
	hp: number;
}

interface MeteorMissedPayload {
	meteorId: string;
}

interface GameStartPayload {
	matchId: string;
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
	isProcessing: boolean;
	handleStartGame: (difficulty: MeteorDifficulty) => Promise<void>;
	handleShoot: (cursorX: number, cursorY: number, containerRect: DOMRect) => void;
	handleReload: () => void;
	handleSwitchBullet: () => void;
	handleCursorMove: (x: number, y: number) => void;
	handleReturnToTitle: () => void;
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
	const [isProcessing, setIsProcessing] = useState(false);

	// ---- Refs ----
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const matchIdRef = useRef<string | null>(initialMatchId);
	const difficultyRef = useRef<MeteorDifficulty>("NORMAL");
	const spawnedCountRef = useRef(0);
	const destroyedCountRef = useRef(0);
	const missedCountRef = useRef(0);
	const totalSpawnCountRef = useRef(0);
	const meteorsRef = useRef<Map<string, MeteorObject>>(new Map());
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
						payload: { meteorId: meteor.id } satisfies MeteorMissedPayload,
					});
					missedCountRef.current += 1;
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

		if (hasChange) {
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

		const config = DIFFICULTY_CONFIG[difficultyRef.current];
		const types: MeteorBulletType[] = ["A", "B", "C"];
		const type = types[Math.floor(Math.random() * 3)];
		const yOffset = (Math.random() * 2 - 1) * MAX_Y_OFFSET;
		const orbitTrack = Math.floor(Math.random() * ORBIT_TRACKS.length);
		const track = ORBIT_TRACKS[orbitTrack];
		const meteor: MeteorSpawnPayload = {
			id: generateMeteorId(),
			type,
			orbitTrack,
			hp: config.meteorHp,
			maxHp: config.meteorHp,
			yOffset,
			orbitDurationMs: config.orbitDurationMs / track.speedMultiplier,
			spawnAngle: track.spawnAngle,
			collisionAngle: track.collisionAngles[Math.floor(Math.random() * track.collisionAngles.length)],
			spawnTime: performance.now(),
		};

		channelRef.current?.send({
			type: "broadcast",
			event: "meteor_spawn",
			payload: meteor,
		});

		const meteorObj: MeteorObject = {
			...meteor,
			angle: track.spawnAngle,
			destroyed: false,
		};
		meteorsRef.current.set(meteor.id, meteorObj);

		spawnedCountRef.current += 1;
		setSpawnedCount(spawnedCountRef.current);

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

		channelRef.current?.send({
			type: "broadcast",
			event: "game_end",
			payload: {
				destroyedCount: destroyed,
				spawnedCount: spawned,
				destroyRate: rate,
				isCleared,
			} satisfies GameEndPayload,
		});
		handleGameEnd({
			destroyedCount: destroyed,
			spawnedCount: spawned,
			destroyRate: rate,
			isCleared,
		});
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
		meteorsRef.current.clear();
		gameStartTimeRef.current = performance.now();

		setDifficulty(diff);
		setTotalSpawnCount(config.totalSpawnCount);
		setSpawnedCount(0);
		setDestroyedCount(0);
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
				// sizePx = 48 * scale、その半径分を当たり判定とする（最低 16px）
				const hitRadius = Math.max(16, 24 * scale);
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
		(meteorId: string, bulletType: MeteorBulletType, _shooterId: string) => {
			const meteor = meteorsRef.current.get(meteorId);
			if (!meteor || meteor.destroyed) return;

			const damage =
				meteor.type === bulletType ? DAMAGE_MATCH : DAMAGE_MISMATCH;
			const newHp = Math.max(0, meteor.hp - damage);

			// 命中FX（カーソル位置）
			const { x: fx, y: fy } = lastShotCursorRef.current;
			const fxId = `fx_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
			setCollisions((prev) => [...prev, { id: fxId, x: fx, y: fy }]);
			setTimeout(() => {
				setCollisions((prev) => prev.filter((c) => c.id !== fxId));
			}, 600);

			if (newHp <= 0) {
				const updated = { ...meteor, hp: 0, destroyed: true };
				meteorsRef.current.set(meteorId, updated);
				destroyedCountRef.current += 1;
				setDestroyedCount(destroyedCountRef.current);

				channelRef.current?.send({
					type: "broadcast",
					event: "meteor_update",
					payload: { meteorId, hp: 0 } satisfies MeteorUpdatePayload,
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
					payload: { meteorId, hp: newHp } satisfies MeteorUpdatePayload,
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

	/** タイトルに戻る */
	const handleReturnToTitle = useCallback(() => {
		meteorsRef.current.clear();
		setMeteors([]);
		setResult(null);
		setPhase("TITLE");
		phaseRef.current = "TITLE";
		setDestroyedCount(0);
		setSpawnedCount(0);
		setBulletType("A");
		bulletTypeRef.current = "A";
		setAmmoRemaining(SHOOTER_AMMO_MAX);
		ammoRef.current = SHOOTER_AMMO_MAX;
		setBulletAnims([]);
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
			const meteor: MeteorObject = {
				...payload,
				spawnTime: performance.now(), // ホストのクロックではなく自分のクロックで起算
				angle: payload.spawnAngle,
				destroyed: false,
			};
			meteorsRef.current.set(meteor.id, meteor);
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
			spawnedCountRef.current += 1;
			setSpawnedCount(spawnedCountRef.current);
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
			const meteor = meteorsRef.current.get(p.meteorId);
			if (!meteor) return;

			if (p.hp <= 0) {
				const updated = { ...meteor, hp: 0, destroyed: true };
				meteorsRef.current.set(p.meteorId, updated);
				destroyedCountRef.current += 1;
				setDestroyedCount(destroyedCountRef.current);

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
			handleGameEnd(payload);
		});

		channel.subscribe();

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
		isProcessing,
		handleStartGame,
		handleShoot,
		handleReload,
		handleSwitchBullet,
		handleCursorMove,
		handleReturnToTitle,
	};
}
