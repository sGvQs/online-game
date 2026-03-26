"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { getRoomWithUsers } from "@/server/actions";
import { getNullHandRankings } from "@/server/actions/game/rankingActions";
import type { RoomUserWithUser, UserRanking } from "@/types";

interface RoomRecord {
	active_game_type?: string;
}

export function useRoomSession({
	roomId,
	currentUserId,
	initialMembers,
	initialRankingsMap,
}: {
	roomId: string;
	currentUserId: string;
	initialMembers: RoomUserWithUser[];
	initialRankingsMap: Map<string, UserRanking>;
}) {
	const router = useRouter();
	const supabase = useMemo(() => createClient(), []);
	const [members, setMembers] = useState(initialMembers);
	const [rankingsMap, setRankingsMap] = useState(initialRankingsMap);

	const refreshRef = useRef(async () => {});
	useEffect(() => {
		refreshRef.current = async () => {
			const room = await getRoomWithUsers(roomId);
			if (!room) {
				router.push("/home");
				return;
			}
			const isMember = room.users.some((u) => u.userId === currentUserId);
			if (!isMember) {
				router.push("/home");
				return;
			}
			const rankings = await getNullHandRankings(
				room.users.map((u) => u.userId),
			);
			setMembers(room.users);
			setRankingsMap(new Map(rankings.map((r) => [r.userId, r])));
		};
	});

	useEffect(() => {
		const channel = supabase
			.channel(`room_session_${roomId}`)
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "rooms",
					filter: `id=eq.${roomId}`,
				},
				(payload: { new: RoomRecord }) => {
					if (payload.new.active_game_type) {
						router.push(`/game/${roomId}/${payload.new.active_game_type}`);
					}
				},
			)
			.on(
				"postgres_changes",
				{
					event: "DELETE",
					schema: "public",
					table: "rooms",
					filter: `id=eq.${roomId}`,
				},
				() => {
					router.push("/home");
				},
			)
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "room_users",
					filter: `room_id=eq.${roomId}`,
				},
				() => {
					refreshRef.current();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [roomId]);

	return { members, rankingsMap };
}
