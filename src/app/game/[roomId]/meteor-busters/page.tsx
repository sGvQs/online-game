import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions";
import { getRoomWithReadyStatus } from "@/server/actions/room";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
import { MeteorBustersGame } from "@/components/game/layout/meteorBustersGame";
import { RoomUserWithReadyStatus } from "@/types";

export default async function MeteorBustersPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/");

	const { roomId } = await params;

	const room = await getRoomWithReadyStatus(roomId);
	if (!room) redirect("/home");

	const isMember = room.users.some(
		(u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id,
	);
	if (!isMember) redirect("/home");

	if (!room.activeGameType) redirect(`/room/${roomId}`);

	const isHost = room.createdBy === currentUser.user.id;
	const userIds = room.users.map((u: RoomUserWithReadyStatus) => u.userId);
	const rankings = await getNullHandRankings(userIds);

	return (
		<div className="relative min-h-screen">
			<MeteorBustersGame
				room={room}
				isHost={isHost}
				roomId={roomId}
				initialMatchId={room.currentMatchId}
				currentUserId={currentUser.user.id}
				rankings={rankings}
			/>
		</div>
	);
}
