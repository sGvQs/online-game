"use server";

import { prisma } from "@/server/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "../_helpers/getAuthenticatedUser";

/**
 * ルームに参加
 */
export async function joinRoom(roomId: string) {
	const user = await getAuthenticatedUser();

	const room = await prisma.room.findUnique({ where: { id: roomId } });
	if (!room) {
		revalidatePath("/dashboard");
		redirect("/dashboard");
	}
	if (room.status === "PLAYING") {
		revalidatePath("/dashboard");
		redirect("/dashboard?error=game_in_progress");
	}

	const existingMembership = await prisma.roomUser.findFirst({
		where: {
			roomId,
			userId: user.id,
		},
	});

	if (!existingMembership) {
		await prisma.roomUser.create({
			data: {
				roomId,
				userId: user.id,
			},
		});
	}

	revalidatePath("/dashboard");
	redirect(`/room/${roomId}`);
}

/**
 * ルームから退出。
 * 作成者が退出した場合はルームを削除し、他メンバー全員に通知を作成する。
 * 他メンバーはリアルタイム購読でルーム削除を検知してダッシュボードへ遷移する。
 */
export async function leaveRoom(roomId: string) {
	const user = await getAuthenticatedUser();

	const room = await prisma.room.findUnique({
		where: { id: roomId },
		include: { users: true },
	});

	if (!room) {
		redirect("/dashboard");
	}

	if (room.createdBy === user.id) {
		// 作成者退出 → 他メンバーへ通知を作成しルームを削除
		const otherMemberIds = room.users
			.filter((u) => u.userId !== user.id)
			.map((u) => u.userId);

		await prisma.$transaction([
			prisma.roomDeletedNotification.createMany({
				data: otherMemberIds.map((userId) => ({ userId })),
			}),
			// RoomUser は onDelete: Cascade で連動削除される
			prisma.room.delete({ where: { id: roomId } }),
		]);
	} else {
		// 一般メンバー退出 → 自分の RoomUser レコードのみ削除
		await prisma.roomUser.deleteMany({
			where: { roomId, userId: user.id },
		});
	}

	revalidatePath("/dashboard");
	redirect("/dashboard");
}

/**
 * ホストがゲストをルームから追放
 */
export async function kickUserFromRoom(roomId: string, targetUserId: string) {
	const user = await getAuthenticatedUser();
	const room = await prisma.room.findUnique({ where: { id: roomId } });
	if (!room) throw new Error("Room not found");
	if (room.createdBy !== user.id) throw new Error("Only host can kick");
	if (room.createdBy === targetUserId) throw new Error("Cannot kick host");
	if (room.status === "PLAYING") throw new Error("Cannot kick during game");

	await prisma.roomUser.deleteMany({
		where: { roomId, userId: targetUserId },
	});

	revalidatePath(`/room/${roomId}`);
}
