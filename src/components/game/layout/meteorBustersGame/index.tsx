"use client";

import { useEffect, useCallback, useRef } from "react";
import { useMeteorBusters } from "@/hooks/useMeteorBusters";
import { useGameRoom } from "@/hooks/useGameRoom";
import { returnToRoom } from "@/server/actions/room";
import { meteorBustersGame } from "./styles";
import { TitlePhase } from "@/components/game/phases/meteorBustersGame/titlePhase";
import { PlayingPhase } from "@/components/game/phases/meteorBustersGame/playingPhase";
import { ResultPhase } from "@/components/game/phases/meteorBustersGame/resultPhase";
import { PresenceDuplicateWarning } from "@/components/common/PresenceDuplicateWarning";
import type { RoomWithUsersAndReadyStatus, MeteorDifficulty } from "@/types";

interface MeteorBustersGameProps {
	room: RoomWithUsersAndReadyStatus;
	isHost: boolean;
	roomId: string;
	initialMatchId: string | null;
	currentUserId: string;
}

export function MeteorBustersGame({
	room: initialRoom,
	isHost,
	roomId,
	initialMatchId,
	currentUserId,
}: MeteorBustersGameProps) {
	const styles = meteorBustersGame();

	const { room, isReady, toggleReady, isTogglingReady } = useGameRoom({
		roomId,
		initialRoom,
		currentUserId,
	});

	const {
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
	} = useMeteorBusters({ roomId, isHost, initialMatchId, currentUserId });

	const containerRef = useRef<HTMLDivElement>(null);

	const handleClose = async () => {
		await returnToRoom(roomId);
	};

	// キーボードイベント
	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (phase !== "PLAYING") return;
			if (e.repeat) return;

			if (e.code === "Space") {
				e.preventDefault();
				handleReload();
				return;
			}

			// スペース以外のキーで射撃
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;

			// 最後のカーソル位置を使って射撃
			const cursorPos = lastCursorRef.current;
			handleShoot(cursorPos.x, cursorPos.y, rect);
		},
		[phase, handleReload, handleShoot],
	);

	const lastCursorRef = useRef({ x: 0, y: 0 });

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			lastCursorRef.current = { x, y };
			handleCursorMove(x, y);
		},
		[handleCursorMove],
	);

	const handleClick = useCallback(() => {
		if (phase !== "PLAYING") return;
		handleSwitchBullet();
	}, [phase, handleSwitchBullet]);

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [handleKeyDown]);

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;
		el.addEventListener("mousemove", handleMouseMove);
		el.addEventListener("click", handleClick);
		return () => {
			el.removeEventListener("mousemove", handleMouseMove);
			el.removeEventListener("click", handleClick);
		};
	}, [handleMouseMove, handleClick]);

	const allUsersReady = room.users.every((u) => u.isReady);

	const onStartGame = async (diff: MeteorDifficulty) => {
		await handleStartGame(diff);
	};

	return (
		<PresenceDuplicateWarning roomId={roomId} currentUserId={currentUserId}>
			<div ref={containerRef} className={styles.container()}>
				{phase === "TITLE" && (
					<TitlePhase
						room={room}
						isHost={isHost}
						isReady={isReady}
						isTogglingReady={isTogglingReady}
						allUsersReady={allUsersReady}
						isProcessing={isProcessing}
						currentUserId={currentUserId}
						onStartGame={onStartGame}
						onClose={handleClose}
						onToggleReady={toggleReady}
					/>
				)}

				{phase === "PLAYING" && (
					<PlayingPhase
						meteors={meteors}
						bulletType={bulletType}
						ammoRemaining={ammoRemaining}
						playerCursors={playerCursors}
						bulletAnims={bulletAnims}
						destroyedCount={destroyedCount}
						spawnedCount={spawnedCount}
						totalSpawnCount={totalSpawnCount}
						difficulty={difficulty}
						currentUserId={currentUserId}
					/>
				)}

				{phase === "RESULT" && result && (
					<ResultPhase
						result={result}
						isHost={isHost}
						onReturnToTitle={handleReturnToTitle}
					/>
				)}
			</div>
		</PresenceDuplicateWarning>
	);
}
