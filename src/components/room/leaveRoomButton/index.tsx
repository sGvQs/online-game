"use client";

import { leaveRoom } from "@/server/actions/room";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/lib/loading-context";

interface LeaveRoomButtonProps {
	roomId: string;
	isHost: boolean;
}

export function LeaveRoomButton({ roomId, isHost }: LeaveRoomButtonProps) {
	const { showLoading, hideLoading } = useLoading();

	const handleLeave = async () => {
		showLoading();
		try {
			await leaveRoom(roomId);
		} finally {
			hideLoading();
		}
	};

	return (
		<Button
			variant="success"
			className="font-cherry-bomb-one"
			onClick={handleLeave}
		>
			{isHost ? "かいさんする" : "ルームをでる"}
		</Button>
	);
}
