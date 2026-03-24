import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/actions";
import { getRoomsWithCreator } from "@/server/actions/room";
import { RoomSearchList } from "@/components/room/roomSearchList";
import { Typography } from "@/components/ui/typography";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";

export default async function RoomSearchPage() {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/");

	const rooms = await getRoomsWithCreator();

	return (
		<div className="flex flex-col items-center gap-6 p-8 min-h-screen">
			<PukapukaLogo />
			<Typography variant="h3">ルームをさがす</Typography>
			<div className="w-full max-w-2xl">
				<RoomSearchList initialRooms={rooms} userId={currentUser.user.id} />
			</div>
			<Link
				href="/dashboard"
				className="text-xs text-brand-600 hover:text-brand-400 transition-colors"
			>
				← ダッシュボードに戻る
			</Link>
		</div>
	);
}
