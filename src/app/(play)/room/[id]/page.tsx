import { redirect } from "next/navigation";
import { getCurrentUser, getRoomWithUsers } from "@/server/actions";
import { RoomUserWithReadyStatus } from "@/types";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { RoomIdCopy } from "@/components/room/roomIdCopy";
import { Typography } from "@/components/ui/typography";
import { MemberListSection } from "@/components/room/memberListSection";
import { LeaveRoomButton } from "@/components/room/leaveRoomButton";
import { GameCarouselSection } from "@/components/room/gameCarouselSection";

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

	const isMember = room.users.some(
		(u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id,
	);
	if (!isMember) {
		redirect("/dashboard");
	}

	if (room.activeGameType) {
		redirect(`/game/${room.id}/${room.activeGameType}`);
	}

	const rankings = await getNullHandRankings(room.users.map((u) => u.userId));
	const rankingsMap = new Map(rankings.map((r) => [r.userId, r]));
	const isHost = room.createdBy === currentUser.user.id;

	return (
		<div className="flex justify-center items-center gap-2 p-8 min-h-screen">
			<div className="flex flex-col items-center justify-baseline gap-6 p-8">
				<PukapukaLogo />
				<RoomIdCopy roomId={room.id} />
				<div className="flex flex-col gap-2">
					<Typography variant="small" className="text-brand-600 font-medium">
						メンバー
					</Typography>
					<MemberListSection
						members={room.users}
						rankingsMap={rankingsMap}
						isHost={isHost}
						currentUserId={currentUser.user.id}
						roomId={room.id}
					/>
				</div>
				<LeaveRoomButton roomId={room.id} isHost={isHost} />
			</div>
			<div className="flex flex-col items-center gap-6 p-8 w-[600px]">
				<GameCarouselSection
					roomId={room.id}
					memberCount={room.users.length}
					isHost={isHost}
				/>
			</div>
		</div>
	);
}
