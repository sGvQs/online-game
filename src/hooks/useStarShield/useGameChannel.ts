"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";
import { createClient } from "@/utils/supabase/client";
import type { SpecialAttackLevel } from "@/constants/starShieldGame/gameConfig";
import type {
	Asteroid,
	Bullet,
	FirePayload,
	GameResult,
	GameStats,
	GameStatePayload,
	GameEndPayload,
	Difficulty,
	NormalAttackLevel,
} from "@/types/starShieldGame";

import { GAME_STATE_THROTTLE_MS } from "@/constants/starShieldGame/gameConfig";

type Score = { spawned: number; destroyed: number };

interface UseGameChannelParams {
	matchId: string;
	isShooter: boolean;
	scoreRef: RefObject<Score>;
	starHpRef: RefObject<number>;
	fireCountRef: RefObject<number>;
	waveNumberRef: RefObject<number>;
	gameEndedRef: RefObject<boolean>;
	setScore: Dispatch<SetStateAction<Score>>;
	setStarHp: Dispatch<SetStateAction<number>>;
	setTypistFireCount: Dispatch<SetStateAction<number>>;
	setWaveNumber: Dispatch<SetStateAction<number>>;
	// Callbacks
	playVoice: (key: string) => void;
	onReceiveFire: (payload: FirePayload) => void;
	onGameEnd: (
		result: GameResult,
		stats: GameStats,
		difficulty?: Difficulty,
	) => void;
}

/** broadcast メッセージから payload を安全に取得（ネスト構造・直接渡しの両方に対応） */
function extractBroadcastPayload<T>(message: unknown): T | undefined {
	if (message == null) return undefined;
	const m = message as Record<string, unknown>;
	if (m.payload != null && typeof m.payload === "object") return m.payload as T;
	return message as T;
}

export function useGameChannel({
	matchId,
	isShooter,
	scoreRef,
	starHpRef,
	fireCountRef,
	waveNumberRef,
	gameEndedRef,
	setScore,
	setStarHp,
	setTypistFireCount,
	setWaveNumber,
	playVoice,
	onReceiveFire,
	onGameEnd,
}: UseGameChannelParams): {
	sendGameState: (immediate?: boolean) => void;
	sendGameEnd: (
		result: GameResult,
		stats: GameStats,
		difficulty?: Difficulty,
	) => void;
	sendFire: (payload: FirePayload) => void;
} {
	const supabase = useMemo(() => createClient(), []);
	const channelName = `star_shield_fire_${matchId}`;
	const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
	const waveTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
	const lastGameStateSendRef = useRef(0);

	const sendGameState = useCallback(
		(immediate = false) => {
			if (!isShooter) return;
			const now = Date.now();
			if (
				!immediate &&
				now - lastGameStateSendRef.current < GAME_STATE_THROTTLE_MS
			)
				return;
			lastGameStateSendRef.current = now;
			channelRef.current?.send({
				type: "broadcast",
				event: "game_state",
				payload: {
					spawned: scoreRef.current.spawned,
					destroyed: scoreRef.current.destroyed,
					fireCount: fireCountRef.current,
					starHp: starHpRef.current,
					...(waveNumberRef.current > 1 && {
						waveNumber: waveNumberRef.current,
					}),
				} satisfies GameStatePayload,
			});
		},
		[isShooter, scoreRef, fireCountRef, starHpRef],
	);

	const sendGameEnd = useCallback(
		(result: GameResult, stats: GameStats, difficulty?: Difficulty) => {
			channelRef.current?.send({
				type: "broadcast",
				event: "game_end",
				payload: {
					result,
					stats,
					...(difficulty != null && { difficulty }),
				} satisfies GameEndPayload,
			});
		},
		[],
	);

	const sendFire = useCallback((payload: FirePayload) => {
		channelRef.current?.send({
			type: "broadcast",
			event: "fire",
			payload,
		});
	}, []);

	useEffect(() => {
		const channel = supabase.channel(channelName);
		channelRef.current = channel;

		channel
			.on("broadcast", { event: "fire" }, (message: unknown) => {
				const payload = extractBroadcastPayload<FirePayload>(message);
				if (process.env.NODE_ENV === "development" && isShooter) {
					console.log("[fire:Shooter]", {
						payload,
						special: payload?.special,
						specialAttack: payload?.specialAttack,
					});
				}

				fireCountRef.current += 1;
				playVoice("shooting");
				if (isShooter) sendGameState();
				if (!isShooter) return;

				if (payload) {
					onReceiveFire(payload);
				}
			})
			.on("broadcast", { event: "game_state" }, (message: unknown) => {
				const payload = extractBroadcastPayload<GameStatePayload>(message);
				if (isShooter || !payload) return;
				if (payload.starHp < starHpRef.current) playVoice("star-damage");
				setScore({ spawned: payload.spawned, destroyed: payload.destroyed });
				setStarHp(payload.starHp);
				fireCountRef.current = payload.fireCount;
				setTypistFireCount(payload.fireCount);
				if (payload.waveNumber != null) setWaveNumber(payload.waveNumber);
			})
			.on("broadcast", { event: "game_end" }, (message: unknown) => {
				const payload = extractBroadcastPayload<GameEndPayload>(message);
				if (isShooter || !payload) return;
				if (gameEndedRef.current) return;
				gameEndedRef.current = true;
				onGameEnd(payload.result, payload.stats, payload.difficulty);
			})
			.subscribe();

		if (isShooter) sendGameState(true);

		return () => {
			waveTimeoutsRef.current.forEach(clearTimeout);
			waveTimeoutsRef.current = [];
			supabase.removeChannel(channel);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [matchId]);

	return { sendGameState, sendGameEnd, sendFire };
}
