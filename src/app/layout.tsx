import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import BGMPlayer from "@/components/ui/bgmPlayer";
import { SoundProvider } from "@/lib/sound-context";
import { LoadingProvider } from "@/lib/loading-context";
import { LoadingOverlay } from "@/components/ui/loadingOverlay";
import { OldPCFloating } from "@/components/decorations/oldPCFloating";

export const metadata: Metadata = {
	title: "Pukapuka Space | ぷかぷか宇宙",
	description:
		"さあ、人生の大事な時間を、無駄にする準備はできた？ —— 名もなき恐竜より",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<body className="antialiased" suppressHydrationWarning>
				<SoundProvider>
					<LoadingProvider>
						<ThemeProvider>
							<OldPCFloating />
							{children}
							<BGMPlayer />
							<LoadingOverlay />
						</ThemeProvider>
					</LoadingProvider>
				</SoundProvider>
			</body>
		</html>
	);
}
