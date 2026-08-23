import { redirect } from "next/navigation";
import { getCurrentUser, getRoomWithUsers } from "@/server/actions";
import { RoomUserWithReadyStatus } from "@/types";
import { getRoomMemberRankings } from "@/server/actions/game/rankingActions";
import { RoomClient } from "@/components/room/roomClient";

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
		redirect("/home");
	}

	const isMember = room.users.some(
		(u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id,
	);
	if (!isMember) {
		redirect("/home");
	}

	if (room.activeGameType) {
		redirect(`/game/${room.id}/${room.activeGameType}`);
	}

	const rankings = await getRoomMemberRankings(room.users.map((u) => u.userId));
	const isHost = room.createdBy === currentUser.user.id;

	return (
		<RoomClient
			roomId={room.id}
			currentUserId={currentUser.user.id}
			hostUserId={room.createdBy}
			isHost={isHost}
			initialMembers={room.users}
			initialRankings={rankings}
		/>
	);
}
