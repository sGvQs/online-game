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
	SPAWN_ANGLE,
	COLLISION_ANGLE,
	MAX_AMMO,
	DAMAGE_MATCH,
	DAMAGE_MISMATCH,
	BULLET_HIT_RADIUS,
	MAX_Y_OFFSET,
	GAME_END_DELAY_MS,
	CLEAR_RATE,
} from "@/constants/meteorBustersGame/gameConfig";
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

export type { BulletAnim };

// ============================================
// Broadcast ペイロード型
// ============================================

interface ShotPayload {
	playerId: string;
	bulletType: MeteorBulletType;
	meteorId: string;
	originX: number;
	originY: number;
}

interface CursorPayload {
	playerId: string;
	x: number;
	y: number;
	bulletType: MeteorBulletType;
}

interface MeteorSpawnPayload {
	id: string;
	type: MeteorBulletType;
	hp: number;
	maxHp: number;
	yOffset: number;
	orbitDurationMs: number;
	spawnTime: number; // performance.now() 相当（ホスト基準）
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

interface BulletAnimPayload {
	playerId: string;
	bulletType: MeteorBulletType;
	originX: number;
	originY: number;
	meteorId: string;
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
}: {
	roomId: string;
	isHost: boolean;
	initialMatchId: string | null;
	currentUserId: string;
}): UseMeteorBustersReturn {
	const supabase = createClient();
	const { play } = useSE();

	// ---- State ----
	const [phase, setPhase] = useState<MeteorBustersPhase>("TITLE");
	const [difficulty, setDifficulty] = useState<MeteorDifficulty>("NORMAL");
	const [meteors, setMeteors] = useState<MeteorObject[]>([]);
	const [bulletType, setBulletType] = useState<MeteorBulletType>("A");
	const [ammoRemaining, setAmmoRemaining] = useState(MAX_AMMO);
	const [playerCursors, setPlayerCursors] = useState<PlayerCursorState[]>([]);
	const [bulletAnims, setBulletAnims] = useState<BulletAnim[]>([]);
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
	const totalSpawnCountRef = useRef(0);
	const meteorsRef = useRef<Map<string, MeteorObject>>(new Map());
	const bulletTypeRef = useRef<MeteorBulletType>("A");
	const ammoRef = useRef(MAX_AMMO);
	const spawnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const rafRef = useRef<number | null>(null);
	const gameStartTimeRef = useRef<number>(0);
	const phaseRef = useRef<MeteorBustersPhase>("TITLE");
	const cursorThrottleRef = useRef<number>(0);

	// state の最新値を ref に同期
	useEffect(() => {
		phaseRef.current = phase;
	}, [phase]);

	// ============================================
	// ユーティリティ
	// ============================================

	const generateMeteorId = () =>
		`meteor_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

	/** 隕石の軌道角度から画面上の位置を計算 */
	const getMeteorScreenPos = useCallback(
		(angle: number, yOffset: number, containerRect: DOMRect) => {
			const cx = containerRect.width / 2;
			const cy = containerRect.height / 2;
			const rx = containerRect.width * 0.38;
			const ry = containerRect.height * 0.2;
			const x = cx + rx * Math.cos(angle);
			const y = cy + ry * Math.sin(angle) + yOffset;
			return { x, y };
		},
		[],
	);

	/** アニメーション: 隕石の角度を時刻に基づいて更新 */
	const tickMeteors = useCallback(() => {
		const now = performance.now();
		const updated: MeteorObject[] = [];
		let hasChange = false;

		for (const meteor of meteorsRef.current.values()) {
			if (meteor.destroyed) continue;

			const elapsed = now - meteor.spawnTime;
			const progress = Math.min(elapsed / meteor.orbitDurationMs, 1);
			const angle =
				SPAWN_ANGLE + progress * (COLLISION_ANGLE - SPAWN_ANGLE);

			if (progress >= 1) {
				// 衝突判定（ホストのみ broadcast）
				if (isHost) {
					channelRef.current?.send({
						type: "broadcast",
						event: "meteor_missed",
						payload: { meteorId: meteor.id } satisfies MeteorMissedPayload,
					});
				}
				meteorsRef.current.delete(meteor.id);
				hasChange = true;
				continue;
			}

			const updatedMeteor = { ...meteor, angle };
			meteorsRef.current.set(meteor.id, updatedMeteor);
			updated.push(updatedMeteor);
			hasChange = true;
		}

		if (hasChange) {
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		}

		rafRef.current = requestAnimationFrame(tickMeteors);
	}, [isHost]);

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

		const meteor: MeteorSpawnPayload = {
			id: generateMeteorId(),
			type,
			hp: config.meteorHp,
			maxHp: config.meteorHp,
			yOffset,
			orbitDurationMs: config.orbitDurationMs,
			spawnTime: performance.now(),
		};

		channelRef.current?.send({
			type: "broadcast",
			event: "meteor_spawn",
			payload: meteor,
		});

		// 自分自身にも追加
		const meteorObj: MeteorObject = {
			...meteor,
			angle: SPAWN_ANGLE,
			destroyed: false,
		};
		meteorsRef.current.set(meteor.id, meteorObj);

		spawnedCountRef.current += 1;
		setSpawnedCount(spawnedCountRef.current);

		// 次のスポーンをスケジュール
		if (spawnedCountRef.current < totalSpawnCountRef.current) {
			spawnTimerRef.current = setTimeout(
				spawnNextMeteor,
				config.spawnIntervalMs,
			);
		} else {
			// 全スポーン完了 → 一定時間後にゲーム終了
			endTimerRef.current = setTimeout(() => {
				if (phaseRef.current !== "PLAYING") return;
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
			}, GAME_END_DELAY_MS + config.orbitDurationMs);
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

			// タイマーをクリア
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

				// ゲーム開始を全員に broadcast
				channelRef.current?.send({
					type: "broadcast",
					event: "game_start",
					payload: {
						matchId: match.id,
						difficulty: selectedDifficulty,
					} satisfies GameStartPayload,
				});

				// 自分自身もゲーム開始処理
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
		meteorsRef.current.clear();
		gameStartTimeRef.current = performance.now();

		setDifficulty(diff);
		setTotalSpawnCount(config.totalSpawnCount);
		setSpawnedCount(0);
		setDestroyedCount(0);
		setMeteors([]);
		setBulletType("A");
		bulletTypeRef.current = "A";
		setAmmoRemaining(MAX_AMMO);
		ammoRef.current = MAX_AMMO;
		setPhase("PLAYING");
		phaseRef.current = "PLAYING";

		// アニメーションループ開始
		if (rafRef.current) cancelAnimationFrame(rafRef.current);
		rafRef.current = requestAnimationFrame(tickMeteors);

		// ホストのみスポーン開始
		if (isHost) {
			if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
			spawnTimerRef.current = setTimeout(spawnNextMeteor, 500);
		}
	}, [isHost, tickMeteors, spawnNextMeteor]);

	/** 射撃 */
	const handleShoot = useCallback(
		(cursorX: number, cursorY: number, containerRect: DOMRect) => {
			if (phaseRef.current !== "PLAYING") return;
			if (ammoRef.current <= 0) return;

			// カーソル付近の隕石を探す
			let closestMeteor: MeteorObject | null = null;
			let closestDist = BULLET_HIT_RADIUS;

			for (const meteor of meteorsRef.current.values()) {
				if (meteor.destroyed) continue;
				const pos = getMeteorScreenPos(
					meteor.angle,
					meteor.yOffset,
					containerRect,
				);
				const dist = Math.hypot(pos.x - cursorX, pos.y - cursorY);
				if (dist < closestDist) {
					closestDist = dist;
					closestMeteor = meteor;
				}
			}

			if (!closestMeteor) return;

			const currentBulletType = bulletTypeRef.current;

			// 弾数消費
			ammoRef.current = Math.max(0, ammoRef.current - 1);
			setAmmoRemaining(ammoRef.current);

			// 弾アニメ追加（自分）
			const animId = `anim_${Date.now()}`;
			setBulletAnims((prev) => [
				...prev,
				{
					id: animId,
					type: currentBulletType,
					fromX: cursorX,
					fromY: cursorY,
					toMeteorId: closestMeteor!.id,
					startedAt: performance.now(),
				},
			]);
			// 300ms後にアニメ削除
			setTimeout(() => {
				setBulletAnims((prev) => prev.filter((a) => a.id !== animId));
			}, 300);

			// Broadcast
			const payload: ShotPayload = {
				playerId: currentUserId,
				bulletType: currentBulletType,
				meteorId: closestMeteor.id,
				originX: cursorX,
				originY: cursorY,
			};
			channelRef.current?.send({
				type: "broadcast",
				event: "shot",
				payload,
			});

			// 自分がホストなら即ダメージ計算
			if (isHost) {
				applyDamage(closestMeteor.id, currentBulletType, currentUserId);
			}
		},
		[isHost, currentUserId, getMeteorScreenPos],
	);

	/** ダメージ適用（ホストのみ） */
	const applyDamage = useCallback(
		(meteorId: string, bulletType: MeteorBulletType, _shooterId: string) => {
			const meteor = meteorsRef.current.get(meteorId);
			if (!meteor || meteor.destroyed) return;

			const damage =
				meteor.type === bulletType ? DAMAGE_MATCH : DAMAGE_MISMATCH;
			const newHp = Math.max(0, meteor.hp - damage);

			if (newHp <= 0) {
				// 撃破
				const updated = { ...meteor, hp: 0, destroyed: true };
				meteorsRef.current.set(meteorId, updated);
				destroyedCountRef.current += 1;
				setDestroyedCount(destroyedCountRef.current);

				channelRef.current?.send({
					type: "broadcast",
					event: "meteor_update",
					payload: { meteorId, hp: 0 } satisfies MeteorUpdatePayload,
				});
				play("shooting");
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
		[play],
	);

	/** リロード */
	const handleReload = useCallback(() => {
		if (phaseRef.current !== "PLAYING") return;
		ammoRef.current = MAX_AMMO;
		setAmmoRemaining(MAX_AMMO);
		play("chime");
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

			channelRef.current?.send({
				type: "broadcast",
				event: "cursor",
				payload: {
					playerId: currentUserId,
					x,
					y,
					bulletType: bulletTypeRef.current,
				} satisfies CursorPayload,
			});
		},
		[currentUserId],
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
		setAmmoRemaining(MAX_AMMO);
		ammoRef.current = MAX_AMMO;
	}, []);

	// ============================================
	// Supabase Realtime
	// ============================================

	useEffect(() => {
		const channel = supabase.channel(`meteor-busters-${roomId}`);
		channelRef.current = channel;

		// ゲーム開始
		channel.on("broadcast", { event: "game_start" }, ({ payload }: { payload: GameStartPayload }) => {
			matchIdRef.current = payload.matchId;
			initGame(payload.difficulty);
		});

		// 隕石スポーン（ゲスト側）
		channel.on("broadcast", { event: "meteor_spawn" }, ({ payload }: { payload: MeteorSpawnPayload }) => {
			if (isHost) return; // ホストは自分でスポーン管理
			const p = payload;
			const meteor: MeteorObject = {
				...p,
				angle: SPAWN_ANGLE,
				destroyed: false,
			};
			meteorsRef.current.set(meteor.id, meteor);
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));

			spawnedCountRef.current += 1;
			setSpawnedCount(spawnedCountRef.current);
		});

		// 射撃（ゲスト → ホスト処理）
		channel.on("broadcast", { event: "shot" }, ({ payload }: { payload: ShotPayload }) => {
			const p = payload;
			if (p.playerId === currentUserId) return; // 自分の分は処理済み

			// 相手の弾アニメ
			const animId = `anim_${Date.now()}_${p.playerId}`;
			setBulletAnims((prev) => [
				...prev,
				{
					id: animId,
					type: p.bulletType,
					fromX: p.originX,
					fromY: p.originY,
					toMeteorId: p.meteorId,
					startedAt: performance.now(),
				},
			]);
			setTimeout(() => {
				setBulletAnims((prev) => prev.filter((a) => a.id !== animId));
			}, 300);

			// ホストがダメージ計算
			if (isHost) {
				applyDamage(p.meteorId, p.bulletType, p.playerId);
			}
		});

		// 隕石HP更新（ホスト → 全員）
		channel.on("broadcast", { event: "meteor_update" }, ({ payload }: { payload: MeteorUpdatePayload }) => {
			if (isHost) return; // ホストは自分で管理済み
			const p = payload;
			const meteor = meteorsRef.current.get(p.meteorId);
			if (!meteor) return;

			if (p.hp <= 0) {
				const updated = { ...meteor, hp: 0, destroyed: true };
				meteorsRef.current.set(p.meteorId, updated);
				destroyedCountRef.current += 1;
				setDestroyedCount(destroyedCountRef.current);
			} else {
				meteorsRef.current.set(p.meteorId, { ...meteor, hp: p.hp });
			}
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		});

		// 隕石ミス（ホスト → 全員）
		channel.on("broadcast", { event: "meteor_missed" }, ({ payload }: { payload: MeteorMissedPayload }) => {
			if (isHost) return;
			meteorsRef.current.delete(payload.meteorId);
			setMeteors([...meteorsRef.current.values()].filter((m) => !m.destroyed));
		});

		// カーソル
		channel.on("broadcast", { event: "cursor" }, ({ payload }: { payload: CursorPayload }) => {
			if (payload.playerId === currentUserId) return;
			setPlayerCursors((prev) => {
				const filtered = prev.filter((c) => c.playerId !== payload.playerId);
				return [...filtered, payload];
			});
		});

		// ゲーム終了
		channel.on("broadcast", { event: "game_end" }, ({ payload }: { payload: GameEndPayload }) => {
			if (isHost) return; // ホストは自分で処理済み
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
	}, [supabase, roomId, isHost, currentUserId, initGame, applyDamage, handleGameEnd]);

	return {
		phase,
		difficulty,
		meteors,
		bulletType,
		ammoRemaining,
		playerCursors,
		bulletAnims,
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
