import { createClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import {
	getDashboardUser,
	getRooms,
	cleanupAbandonedRooms,
	getUnreadRoomDeletedNotifications,
	getMonthlyRanking,
	getTopRankings,
} from "@/server/actions";
import { RoomList } from "@/components/room/roomList";
import { DashboardSidebar } from "@/components/dashboard/dashboardSidebar";
import { LogoutButton } from "@/components/auth/logoutButton";
import { SetLoginFlag } from "@/components/auth/setLoginFlag";
import { Boxes } from "lucide-react";
import { DEFAULT_FACE_ICON, FaceIcon } from "@/constants/common/faceIcon";
import { DashboardHeaderTitle } from "@/components/dashboard/dashboardHeaderTitle";
import { DashboardHeaderProfile } from "@/components/dashboard/dashboardHeaderProfile";
import { DashboardComplaintWrapper } from "@/components/dashboard/dashboardComplaintWrapper";
import { RankingCard } from "@/components/dashboard/rankingCard";
import { Typography } from "@/components/ui/typography";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";

export default async function DashboardPage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	const params = await searchParams;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/");

	// 放置ルームのクリーンアップ（ダッシュボード訪問者なら誰でも実行）
	await cleanupAbandonedRooms();

	// Server Action経由でDB取得
	const dashboardUser = await getDashboardUser();
	if (!dashboardUser) return <div>User not found in DB</div>;

	const [rooms, roomDeletedNotifications, monthlyRanking, topRankings] =
		await Promise.all([
			getRooms(),
			getUnreadRoomDeletedNotifications(),
			getMonthlyRanking(dashboardUser.user.id),
			getTopRankings(5),
		]);
	const initialFaceIcon: FaceIcon =
		(dashboardUser.user as { faceIcon?: FaceIcon }).faceIcon ??
		DEFAULT_FACE_ICON;

	return (
		<div className="flex justify-center items-center h-screen w-full">
			<PukapukaLogo />
		</div>
	);
}
