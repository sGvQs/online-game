"use client";

import { useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import {
	STAR_TARGET_X,
	STAR_TARGET_Y,
} from "@/components/game/phases/starShieldGame/playing/protectedStar";
import {
	SPAWN_INTERVALS_MS,
	ABYSS_WAVE_DURATION_SECONDS,
} from "@/constants/starShieldGame/gameConfig";
import {
	createAsteroid,
	createBossAsteroid,
	processPhysicsFrame,
} from "@/utils/starShieldGame";
import { awardAbyssWavePoints } from "@/server/actions/game/starShieldActions";
import type {
	Asteroid,
	Bullet,
	GameResult,
	NormalAttackLevel,
} from "@/types/starShieldGame";

type Score = { spawned: number; destroyed: number };
type ChainHits = {
	primaryPos: { x: number; y: number };
	targets: { pos: { x: number; y: number }; asteroidId: string }[];
	color: string;
} | null;

interface UseAbyssPhysicsParams {
	matchId: string;
	isShooter: boolean;
	// Shared refs
	asteroidsRef: RefObject<Asteroid[]>;
	bulletsRef: RefObject<Bullet[]>;
	scoreRef: RefObject<Score>;
	starHpRef: RefObject<number>;
	levelRef: RefObject<NormalAttackLevel>;
	gameEndedRef: RefObject<boolean>;
	contactPendingRef: RefObject<boolean>;
	// React setters
	setAsteroids: Dispatch<SetStateAction<Asteroid[]>>;
	setBullets: Dispatch<SetStateAction<Bullet[]>>;
	setScore: Dispatch<SetStateAction<Score>>;
	setStarHp: Dispatch<SetStateAction<number>>;
	setContactExplosion: Dispatch<
		SetStateAction<{ x: number; y: number; asteroidId: string } | null>
	>;
	setChainHits: Dispatch<SetStateAction<ChainHits>>;
	// Callbacks
	playVoice: (key: string) => void;
	sendGameState: (immediate?: boolean) => void;
	endGame: (result: GameResult) => void;
	// ABYSS ウェーブ管理
	waveNumber: number;
	setWaveNumber: Dispatch<SetStateAction<number>>;
}

export function useAbyssPhysics({
	matchId,
	isShooter,
	asteroidsRef,
	bulletsRef,
	scoreRef,
	starHpRef,
	levelRef,
	gameEndedRef,
	contactPendingRef,
	setAsteroids,
	setBullets,
	setScore,
	setStarHp,
	setContactExplosion,
	setChainHits,
	playVoice,
	sendGameState,
	endGame,
	waveNumber,
	setWaveNumber,
}: UseAbyssPhysicsParams): void {
	useEffect(() => {
		if (!isShooter) return;

		// 新ウェーブ開始時: 前ウェーブの残骸と弾をクリア
		contactPendingRef.current = false;
		asteroidsRef.current = [];
		setAsteroids([]);
		bulletsRef.current = [];
		setBullets([]);

		const spawnInterval = SPAWN_INTERVALS_MS["ABYSS"];
		const waveStartTime = Date.now();
		let phase: "normal" | "boss" | "boss_cleared" = "normal";
		let spawnTimer: ReturnType<typeof setInterval> | null = null;
		let waveTimer: ReturnType<typeof setTimeout> | null = null;
		let rafId: number | null = null;

		// --- 通常フェーズ: 隕石スポーン ---
		spawnTimer = setInterval(() => {
			if (gameEndedRef.current || phase !== "normal") return;
			const waveElapsedMs = Date.now() - waveStartTime;
			const asteroid = createAsteroid({
				difficulty: "ABYSS",
				waveElapsedMs,
				starTargetX: STAR_TARGET_X,
				starTargetY: STAR_TARGET_Y,
			});
			const nextAsteroids = [...asteroidsRef.current, asteroid];
			asteroidsRef.current = nextAsteroids;
			setAsteroids(nextAsteroids);
			const nextScore = {
				...scoreRef.current,
				spawned: scoreRef.current.spawned + 1,
			};
			scoreRef.current = nextScore;
			setScore(nextScore);
			sendGameState();
		}, spawnInterval);

		// --- ウェーブ毎に +30秒: ボスフェーズへ移行 ---
		const waveDurationMs =
			(ABYSS_WAVE_DURATION_SECONDS + (waveNumber - 1) * 30) * 1000;
		waveTimer = setTimeout(() => {
			if (gameEndedRef.current) return;
			phase = "boss";
			if (spawnTimer) {
				clearInterval(spawnTimer);
				spawnTimer = null;
			}

			// 通常隕石を一掃してボスをスポーン
			const boss = createBossAsteroid({
				waveNumber,
				starTargetX: STAR_TARGET_X,
				starTargetY: STAR_TARGET_Y,
			});
			asteroidsRef.current = [boss];
			setAsteroids([boss]);
			const nextScore = {
				...scoreRef.current,
				spawned: scoreRef.current.spawned + 1,
			};
			scoreRef.current = nextScore;
			setScore(nextScore);
			sendGameState();
		}, waveDurationMs);

		// --- ゲームループ ---
		const gameLoop = () => {
			if (gameEndedRef.current || contactPendingRef.current) return;

			processPhysicsFrame({
				now: Date.now(),
				asteroidsRef,
				bulletsRef,
				scoreRef,
				starHpRef,
				levelRef,
				contactPendingRef,
				setAsteroids,
				setBullets,
				setScore,
				setStarHp,
				setChainHits,
				setContactExplosion,
				playVoice,
				sendGameState,
				onBossDefeated: () => {
					if (phase !== "boss") return;
					phase = "boss_cleared";
					void awardAbyssWavePoints(matchId).catch((e) =>
						console.error("[ABYSS] ポイント付与失敗:", e),
					);
					setWaveNumber((n) => n + 1);
					rafId = null;
				},
			});

			if (rafId !== null) {
				rafId = requestAnimationFrame(gameLoop);
			}
		};
		rafId = requestAnimationFrame(gameLoop);

		return () => {
			if (spawnTimer) clearInterval(spawnTimer);
			if (waveTimer) clearTimeout(waveTimer);
			if (rafId) cancelAnimationFrame(rafId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [matchId, isShooter, waveNumber, sendGameState]);
}
