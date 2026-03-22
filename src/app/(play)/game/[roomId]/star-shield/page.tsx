import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions";
import { getRoomWithReadyStatus } from "@/server/actions/room";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
import { getStarShieldPairRankings } from "@/server/actions/game/starShieldRankingActions";
import type { PairRanking } from "@/server/actions/game/starShieldRankingActions";
import { RoomUserWithReadyStatus } from "@/types";
import { StarShieldGame } from "@/components/game/layout/starShieldGame";

function findMemberPairRank(
	rankings: PairRanking[],
	userIds: string[],
): PairRanking | null {
	if (userIds.length !== 2) return null;
	const [u1, u2] = userIds as [string, string];
	const norm1 = u1 < u2 ? u1 : u2;
	const norm2 = u1 < u2 ? u2 : u1;
	return (
		rankings.find((r) => r.user1Id === norm1 && r.user2Id === norm2) ?? null
	);
}

export default async function StarShieldPage({
	params,
}: {
	params: Promise<{ roomId: string }>;
}) {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/");

	const { roomId } = await params;

	const room = await getRoomWithReadyStatus(roomId);
	if (!room) {
		redirect("/dashboard");
	}

	const isMember = room.users.some(
		(u: RoomUserWithReadyStatus) => u.userId === currentUser.user.id,
	);
	if (!isMember) {
		redirect("/dashboard");
	}

	if (!room.activeGameType) {
		redirect(`/room/${roomId}`);
	}

	const isHost = room.createdBy === currentUser.user.id;
	const userIds = room.users.map((u) => u.userId);
	const [initialRankings, allPairRankings] = await Promise.all([
		getNullHandRankings(userIds),
		getStarShieldPairRankings(),
	]);
	const memberPairRank = findMemberPairRank(allPairRankings, userIds);

	return (
		<div className="relative min-h-screen">
			<StarShieldGame
				room={room}
				isHost={isHost}
				roomId={roomId}
				currentUserId={currentUser.user.id}
				initialRankings={initialRankings}
				memberPairRank={memberPairRank}
			/>
		</div>
	);
}
