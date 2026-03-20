import { Suspense } from "react";
import Link from "next/link";
import AuthForm from "@/components/auth/authForm";
import { DashboardHeaderTitle } from "@/components/dashboard/dashboardHeaderTitle";
import { AnnoyingDinosaur } from "@/components/login/annoyingDinosaur";
import { Typography } from "@/components/ui/typography";

export default function LoginPage() {
	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
			{/* 戻るボタン（画面固定・左上） */}
			<Link
				href="/"
				className="fixed top-6 left-6 z-50 flex items-center gap-1.5 text-[11px] text-brand-700 hover:text-brand-500 transition-colors font-dot-gothic-16"
			>
				← トップへ
			</Link>

			<div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-7">
				{/* ロゴ */}
				<DashboardHeaderTitle />

				{/* フレーバーテキスト */}
				<Typography
					variant="caption"
					as="p"
					className="text-brand-700 tracking-widest text-center -mt-2"
				>
					✦ ぷかぷか宇宙へ、ようこそ ✦
				</Typography>

				{/* ログインフォーム */}
				<AuthForm />

				{/* Music credit */}
				<Typography
					variant="caption"
					as="p"
					font="rubik-puddles"
					className="font-black tracking-tight text-brand-900 flex items-center gap-1.5"
				>
					<span>Music</span>
					<span>by</span>
					<span>Dream</span>
					<span>or</span>
					<span>real?</span>
				</Typography>
			</div>

			<Suspense fallback={null}>
				<AnnoyingDinosaur />
			</Suspense>
		</div>
	);
}
