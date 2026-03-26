import Link from "next/link";
// import { HomeHeaderTitle } from "@/components/home/homeHeaderTitle";

interface LegalPageLayoutProps {
	title: string;
	children: React.ReactNode;
}

export function LegalPageLayout({ title, children }: LegalPageLayoutProps) {
	return (
		<div className="min-h-screen flex flex-col items-center p-8 bg-transparent">
			{/* <HomeHeaderTitle /> */}
			<div className="glass-card max-w-2xl w-full p-8 rounded-2xl mt-6 text-foreground">
				<h1 className="text-2xl font-bold mb-6 text-brand-900">{title}</h1>
				<div className="max-w-none text-sm leading-relaxed space-y-4 text-brand-800">
					{children}
				</div>
				<Link
					href="/login"
					className="mt-8 inline-block text-brand-400 hover:underline hover:text-brand-300 transition-colors"
				>
					ログインに戻る
				</Link>
			</div>
		</div>
	);
}
