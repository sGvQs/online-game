/**
 * room と game の共通レイアウト。
 * StarfieldBackground は ThemeProvider（root layout）で全ページ共通に描画されている。
 */
export default function PlayLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <div className="relative min-h-screen">{children}</div>;
}
