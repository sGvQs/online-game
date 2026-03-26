import Link from "next/link";
import { PukapukaLogo } from "@/components/common/logo/pukapukaLogo";
import { Typography } from "@/components/ui/typography";
import { button } from "@/components/ui/button/styles";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen py-12 px-8 gap-8">
			<PukapukaLogo />

			<Typography variant="display" font="cherry-bomb-one" className="text-white">
				404
			</Typography>

			<Typography variant="body" className="text-white/50">
				ページが見つかりません
			</Typography>

			<Link href="/home" className={button({ variant: "success", size: "lg" })}>
				<Typography variant="label" font="cherry-bomb-one" className="text-white">
					ホームにもどる
				</Typography>
			</Link>
		</div>
	);
}
