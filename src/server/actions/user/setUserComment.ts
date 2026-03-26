"use server";

import { prisma } from "@/server/lib/prisma";
import { getAuthenticatedUserOrNull } from "../_helpers/getAuthenticatedUser";
import { revalidatePath } from "next/cache";

/**
 * 煽りコメントをセーブ
 * ゲーム終了後に勝ったら他のユーザーに見せる
 *
 */
export async function setUserComment(comment: string) {
	const idp = await getAuthenticatedUserOrNull();

	if (!idp) {
		throw new Error("認証されていません");
	}

	const user = idp.user;

	await prisma.user.update({
		where: {
			id: user.id,
		},
		data: {
			comment: comment,
		},
	});

	// ホームページを再検証
	revalidatePath("/home");
}
