import { createClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import {
	getHomeUser,
	cleanupAbandonedRooms,
	getMonthlyRanking,
} from "@/server/actions";
import { DEFAULT_FACE_ICON, FaceIcon } from "@/constants/common/faceIcon";
import { Typography } from "@/components/ui/typography";
import { LogoWithOrbit } from "@/components/home/logoWithOrbit";
import { HomeActions } from "@/components/home/homeActions";
import { HomeProfile } from "@/components/home/homeProfile";
import { HomeCursor } from "@/components/home/homeCursor";
import { HomeOrbitHudProvider } from "@/lib/home-orbit-hud-context";
import { HomeOrbitHud } from "@/components/home/homeOrbitHud";

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
		<HomeCursor>
			<HomeOrbitHudProvider>
				<div className="flex min-h-screen w-full flex-col">
					<div className="flex flex-1 flex-col items-center justify-center px-4">
						<LogoWithOrbit>
							<Typography
								variant="label"
								className="font-bold bg-[linear-gradient(135deg,#fef3c7_0%,#fb923c_60%,#e879f9_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]"
								font="cherry-bomb-one"
							>
								Music by Dream or real?
							</Typography>
						</LogoWithOrbit>
						<HomeProfile
							initialName={homeUser.user.name}
							initialFaceIcon={initialFaceIcon}
							initialComment={homeUser.user.comment ?? ""}
							rank={monthlyRanking?.rank}
							totalPoints={monthlyRanking?.totalPoints}
						/>
						<HomeActions />
					</div>
					<div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] w-full pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
						<HomeOrbitHud />
					</div>
				</div>
			</HomeOrbitHudProvider>
		</HomeCursor>
	);
}
