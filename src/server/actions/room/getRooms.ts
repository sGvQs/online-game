"use server";

import { prisma } from "@/server/lib/prisma";

/**
 * ルーム一覧を取得
 */
export async function getRooms() {
	const rooms = await prisma.room.findMany({
		include: { users: true },
		orderBy: { createdAt: "desc" },
	});
	return rooms;
}
