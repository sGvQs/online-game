"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";

interface UsePresenceDuplicateWarningProps {
	roomId: string;
	currentUserId: string;
}

export function usePresenceDuplicateWarning({
	roomId,
	currentUserId,
}: UsePresenceDuplicateWarningProps) {
	const supabase = useMemo(() => createClient(), []);
	const [isDuplicate, setIsDuplicate] = useState(false);

	useEffect(() => {
		const channelName = `room_presence_${roomId}`;
		const channel = supabase.channel(channelName);

		channel
			.on("presence", { event: "sync" }, () => {
				const state = channel.presenceState();
				let count = 0;
				for (const key of Object.keys(state)) {
					const presences = state[key] as { userId?: string }[];
					for (const p of presences) {
						if (p?.userId === currentUserId) {
							count++;
							break;
						}
					}
				}
				setIsDuplicate(count >= 2);
			})
			.subscribe(async (status: string) => {
				if (status === "SUBSCRIBED") {
					await channel.track({ userId: currentUserId });
				}
			});

		return () => {
			supabase.removeChannel(channel);
		};
	}, [supabase, roomId, currentUserId]);

	return { isDuplicate };
}
