import { createClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getHomeUser, getTopRankings } from "@/server/actions";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { Typography } from "@/components/ui/typography";
import { button } from "@/components/ui/button/styles";
import { RankingList } from "@/components/ranking/rankingList";

export default async function RankingPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/");

	const homeUser = await getHomeUser();
	if (!homeUser) return <div>User not found in DB</div>;

	const rankings = await getTopRankings();

	return (
		<div className="flex flex-col items-center min-h-screen py-12 px-8 gap-8">
			<PukapukaLogo />

			<Typography variant="h1" font="cherry-bomb-one" className="text-white">
				ランキング
			</Typography>

			<div className="w-full max-w-xl">
				<RankingList rankings={rankings} currentUserId={homeUser.user.id} />
			</div>

			<Link href="/home" className={button({ variant: "primary", size: "lg" })}>
				ホームにもどる
			</Link>
		</div>
	);
}
