import { redirect } from "next/navigation";
import { getCurrentUser, getRoomWithUsers } from "@/server/actions";
import { RoomUserWithReadyStatus } from "@/types";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
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
	const isHost = room.createdBy === currentUser.user.id;

	return (
		<RoomClient
			roomId={room.id}
			currentUserId={currentUser.user.id}
			isHost={isHost}
			initialMembers={room.users}
			initialRankings={rankings}
		/>
	);
}
