import { createClient } from "@/server/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDashboardUser, getTopRankings } from "@/server/actions";
import { Trophy, ArrowLeft } from "lucide-react";

export default async function RankingPage() {
	const supabase = await createClient();
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) redirect("/");

	const dashboardUser = await getDashboardUser();
	if (!dashboardUser) return <div>User not found in DB</div>;

	const rankings = await getTopRankings();

	return (
		<div className="min-h-screen p-8 bg-transparent text-foreground">
			<div className="max-w-4xl mx-auto space-y-8">
				<header className="glass-card flex justify-between items-center p-6 rounded-2xl shadow-sm">
					<h1 className="text-2xl font-bold text-brand-900 flex items-center gap-2">
						<Trophy className="w-6 h-6" />
						ランキング
					</h1>
					<Link
						href="/dashboard"
						className="flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-500 transition-colors"
					>
						<ArrowLeft className="w-4 h-4" />
						ダッシュボードに戻る
					</Link>
				</header>

				<section className="glass-card p-6 rounded-2xl">
					{rankings.length === 0 ? (
						<p className="text-brand-700 text-center py-8">
							まだランキングデータがありません
						</p>
					) : (
						<ul className="divide-y divide-brand-200/30">
							{rankings.map((r) => (
								<li
									key={r.userId}
									className={`flex items-center justify-between py-4 px-4 rounded-lg text-sm transition-colors ${
										dashboardUser.user.id === r.userId
											? "bg-brand-300/20 border border-brand-200/30"
											: "hover:bg-white/5"
									}`}
								>
									<span className="font-bold text-brand-700 w-12 shrink-0">
										{r.rank}位
									</span>
									<span className="truncate flex-1 mx-4">{r.name}</span>
									<span className="text-brand-600 font-medium shrink-0">
										{r.points}pt
									</span>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
		</div>
	);
}
