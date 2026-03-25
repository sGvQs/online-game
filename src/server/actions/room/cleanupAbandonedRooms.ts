"use server";

import { prisma } from "@/server/lib/prisma";
import { getAuthenticatedUser } from "../_helpers/getAuthenticatedUser";

/** 放置とみなす時間（ミリ秒） */
const ABANDONED_THRESHOLD_MS = 3 * 60 * 60 * 1000; // 3時間

/**
 * updatedAt が3時間以上前のルームを削除し、創作者に通知を作成する。
 * status に関係なく、最終更新から3時間経過したルームが対象。
 * ホーム訪問時に誰でも実行可能。
 *
 * 注: revalidatePath は呼ばない。この関数はホームの初回レンダー中に
 * 呼ばれるため、revalidatePath('/home') を実行すると Next.js がエラーになる。
 * 同一リクエスト内で getRooms() により既に最新データが取得されるため不要。
 */
export async function cleanupAbandonedRooms() {
	await getAuthenticatedUser();

	const threshold = new Date(Date.now() - ABANDONED_THRESHOLD_MS);

	const abandonedRooms = await prisma.room.findMany({
		where: {
			updatedAt: { lt: threshold },
		},
		select: { id: true, createdBy: true },
	});

	if (abandonedRooms.length > 0) {
		await prisma.roomDeletedNotification.createMany({
			data: abandonedRooms.map((room) => ({
				userId: room.createdBy,
			})),
		});

		await prisma.room.deleteMany({
			where: { id: { in: abandonedRooms.map((r) => r.id) } },
		});
	}
}
