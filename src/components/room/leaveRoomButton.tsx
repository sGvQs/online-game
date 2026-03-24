"use client";

import { useTransition } from "react";
import { leaveRoom } from "@/server/actions/room";
import { Button } from "@/components/ui/button";

interface LeaveRoomButtonProps {
	roomId: string;
	isHost: boolean;
}

export function LeaveRoomButton({ roomId, isHost }: LeaveRoomButtonProps) {
	const [isLeaving, startLeaveTransition] = useTransition();

	const handleLeave = () => {
		startLeaveTransition(async () => {
			await leaveRoom(roomId);
		});
	};

	return (
		<Button
			variant="solid"
			className="font-cherry-bomb-one"
			onClick={handleLeave}
			disabled={isLeaving}
		>
			{isLeaving ? "処理中..." : isHost ? "ルームをかいさんする" : "ルームをでる"}
		</Button>
	);
}
