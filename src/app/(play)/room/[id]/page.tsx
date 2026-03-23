import { redirect } from "next/navigation";
import { getCurrentUser, getRoomWithUsers } from "@/server/actions";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
import { RoomPageClientWrapper } from "@/components/room/roomPageClient";
import { IconButton } from "@/components/ui/iconButton";
import { leaveRoom } from "@/server/actions";
import { Undo2, Gamepad2 } from "lucide-react";
import { RoomUserWithReadyStatus } from "@/types";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { Typography } from "@/components/ui/typography";

export default async function RoomPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/");

	const { id } = await params;

	const room = await getRoomWithUsers(id);
	if (!room) {
		redirect("/dashboard");
	}

	// ユーザーがメンバーかチェック
	const isMember = room.users.some(
		(u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id,
	);
	if (!isMember) {
		redirect("/dashboard");
	}

	// ユーザーがホストかチェック
	const isHost = room.createdBy === currentUser.user.id;

	// ゲームが進行中ならゲームページにリダイレクト
	if (room.activeGameType) {
		redirect(`/game/${room.id}/${room.activeGameType}`);
	}

	// 参加者の月間ランキングを取得
	const userIds = room.users.map((u: RoomUserWithReadyStatus) => u.userId);
	const initialRankings = await getNullHandRankings(userIds);

	return (
		<div className="flex justify-center items-center flex-col h-screen w-full">
			<PukapukaLogo />
			<Typography variant="body" gradientColor="RedToPurple" className="font-bold mt-5">
				RoomID: {room.id}
			</Typography>
			{/* {room.users.map(user => {
				return(
					<div key={user.id} className="flex items-center gap-2">
						<Typography variant="small">
							{user.user.name}
						</Typography>
						<Typography variant="small">
							{initialRankings.find(r => r.userId === user.userId)?.rank ?? "--"}位
						</Typography>
						<Typography variant="small">
							{initialRankings.find(r => r.userId === user.userId)?.points ?? 0}pt
						</Typography>
					</div>
				)
			})} */}
		</div>
	);
}
