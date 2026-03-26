"use client";

import type { Dispatch, RefObject, SetStateAction } from "react";
import {
	STAR_TARGET_X,
	STAR_TARGET_Y,
	STAR_RADIUS,
} from "@/components/game/phases/starShieldGame/playing/protectedStar";
import { ASTEROID_RADIUS } from "@/constants/starShieldGame/gameConfig";
import {
	computeCollisionResult,
	applyHpUpdates,
	getContactAsteroids,
	getExpiredBulletIds,
} from "./collision";
import { getAsteroidPosition } from "./position";
import type {
	Asteroid,
	Bullet,
	NormalAttackLevel,
} from "@/types/starShieldGame";

type Score = { spawned: number; destroyed: number };
type ChainHits = {
	primaryPos: { x: number; y: number };
	targets: { pos: { x: number; y: number }; asteroidId: string }[];
	color: string;
} | null;

interface ProcessPhysicsFrameParams {
	now: number;
	// Shared refs
	asteroidsRef: RefObject<Asteroid[]>;
	bulletsRef: RefObject<Bullet[]>;
	scoreRef: RefObject<Score>;
	starHpRef: RefObject<number>;
	levelRef: RefObject<NormalAttackLevel>;
	contactPendingRef: RefObject<boolean>;
	// State setters
	setAsteroids: Dispatch<SetStateAction<Asteroid[]>>;
	setBullets: Dispatch<SetStateAction<Bullet[]>>;
	setScore: Dispatch<SetStateAction<Score>>;
	setStarHp: Dispatch<SetStateAction<number>>;
	setChainHits: Dispatch<SetStateAction<ChainHits>>;
	setContactExplosion: Dispatch<
		SetStateAction<{ x: number; y: number; asteroidId: string } | null>
	>;
	// Callbacks
	playVoice: (key: string) => void;
	sendGameState: (immediate?: boolean) => void;
	// Hook (for Boss defeated in ABYSS)
	onBossDefeated?: () => void;
}

/**
 * 毎フレーム呼ばれる物理演算コアロジック
 * 通常モード・ABYSSモードの両方で共通使用される
 */
export function processPhysicsFrame({
	now,
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
	onBossDefeated,
}: ProcessPhysicsFrameParams) {
	if (contactPendingRef.current) return;

	const asts = asteroidsRef.current;
	const bts = bulletsRef.current;

	// 衝突判定
	const result = computeCollisionResult({
		asteroids: asts,
		bullets: bts,
		now,
		level: levelRef.current,
	});

	if (result.hpUpdates.size > 0) {
		// ボス撃破判定 (ABYSS用)
		let bossJustDefeated = false;
		if (onBossDefeated) {
			const boss = asts.find((a) => a.isBoss && !a.destroyedAt);
			const bossNewHp = boss
				? (result.hpUpdates.get(boss.id) ?? boss.hp)
				: undefined;
			if (bossNewHp !== undefined && bossNewHp <= 0) {
				bossJustDefeated = true;
			}
		}

		const nextAsteroids = applyHpUpdates(
			asteroidsRef.current,
			result,
			now,
			levelRef.current,
		);
		asteroidsRef.current = nextAsteroids;
		setAsteroids(nextAsteroids);

		const nextBullets = bulletsRef.current.filter(
			(b) => !result.hitBulletIds.has(b.id),
		);
		bulletsRef.current = nextBullets;
		setBullets(nextBullets);

		if (result.chainHits) {
			setChainHits(result.chainHits);
		}
		if (result.destroyedCount > 0) {
			const nextScore = {
				...scoreRef.current,
				destroyed: scoreRef.current.destroyed + result.destroyedCount,
			};
			scoreRef.current = nextScore;
			setScore(nextScore);
			sendGameState();
		}

		if (bossJustDefeated) {
			onBossDefeated?.();
			return;
		}
	}

	// 期限切れ弾削除
	const expiredIds = getExpiredBulletIds(bts, now);
	if (expiredIds.size > 0) {
		const nextBullets = bulletsRef.current.filter((b) => !expiredIds.has(b.id));
		bulletsRef.current = nextBullets;
		setBullets(nextBullets);
	}

	// 星への接触判定
	const destroyedThisFrame = new Set(
		[...result.hpUpdates.entries()]
			.filter(([, newHp]) => newHp <= 0)
			.map(([id]) => id),
	);
	const contacts = getContactAsteroids({
		asteroids: asts,
		now,
		destroyedAsteroidIds: destroyedThisFrame,
		starTargetX: STAR_TARGET_X,
		starTargetY: STAR_TARGET_Y,
		starRadius: STAR_RADIUS,
		asteroidRadius: ASTEROID_RADIUS,
	});

	if (contacts.length > 0 && !contactPendingRef.current) {
		// ABYSSボス接触
		const bossContact = contacts.find((a) => a.isBoss);
		if (bossContact) {
			contactPendingRef.current = true;
			const ap = getAsteroidPosition(bossContact, now);
			setContactExplosion({ x: ap.x, y: ap.y, asteroidId: bossContact.id });
			return;
		}

		playVoice("star-damage");
		const damage = contacts.length;
		const newStarHp = Math.max(0, starHpRef.current - damage);
		starHpRef.current = newStarHp;
		setStarHp(newStarHp);
		sendGameState(true);

		const contactIds = new Set(contacts.map((c) => c.id));
		const nextAsteroids = asteroidsRef.current.map((a) =>
			contactIds.has(a.id)
				? { ...a, hasDamagedStar: true, destroyedAt: now }
				: a,
		);
		asteroidsRef.current = nextAsteroids;
		setAsteroids(nextAsteroids);

		if (newStarHp <= 0) {
			contactPendingRef.current = true;
			const ap = getAsteroidPosition(contacts[0]!, now);
			setContactExplosion({ x: ap.x, y: ap.y, asteroidId: contacts[0]!.id });
		}
	}
}
