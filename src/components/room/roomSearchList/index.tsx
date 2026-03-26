"use client";

import { useState } from "react";
import { joinRoom, deleteRoom } from "@/server/actions/room";
import { useLoading } from "@/lib/loading-context";
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
	const { showLoading, hideLoading } = useLoading();
	const [query, setQuery] = useState("");

	const handleJoin = async (roomId: string) => {
		showLoading();
		try {
			await joinRoom(roomId);
		} finally {
			hideLoading();
		}
	};

	const handleDelete = async (roomId: string) => {
		showLoading();
		try {
			await deleteRoom(roomId);
		} finally {
			hideLoading();
		}
	};

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
								onJoin={() => handleJoin(room.id)}
								onDelete={() => handleDelete(room.id)}
							/>
						))
					)}
				</div>
			)}
		</div>
	);
}
