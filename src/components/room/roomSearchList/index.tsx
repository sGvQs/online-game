"use client";

import { useState } from "react";
import { joinRoom, deleteRoom } from "@/server/actions/room";
import { RoomCard } from "../roomCard";
import { roomSearchList } from "./styles";
import { Typography } from "@/components/ui/typography";
import type { RoomWithCreator } from "@/types";

interface RoomSearchListProps {
	initialRooms: RoomWithCreator[];
	userId: string;
}

export function RoomSearchList({ initialRooms, userId }: RoomSearchListProps) {
	const styles = roomSearchList();
	const [query, setQuery] = useState("");

	const trimmedQuery = query.trim();
	const filtered = trimmedQuery
		? initialRooms.filter((room) => {
				const q = trimmedQuery.toLowerCase();
				return (
					room.id.toLowerCase().includes(q) ||
					room.creator.name.toLowerCase().includes(q)
				);
			})
		: [];

	return (
		<div className={styles.wrapper()}>
			<input
				className={styles.searchInput()}
				placeholder="ルームIDまたはホスト名で検索"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				autoFocus
			/>
			{trimmedQuery && (
				<div className={styles.grid()}>
					{filtered.length === 0 ? (
						<Typography variant="small" as="p" className={styles.emptyState()}>
							該当するルームが見つかりません
						</Typography>
					) : (
						filtered.map((room) => (
							<RoomCard
								key={room.id}
								room={room}
								isOwner={room.createdBy === userId}
								onJoin={joinRoom.bind(null, room.id)}
								onDelete={deleteRoom.bind(null, room.id)}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
}
