import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/server/actions";
import { getRoomsWithCreator } from "@/server/actions/room";
import { RoomSearchList } from "@/components/room/roomSearchList";
import { Typography } from "@/components/ui/typography";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { button } from "@/components/ui/button/styles";

export default async function RoomSearchPage() {
	const currentUser = await getCurrentUser();
	if (!currentUser) redirect("/");

	const rooms = await getRoomsWithCreator();

	return (
		<div className="flex flex-col items-center gap-10 p-8 min-h-screen">
			<PukapukaLogo />
			<Typography variant="h2">ルームをさがす</Typography>
			<div className="w-full max-w-2xl">
				<RoomSearchList initialRooms={rooms} userId={currentUser.user.id} />
			</div>
			<Link href="/home" className={button({ variant: "success", size: "lg" })}>
				<Typography variant="label" font="cherry-bomb-one" className="text-white">
				ホームにもどる
				</Typography>
			</Link>
		</div>
	);
}
