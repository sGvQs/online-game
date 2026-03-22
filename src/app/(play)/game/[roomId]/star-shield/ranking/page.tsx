import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions";
import { getRoomWithReadyStatus } from "@/server/actions/room";
import { getStarShieldPairRankings } from "@/server/actions/game/starShieldRankingActions";
import { RoomUserWithReadyStatus } from "@/types";
import { StarShieldRankingScreen } from "@/components/game/phases/starShieldGame/rankingScreen";

export default async function StarShieldRankingPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/");

	const { roomId } = await params;

	const room = await getRoomWithReadyStatus(roomId);
	if (!room) redirect("/dashboard");

	const isMember = room.users.some(
		(u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id,
	);
	if (!isMember) redirect("/dashboard");

	const rankings = await getStarShieldPairRankings(50);
	const memberUserIds = room.users.map(
		(u: RoomUserWithReadyStatus) => u.userId,
	);

	return (
		<div className="relative min-h-screen">
			<StarShieldRankingScreen
				roomId={roomId}
				rankings={rankings}
				memberUserIds={memberUserIds}
			/>
		</div>
	);
}
