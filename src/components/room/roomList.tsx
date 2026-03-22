"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState, useCallback, useRef } from "react";
import { joinRoom, deleteRoom, getRooms } from "@/server/actions/room";
import { RoomCard, RoomListEmptyState, type RoomWithUsers } from "./roomCard";
import { roomList } from "./roomList.styles";

const styles = roomList();

export function RoomList({
	initialRooms,
	userId,
}: {
	initialRooms: RoomWithUsers[];
	userId: string;
}) {
	const [rooms, setRooms] = useState<RoomWithUsers[]>(initialRooms);
	const supabaseRef = useRef(createClient());

	const fetchRooms = useCallback(async () => {
		try {
			const data = await getRooms();
			if (data) {
				setRooms(data);
			}
		} catch (e) {
			console.error(e);
		}
	}, []);

	useEffect(() => {
		setRooms(initialRooms);
	}, [initialRooms]);

	useEffect(() => {
		const supabase = supabaseRef.current;
		const channel = supabase
			.channel("rooms_list")
			.on(
				"postgres_changes",
				{
					event: "*",
					schema: "public",
					table: "rooms",
					filter: "status=neq.FINISHED",
				},
				() => {
					fetchRooms();
				},
			)
			.subscribe();

		return () => {
			supabase.removeChannel(channel);
		};
	}, [fetchRooms]);

	if (rooms.length === 0) {
		return (
			<div className={styles.grid()}>
				<RoomListEmptyState />
			</div>
		);
	}

	return (
		<div className={styles.grid()}>
			{rooms.map((room) => (
				<RoomCard
					key={room.id}
					room={room}
					isOwner={room.createdBy === userId}
					onJoin={joinRoom.bind(null, room.id)}
					onDelete={deleteRoom.bind(null, room.id)}
				/>
			))}
		</div>
	);
}
