"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { motion, useAnimationControls } from "framer-motion";
import { useMeteorBusters } from "@/hooks/useMeteorBusters";
import { useGameRoom } from "@/hooks/useGameRoom";
import { returnToRoom } from "@/server/actions/room";
import { meteorBustersGame } from "./styles";
import { TitlePhase } from "@/components/game/phases/meteorBustersGame/titlePhase";
import { PlayingPhase } from "@/components/game/phases/meteorBustersGame/playingPhase";
import { ResultPhase } from "@/components/game/phases/meteorBustersGame/resultPhase";
import { PresenceDuplicateWarning } from "@/components/common/PresenceDuplicateWarning";
import { SCREEN_SHAKE_PRESETS, type ScreenShakeStrength } from "@/lib/shooter/screen-shake";
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

	const containerRef = useRef<HTMLDivElement>(null);
	const lastCursorRef = useRef({ x: 0, y: 0 });
	const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });

	// スクリーンシェイク
	const shakeControls = useAnimationControls();
	const handleShake = useCallback(
		async (strength: ScreenShakeStrength) => {
			const preset = SCREEN_SHAKE_PRESETS[strength];
			await shakeControls.start({
				x: [...preset.x],
				y: [...preset.y],
				transition: { duration: preset.durationSec, ease: "easeOut" },
			});
			shakeControls.set({ x: 0, y: 0 });
		},
		[shakeControls],
	);

	const {
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
	} = useMeteorBusters({
		roomId,
		isHost,
		initialMatchId,
		currentUserId,
		containerRef,
		onShake: handleShake,
	});

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

			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			const cursorPos = lastCursorRef.current;
			handleShoot(cursorPos.x, cursorPos.y, rect);
		},
		[phase, handleReload, handleShoot],
	);

	const handleMouseMove = useCallback(
		(e: MouseEvent) => {
			const rect = containerRef.current?.getBoundingClientRect();
			if (!rect) return;
			const x = e.clientX - rect.left;
			const y = e.clientY - rect.top;
			lastCursorRef.current = { x, y };
			setCursorPos({ x, y });
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
			<motion.div
				ref={containerRef}
				className={styles.container()}
				animate={shakeControls}
			>
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
						collisions={collisions}
						cursorX={cursorPos.x}
						cursorY={cursorPos.y}
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
			</motion.div>
		</PresenceDuplicateWarning>
	);
}
