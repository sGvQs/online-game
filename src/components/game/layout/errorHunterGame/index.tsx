"use client";

import { useErrorHunter } from "@/hooks/useErrorHunter";
import { useGameRoom } from "@/hooks/useGameRoom";
import { returnToRoom, leaveRoom } from "@/server/actions/room";
import { Win95Dialog } from "@/components/game/common/errorHunter/win95Dialog";
import { Win95ProgressBar } from "@/components/game/common/errorHunter/win95ProgressBar";
import { useSE } from "@/hooks/useSE";
import { useEffect, useRef, useState } from "react";
import {
	RoomWithUsersAndReadyStatus,
	RoomUserWithReadyStatus,
	UserRanking,
} from "@/types";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
import { errorHunterGame } from "@/components/game/layout/errorHunterGame/styles";
import { TitlePhase } from "@/components/game/phases/errorHunterGame/titlePhase";
import { WaitingPhase } from "@/components/game/phases/errorHunterGame/waitingPhase";
import { AppearingPhase } from "@/components/game/phases/errorHunterGame/appearingPhase";
import { ResultPhase } from "@/components/game/phases/errorHunterGame/resultPhase";
import { ProgressPanel } from "@/components/game/common/errorHunter/progressPanel";
import { PresenceDuplicateWarning } from "@/components/common/PresenceDuplicateWarning";

interface ErrorHunterGameProps {
	room: RoomWithUsersAndReadyStatus;
	isHost: boolean;
	roomId: string;
	initialMatchId: string | null;
	currentUserId: string;
	initialRankings?: UserRanking[];
}

export function ErrorHunterGame({
	room: initialRoom,
	isHost,
	roomId,
	initialMatchId,
	currentUserId,
	initialRankings = [],
}: ErrorHunterGameProps) {
	const styles = errorHunterGame();

	const { room, isReady, toggleReady, userNameMap, isTogglingReady } =
		useGameRoom({
			roomId,
			initialRoom,
			currentUserId,
		});

	const handleClose = async () => {
		await returnToRoom(roomId);
	};

	const handleLeave = async () => {
		await leaveRoom(roomId);
	};

	const {
		phase,
		match,
		progress,
		isProcessing,
		handleStartGame,
		handleClickError,
		handleFinish,
		waitProgress,
		winnerComment,
		winnerName,
		winnerFaceIconPath,
	} = useErrorHunter({ roomId, isHost, initialMatchId, currentUserId });

	const [initProgress, setInitProgress] = useState(0);
	const [isInitializing, setIsInitializing] = useState(true);
	const [showDescription, setShowDescription] = useState(false);

	const [rankings, setRankings] = useState<UserRanking[]>(initialRankings);
	const prevPhaseRef = useRef(phase);
	const { play } = useSE();

	useEffect(() => {
		setRankings(initialRankings);
	}, [initialRankings]);

	useEffect(() => {
		const prevPhase = prevPhaseRef.current;
		prevPhaseRef.current = phase;

		if (prevPhase === "RESULT" && phase === "TITLE") {
			const userIds = room.users.map((u) => u.userId);
			getNullHandRankings(userIds).then((fresh) => setRankings(fresh));
		}
	}, [phase, room.users]);

	useEffect(() => {
		if (isInitializing) {
			const interval = setInterval(() => {
				setInitProgress((prev) => {
					if (prev >= 200) {
						setIsInitializing(false);
						play("chime");
						return 200;
					}
					return prev + 8;
				});
			}, 200);
			return () => clearInterval(interval);
		}
	}, [isInitializing, play]);

	const readyCount = room.users.filter(
		(u: RoomUserWithReadyStatus) => u.isReady,
	).length;
	const totalUsers = room.users.length;
	const allUsersReady = room.users.every(
		(u: RoomUserWithReadyStatus) => u.isReady,
	);

	return (
		<PresenceDuplicateWarning roomId={roomId} currentUserId={currentUserId}>
			<div className={styles.container()}>
				{/* Initialization Dialog */}
				{isInitializing && (
					<div className="fixed inset-0 flex items-center justify-center z-50">
						<Win95Dialog title="STARTING GAME...">
							<div className="space-y-4">
								<p>Initializing...</p>
								<Win95ProgressBar progress={initProgress} />
							</div>
						</Win95Dialog>
					</div>
				)}

				{/* Title Phase (Lobby) */}
				{!isInitializing && phase === "TITLE" && (
					<TitlePhase
						room={room}
						rankings={rankings}
						isHost={isHost}
						isReady={isReady}
						isTogglingReady={isTogglingReady}
						showDescription={showDescription}
						onToggleDescription={() => setShowDescription(!showDescription)}
						onToggleReady={toggleReady}
						onStartGame={handleStartGame}
						onClose={handleClose}
						onLeave={handleLeave}
						currentUserId={currentUserId}
						allUsersReady={allUsersReady}
						isProcessing={isProcessing}
					/>
				)}

				{/* Progress Panel: WAITING, APPEARING, RESULT */}
				{(phase === "WAITING" || phase === "APPEARING" || phase === "RESULT") &&
					progress && (
						<ProgressPanel
							progress={progress}
							userNameMap={userNameMap}
							phase={phase}
						/>
					)}

				{/* Waiting Phase */}
				{phase === "WAITING" && <WaitingPhase waitProgress={waitProgress} />}

				{/* Appearing Phase */}
				{phase === "APPEARING" && match && (
					<AppearingPhase
						errorEvents={match.errorEvents}
						onCloseError={handleClickError}
						isProcessing={isProcessing}
					/>
				)}

				{/* Result Phase */}
				{phase === "RESULT" && (
					<ResultPhase
						match={match}
						winnerName={winnerName ?? "Unknown"}
						winnerComment={winnerComment ?? "私の勝ちです"}
						winnerFaceIconPath={winnerFaceIconPath}
						currentUserId={currentUserId}
						onFinish={handleFinish}
					/>
				)}
			</div>
		</PresenceDuplicateWarning>
	);
}
