"use server";

import { prisma } from "@/server/lib/prisma";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "../_helpers/getAuthenticatedUser";

/**
 * 新しいルームを作成し、作成者をメンバーとして登録した上でルーム画面へ遷移
 */
export async function createRoom() {
	const user = await getAuthenticatedUser();

	const room = await prisma.room.create({
		data: {
			createdBy: user.id,
			users: {
				create: { userId: user.id },
			},
		},
	});

	redirect(`/room/${room.id}`);
}
