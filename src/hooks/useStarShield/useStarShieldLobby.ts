"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useLobbyChannel } from "@/hooks/useStarShield/useLobbyChannel";
import { useMatchSync } from "@/hooks/useStarShield/useMatchSync";
import {
	createStarShieldSetupMatch,
	updateStarShieldSetupMatch,
	startStarShieldMatch,
	getUnlockStatus,
	getStarShieldProgress,
	getMyStarShieldProgress,
	updateLoadout,
	getMonthlyRankingInfo,
} from "@/server/actions/game";
import { clearCurrentMatch, resetAllReady } from "@/server/actions/room";
import type { RoomWithUsersAndReadyStatus } from "@/types";
import type {
	Difficulty,
	GamePhase,
	GameResult,
	GameStats,
	NormalAttackLevel,
	RoleChoice,
} from "@/types/starShieldGame";
import type { StarShieldProgress } from "@/types/starShieldGame";
import {
	getAvailableNormalAttacks,
	getAvailableSpecialAttacks,
} from "@/utils/starShieldGame";
import type { TechniqueId } from "@/constants/starShieldGame/techniques";
import type { SpecialAttackChoice } from "@/utils/starShieldGame";

interface UseStarShieldLobbyParams {
	room: RoomWithUsersAndReadyStatus;
	isHost: boolean;
	roomId: string;
	currentUserId: string;
}

export interface PlayingProps {
	matchId: string;
	startedAt: number;
	shooterId: string;
	typistNormalAttack: TechniqueId;
	typistSpecialAttack: SpecialAttackChoice;
	typistSpecialAttackLevel: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
	typistHealLevel: number | null;
	starHpLevel: number;
	level: NormalAttackLevel;
}

export interface UseStarShieldLobbyReturn {
	phase: GamePhase;
	difficulty: Difficulty;
	matchId: string | null;
	startedAt: number | null;
	shooterId: string | null;
	roleChoices: Record<string, RoleChoice>;
	roleConflict: boolean;
	shooterIdForUnlock: string | undefined;
	hellUnlocked: boolean;
	abyssUnlocked: boolean;
	shooterProgress: StarShieldProgress | null;
	typistProgress: StarShieldProgress | null;
	currentUserProgress: StarShieldProgress | null;
	playingProps: PlayingProps | null;
	gameResult: GameResult | null;
	gameStats: GameStats | null;
	gameResultDifficulty: Difficulty | null;
	currentUserRankingBefore: { points: number; rank: number } | null;
	allUsersReady: boolean;
	canStartLobby: boolean;
	handleRoleChange: (role: RoleChoice) => Promise<void>;
	handleDifficultyChange: (d: Difficulty) => Promise<void>;
	handleStartGame: () => Promise<void>;
	handleProceedToGame: () => Promise<void>;
	handleBackToLobby: () => Promise<void>;
	handleGameEnd: (
		result: GameResult,
		stats: GameStats,
		actualDifficulty?: Difficulty,
	) => void;
	handleBackToTitle: () => Promise<void>;
	handleShooterLoadoutUpdate: (
		updates: Parameters<typeof updateLoadout>[0],
	) => Promise<void>;
}

