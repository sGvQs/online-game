"use server";

import { prisma } from "@/server/lib/prisma";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "../_helpers/getAuthenticatedUser";

/**
 * 新しいルームを作成
 */
const ROOM_NAME_MAX_LENGTH = 15;

export async function createRoom(formData: FormData) {
	const rawName = formData.get("name") as string;
	const name = rawName?.trim().slice(0, ROOM_NAME_MAX_LENGTH);
	if (!name) return;

	const user = await getAuthenticatedUser();

	const room = await prisma.room.create({
		data: {
			name,
			createdBy: user.id,
		},
	});

	revalidatePath("/dashboard");
	return room;
}
