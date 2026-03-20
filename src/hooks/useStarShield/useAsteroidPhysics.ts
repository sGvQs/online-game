"use client";

import { useEffect } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import {
	STAR_TARGET_X,
	STAR_TARGET_Y,
} from "@/components/game/phases/starShieldGame/playing/protectedStar";
import { SPAWN_INTERVALS_MS } from "@/constants/starShieldGame/gameConfig";
import { createAsteroid, processPhysicsFrame } from "@/utils/starShieldGame";
import type {
	Asteroid,
	Bullet,
	Difficulty,
	GameResult,
} from "@/types/starShieldGame";
import type { NormalAttackLevel } from "@/types/starShieldGame";

type Score = { spawned: number; destroyed: number };
type ChainHits = {
	primaryPos: { x: number; y: number };
	targets: { pos: { x: number; y: number }; asteroidId: string }[];
	color: string;
} | null;

interface UseAsteroidPhysicsParams {
	matchId: string;
	isShooter: boolean;
	difficulty: Difficulty;
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
}

export function useAsteroidPhysics({
	matchId,
	isShooter,
	difficulty,
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
}: UseAsteroidPhysicsParams): void {
	useEffect(() => {
		if (!isShooter || difficulty === "ABYSS") return;

		const spawnInterval = SPAWN_INTERVALS_MS[difficulty];
		let spawnTimer: ReturnType<typeof setInterval> | null = null;
		let rafId: number | null = null;

		spawnTimer = setInterval(() => {
			if (gameEndedRef.current || contactPendingRef.current) return;
			const asteroid = createAsteroid({
				difficulty,
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
			});

			rafId = requestAnimationFrame(gameLoop);
		};
		rafId = requestAnimationFrame(gameLoop);

		return () => {
			if (spawnTimer) clearInterval(spawnTimer);
			if (rafId) cancelAnimationFrame(rafId);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [matchId, isShooter, difficulty, sendGameState]);
}
