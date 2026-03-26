"use server";

import { prisma } from "@/server/lib/prisma";

/**
 * ルーム一覧を取得
 */
export async function getRooms() {
	const rooms = await prisma.room.findMany({
		include: { users: true, creator: true },
		orderBy: { createdAt: "desc" },
	});
	return rooms;
}

/**
 * ルーム一覧を作成者情報付きで取得（検索画面用）
 */
export async function getRoomsWithCreator() {
	return prisma.room.findMany({
		where: { status: { not: "FINISHED" } },
		include: {
			users: true,
			creator: true,
		},
		orderBy: { createdAt: "desc" },
	});
}
