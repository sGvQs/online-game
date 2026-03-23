"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { kickUserFromRoom } from "@/server/actions/room";
import { RoomUserWithUser, UserRanking } from "@/types";
import { MemberItem } from "@/components/room/memberItem";

interface MemberListSectionProps {
	members: RoomUserWithUser[];
	rankingsMap: Map<string, UserRanking>;
	isHost: boolean;
	currentUserId: string;
	roomId: string;
}

export function MemberListSection({
	members,
	rankingsMap,
	isHost,
	currentUserId,
	roomId,
}: MemberListSectionProps) {
	const router = useRouter();
	const [kickingUserId, setKickingUserId] = useState<string | null>(null);

	const handleKick = async (targetUserId: string) => {
		setKickingUserId(targetUserId);
		try {
			await kickUserFromRoom(roomId, targetUserId);
			router.refresh();
		} finally {
			setKickingUserId(null);
		}
	};

	return (
		<ul className="flex flex-col gap-1 min-w-[300px]">
			{members.map((member) => (
				<MemberItem
					key={member.id}
					member={member}
					ranking={rankingsMap.get(member.userId)}
					showKickButton={isHost && member.userId !== currentUserId}
					onKick={() => handleKick(member.userId)}
					isKicking={kickingUserId === member.userId}
				/>
			))}
		</ul>
	);
}
