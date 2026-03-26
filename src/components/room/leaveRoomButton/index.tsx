"use client";

import { useState } from "react";
import { leaveRoom } from "@/server/actions/room";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Typography } from "@/components/ui/typography";
import { useLoading } from "@/lib/loading-context";

interface LeaveRoomButtonProps {
	roomId: string;
	isHost: boolean;
}

export function LeaveRoomButton({ roomId, isHost }: LeaveRoomButtonProps) {
	const { showLoading, hideLoading } = useLoading();
	const [showConfirm, setShowConfirm] = useState(false);

	const handleConfirm = async () => {
		setShowConfirm(false);
		showLoading();
		try {
			await leaveRoom(roomId);
		} finally {
			hideLoading();
		}
	};

	return (
		<>
			<Button
				variant="success"
				className="font-cherry-bomb-one"
				onClick={() => setShowConfirm(true)}
			>
				{isHost ? "かいさんする" : "ルームをでる"}
			</Button>

			<Modal
				isOpen={showConfirm}
				onClose={() => setShowConfirm(false)}
				title="本当に退出しますか？"
				showCloseButton
			>
				<div className="flex flex-col gap-5">
					<Typography variant="body" className="text-white/80">
						{isHost
							? "解散すると、ルーム内のプレイヤーは自動的にルームから退出します。"
							: "ルームから退出します。"}
					</Typography>
					<div className="flex justify-end gap-3">
						<Button
							variant="success"
							onClick={() => setShowConfirm(false)}
						>
							<Typography variant="label" font="cherry-bomb-one" className="font-bold">
								とじる
							</Typography>
						</Button>
						<Button
							variant="danger"
							onClick={handleConfirm}
						>
							<Typography variant="label" font="cherry-bomb-one" className="font-bold">
								{isHost ? "かいさんする" : "ルームをでる"}
							</Typography>
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}