export function useStarShieldLobby({
	room,
	isHost,
	roomId,
	currentUserId,
}: UseStarShieldLobbyParams): UseStarShieldLobbyReturn {
	const supabase = useMemo(() => createClient(), []);

	// ============================================
	// State
	// ============================================

	const [phase, setPhase] = useState<GamePhase>("TITLE");
	const [difficulty, setDifficulty] = useState<Difficulty>("NORMAL");
	const [matchId, setMatchId] = useState<string | null>(null);
	const [startedAt, setStartedAt] = useState<number | null>(null);
	const [shooterId, setShooterId] = useState<string | null>(null);
	const [gameResult, setGameResult] = useState<GameResult | null>(null);
	const [gameStats, setGameStats] = useState<GameStats | null>(null);
	const [gameResultDifficulty, setGameResultDifficulty] =
		useState<Difficulty | null>(null);
	const [hellUnlocked, setHellUnlocked] = useState(false);
	const [abyssUnlocked, setAbyssUnlocked] = useState(false);
	const [shooterProgress, setShooterProgress] =
		useState<StarShieldProgress | null>(null);
	const [typistProgress, setTypistProgress] =
		useState<StarShieldProgress | null>(null);
	const [currentUserProgress, setCurrentUserProgress] =
		useState<StarShieldProgress | null>(null);
	const [initialRanking, setInitialRanking] = useState<{
		points: number;
		rank: number;
	} | null>(null);
	const [roleChoices, setRoleChoices] = useState<Record<string, RoleChoice>>(
		{},
	);

	// matchId を ref でも保持（lobbyChannel が deps なしで参照するため）
	const matchIdRef = useRef(matchId);
	matchIdRef.current = matchId;

	// ============================================
	// 初期役職の割り当て（2人揃った時点でデフォルト設定）
	// ============================================

	useEffect(() => {
		if (room.users.length !== 2) return;
		const hostId = room.createdBy;
		setRoleChoices((prev) => {
			const missing = room.users.filter((u) => !(u.userId in prev));
			if (missing.length === 0) return prev;
			const next = { ...prev };
			for (const u of missing) {
				next[u.userId] = u.userId === hostId ? "SHOOTER" : "TYPIST";
			}
			return next;
		});
	}, [room.users, room.createdBy]);

	// ============================================
	// 派生値（useLobbyChannel より前に定義する必要あり）
	// ============================================

	const roleConflict = useMemo(() => {
		const users = room.users;
		if (users.length !== 2) return true;
		const choices = users.map((u) => roleChoices[u.userId]).filter(Boolean);
		if (choices.length !== 2) return true;
		return choices[0] === choices[1];
	}, [room.users, roleChoices]);

	const shooterIdForUnlock = room.users.find(
		(u) => roleChoices[u.userId] === "SHOOTER",
	)?.userId;
	const typistIdForUnlock = room.users.find(
		(u) => roleChoices[u.userId] === "TYPIST",
	)?.userId;

	const refreshProgress = useCallback(async () => {
		if (phase !== "ROLE_SELECT") return;
		const p1 = getMyStarShieldProgress().then(setCurrentUserProgress);
		const p2 =
			shooterIdForUnlock && typistIdForUnlock && !roleConflict
				? Promise.all([
						getStarShieldProgress(shooterIdForUnlock).then(setShooterProgress),
						getStarShieldProgress(typistIdForUnlock).then(setTypistProgress),
					])
				: Promise.resolve();
		await Promise.all([p1, p2]);
	}, [phase, shooterIdForUnlock, typistIdForUnlock, roleConflict]);

	// ============================================
	// ロビー broadcast チャンネル（難易度・役職・ゲーム開始の同期）
	// ============================================

	const lobbyChannelRef = useLobbyChannel({
		roomId,
		phase,
		matchIdRef,
		supabase,
		setDifficulty,
		setRoleChoices,
		setStartedAt,
		setShooterId,
		setPhase,
		setShooterProgress,
		setTypistProgress,
		onLoadoutUpdated: refreshProgress,
	});

	// ============================================
	// DB 主導フェーズ同期（リロード・途中参加対応）
	// ============================================

	useMatchSync({
		currentMatchId: room.currentMatchId,
		phase,
		setPhase,
		setMatchId,
		setDifficulty,
		setRoleChoices,
		setStartedAt,
		setShooterId,
		setShooterProgress,
		setTypistProgress,
		setGameResult,
		setGameStats,
		setGameResultDifficulty,
	});

	// ============================================
	// プログレス・難易度解放の取得（ROLE_SELECT フェーズ）
	// ============================================

	useEffect(() => {
		if (phase !== "ROLE_SELECT") return;
		const controller = new AbortController();
		const { signal } = controller;

		if (shooterIdForUnlock && typistIdForUnlock && !roleConflict) {
			getUnlockStatus(shooterIdForUnlock, typistIdForUnlock).then(
				({ hellUnlocked, abyssUnlocked }) => {
					if (!signal.aborted) {
						setHellUnlocked(hellUnlocked);
						setAbyssUnlocked(abyssUnlocked);
					}
				},
			);
			getStarShieldProgress(shooterIdForUnlock).then((v) => {
				if (!signal.aborted) setShooterProgress(v);
			});
			getStarShieldProgress(typistIdForUnlock).then((v) => {
				if (!signal.aborted) setTypistProgress(v);
			});
		} else if (roleConflict && room.users.length >= 2) {
			const [u0, u1] = room.users;
			getUnlockStatus(u0.userId, u1.userId).then(
				({ hellUnlocked, abyssUnlocked }) => {
					if (!signal.aborted) {
						setHellUnlocked(hellUnlocked);
						setAbyssUnlocked(abyssUnlocked);
					}
				},
			);
			setShooterProgress(null);
			setTypistProgress(null);
		} else {
			setHellUnlocked(false);
			setAbyssUnlocked(false);
			setShooterProgress(null);
			setTypistProgress(null);
		}

		return () => {
			controller.abort();
		};
	}, [phase, shooterIdForUnlock, typistIdForUnlock, roleConflict, room.users]);

	useEffect(() => {
		if (phase !== "ROLE_SELECT") return;
		getMyStarShieldProgress().then(setCurrentUserProgress);
		getMonthlyRankingInfo(currentUserId).then(setInitialRanking);
	}, [phase, currentUserId]);

	// ============================================
	// 難易度の自動リセット（解放されていない難易度が選択された場合）
	// ============================================

	useEffect(() => {
		const needsReset =
			(!hellUnlocked && difficulty === "HELL") ||
			(!abyssUnlocked && difficulty === "ABYSS");
		if (needsReset) {
			setDifficulty("EASY");
			if (isHost) {
				lobbyChannelRef.current?.send({
					type: "broadcast",
					event: "difficulty",
					payload: { difficulty: "EASY" as const },
				});
			}
		}
	}, [hellUnlocked, abyssUnlocked, difficulty, isHost, lobbyChannelRef]);

	// ============================================
	// ハンドラ
	// ============================================

	const allUsersReady =
		room.users.length > 0 && room.users.every((u) => u.isReady);
	const canStartLobby = allUsersReady;

	const handleRoleChange = useCallback(
		async (role: RoleChoice) => {
			const nextChoices = { ...roleChoices, [currentUserId]: role };
			setRoleChoices(nextChoices);
			lobbyChannelRef.current?.send({
				type: "broadcast",
				event: "role",
				payload: { userId: currentUserId, role },
			});
			if (matchId && phase === "ROLE_SELECT") {
				const sId = room.users.find(
					(u) => nextChoices[u.userId] === "SHOOTER",
				)?.userId;
				const tId = room.users.find(
					(u) => nextChoices[u.userId] === "TYPIST",
				)?.userId;
				if (sId && tId) {
					await updateStarShieldSetupMatch(matchId, {
						shooterId: sId,
						typistId: tId,
					});
				}
			}
		},
		[currentUserId, roleChoices, matchId, room.users, phase, lobbyChannelRef],
	);

	const handleDifficultyChange = useCallback(
		async (d: Difficulty) => {
			setDifficulty(d);
			if (isHost) {
				lobbyChannelRef.current?.send({
					type: "broadcast",
					event: "difficulty",
					payload: { difficulty: d },
				});
				if (matchId && phase === "ROLE_SELECT") {
					await updateStarShieldSetupMatch(matchId, { difficulty: d });
				}
			}
		},
		[isHost, matchId, phase, lobbyChannelRef],
	);

	const handleStartGame = useCallback(async () => {
		if (!canStartLobby || !isHost) return;
		try {
			const hostId = room.createdBy;
			const other = room.users.find((u) => u.userId !== hostId);
			const typistId = other?.userId ?? hostId;
			await createStarShieldSetupMatch(roomId, { shooterId: hostId, typistId });
			// DB-driven: room.currentMatchId が更新され useMatchSync がフェーズを切り替える
		} catch (e) {
			console.error("セットアップ開始失敗:", e);
		}
	}, [canStartLobby, isHost, room.createdBy, room.users, roomId]);

	const handleProceedToGame = useCallback(async () => {
		if (roleConflict || !matchId || !isHost) return;
		const shooterIdFromRoles = room.users.find(
			(u) => roleChoices[u.userId] === "SHOOTER",
		)?.userId;
		const typistIdFromRoles = room.users.find(
			(u) => roleChoices[u.userId] === "TYPIST",
		)?.userId;
		if (!shooterIdFromRoles || !typistIdFromRoles) return;
		try {
			const { startedAt: ts, shooterId: sid } =
				await startStarShieldMatch(matchId);
			setStartedAt(ts);
			setShooterId(sid);
			lobbyChannelRef.current?.send({
				type: "broadcast",
				event: "startGame",
				payload: {},
			});
			setPhase("PLAYING");
		} catch (e) {
			console.error("ゲーム開始失敗:", e);
		}
	}, [roleConflict, matchId, isHost, room.users, roleChoices, lobbyChannelRef]);

	const handleBackToLobby = useCallback(async () => {
		setPhase("TITLE");
		try {
			await clearCurrentMatch(roomId);
		} catch (e) {
			console.error("ロビー戻り失敗:", e);
		}
	}, [roomId]);

	const handleGameEnd = useCallback(
		(result: GameResult, stats: GameStats, actualDifficulty?: Difficulty) => {
			setGameResult(result);
			setGameStats(stats);
			if (actualDifficulty != null) setGameResultDifficulty(actualDifficulty);
			setPhase("RESULT");
		},
		[],
	);

	const handleBackToTitle = useCallback(async () => {
		setMatchId(null);
		setStartedAt(null);
		setShooterId(null);
		setGameResult(null);
		setGameStats(null);
		setGameResultDifficulty(null);
		setPhase("TITLE");
		try {
			await Promise.all([resetAllReady(roomId), clearCurrentMatch(roomId)]);
		} catch (e) {
			console.error("タイトル戻り失敗:", e);
		}
	}, [roomId]);

	const handleShooterLoadoutUpdate = useCallback(
		async (updates: Parameters<typeof updateLoadout>[0]) => {
			const result = await updateLoadout(updates);
			if (result.ok) {
				await refreshProgress();
				// Typist に最新ロードアウトを通知（自分以外が refreshProgress を呼ぶ）
				lobbyChannelRef.current?.send({
					type: "broadcast",
					event: "loadout_updated",
					payload: {},
				});
			}
		},
		[refreshProgress, lobbyChannelRef],
	);

	// ============================================
	// PLAYING フェーズ用ロードアウト導出
	// ============================================

	const playingProps = useMemo((): PlayingProps | null => {
		if (!matchId || !startedAt || !shooterId) return null;

		const shooterOwned = shooterProgress ?? {
			normalAttacks: [{ techniqueId: "red", level: 1 }],
			specialAttacks: [],
			healLevel: null,
		};
		const availableNormalAttacks = getAvailableNormalAttacks(shooterOwned);
		const availableSpecialAttacks = getAvailableSpecialAttacks(shooterOwned);

		const rawNormal = shooterProgress?.selectedNormalAttackId ?? "red";
		const selectedNormal: TechniqueId = availableNormalAttacks.some(
			(a) => a.techniqueId === rawNormal,
		)
			? (rawNormal as TechniqueId)
			: (availableNormalAttacks[0]?.techniqueId ?? "red");
		const derivedLevel: NormalAttackLevel = (availableNormalAttacks.find(
			(a) => a.techniqueId === selectedNormal,
		)?.level ?? 1) as NormalAttackLevel;

		// Typist の healLevel === 6 なら all_destruction を自動適用（Shooter の選択より優先）
		const typistHasAllDestruction = typistProgress?.healLevel === 6;
		const rawSpecial = shooterProgress?.selectedSpecialAttackId ?? "spread";
		const selectedSpecialId: SpecialAttackChoice = typistHasAllDestruction
			? "all_destruction"
			: availableSpecialAttacks.some((a) => a.specialAttackId === rawSpecial)
				? (rawSpecial as SpecialAttackChoice)
				: (availableSpecialAttacks[0]?.specialAttackId ?? "spread");

		const typistSpecialAttackLevel = (availableSpecialAttacks.find(
			(a) => a.specialAttackId === rawSpecial,
		)?.level ?? 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
		const typistHealLevel = typistProgress?.selectedHealLevel ?? null;
		const starHpLevel = typistProgress?.starHpLevel ?? 1;

		return {
			matchId,
			startedAt,
			shooterId,
			typistNormalAttack: selectedNormal,
			typistSpecialAttack: selectedSpecialId,
			typistSpecialAttackLevel,
			typistHealLevel,
			starHpLevel,
			level: derivedLevel,
		};
	}, [matchId, startedAt, shooterId, shooterProgress, typistProgress]);

	return {
		phase,
		difficulty,
		matchId,
		startedAt,
		shooterId,
		roleChoices,
		roleConflict,
		shooterIdForUnlock,
		hellUnlocked,
		abyssUnlocked,
		shooterProgress,
		typistProgress,
		currentUserProgress,
		currentUserRankingBefore: initialRanking,
		playingProps,
		gameResult,
		gameStats,
		gameResultDifficulty,
		allUsersReady,
		canStartLobby,
		handleRoleChange,
		handleDifficultyChange,
		handleStartGame,
		handleProceedToGame,
		handleBackToLobby,
		handleGameEnd,
		handleBackToTitle,
		handleShooterLoadoutUpdate,
	};
}
