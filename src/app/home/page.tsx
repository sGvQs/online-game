import { createClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import {
	getHomeUser,
	cleanupAbandonedRooms,
	getMonthlyRanking,
} from "@/server/actions";
import { DEFAULT_FACE_ICON, FaceIcon } from "@/constants/common/faceIcon";
import { Typography } from "@/components/ui/typography";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { HomeActions } from "@/components/home/homeActions";
import { HomeProfile } from "@/components/home/homeProfile";

export default async function HomePage({
	searchParams,
}: {
	searchParams: Promise<{ error?: string }>;
}) {
	await searchParams;
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/");

	// 放置ルームのクリーンアップ（訪問者なら誰でも実行）
	await cleanupAbandonedRooms();

	// Server Action経由でDB取得
	const homeUser = await getHomeUser();
	if (!homeUser) return <div>User not found in DB</div>;

	const monthlyRanking = await getMonthlyRanking(homeUser.user.id);

	const initialFaceIcon: FaceIcon =
		(homeUser.user as { faceIcon?: FaceIcon }).faceIcon ??
		DEFAULT_FACE_ICON;

	return (
		<div className="flex justify-center items-center flex-col h-screen w-full">
			<PukapukaLogo size="large" />
			<Typography variant="label" className="font-bold bg-[linear-gradient(135deg,#fef3c7_0%,#fb923c_60%,#e879f9_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]" font="cherry-bomb-one">
				Music by Dream or real?
			</Typography>
			<HomeProfile
				initialName={homeUser.user.name}
				initialFaceIcon={initialFaceIcon}
				initialComment={homeUser.user.comment ?? ""}
				rank={monthlyRanking?.rank}
				totalPoints={monthlyRanking?.totalPoints}
			/>
			<HomeActions />
		</div>
	);
}
