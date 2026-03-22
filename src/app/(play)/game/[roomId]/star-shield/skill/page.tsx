import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/actions";
import { getRoomWithReadyStatus } from "@/server/actions/room";
import { RoomUserWithReadyStatus } from "@/types";
import { StarShieldSkill } from "@/components/game/phases/starShieldGame/skillScreen";

export default async function StarShieldSkillPage({
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

	return (
		<div className="relative min-h-screen">
			<StarShieldSkill roomId={roomId} currentUserId={currentUser.user.id} />
		</div>
	);
}
