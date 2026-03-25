"use client";

import { useMemo } from "react";
import { useRoomSession } from "@/hooks/useRoomSession";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { RoomIdCopy } from "@/components/room/roomIdCopy";
import { Typography } from "@/components/ui/typography";
import { MemberListSection } from "@/components/room/memberListSection";
import { GameCarouselSection } from "@/components/room/gameCarouselSection";
import { roomClient } from "./styles";
import type { RoomUserWithUser, UserRanking } from "@/types";

interface RoomClientProps {
	roomId: string;
	currentUserId: string;
	hostUserId: string;
	isHost: boolean;
	initialMembers: RoomUserWithUser[];
	initialRankings: UserRanking[];
}

export function RoomClient({
	roomId,
	currentUserId,
	hostUserId,
	isHost,
	initialMembers,
	initialRankings,
}: RoomClientProps) {
	const styles = roomClient();
	const initialRankingsMap = useMemo(
		() => new Map(initialRankings.map((r) => [r.userId, r])),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[],
	);

	const { members, rankingsMap } = useRoomSession({
		roomId,
		currentUserId,
		initialMembers,
		initialRankingsMap,
	});

	return (
		<div className={styles.wrapper()}>
			<div className={styles.inner()}>
				<div className={styles.leftPanel()}>
					<PukapukaLogo />
					<RoomIdCopy roomId={roomId} />
					<div className={styles.memberSection()}>
						<Typography variant="small" className="text-brand-600 font-medium">
							メンバー {members.length}/8人
						</Typography>
						<MemberListSection
							members={members}
							rankingsMap={rankingsMap}
							isHost={isHost}
							currentUserId={currentUserId}
							hostUserId={hostUserId}
							roomId={roomId}
						/>
					</div>
				</div>
				<div className={styles.rightPanel()}>
					<GameCarouselSection
						roomId={roomId}
						memberCount={members.length}
						isHost={isHost}
					/>
				</div>
			</div>
		</div>
	);
}
