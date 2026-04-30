import { tv } from "tailwind-variants";

export const resultPhase = tv({
	slots: {
		container: [
			"relative min-h-screen w-full overflow-hidden",
			"flex flex-col items-center justify-center gap-6 px-8 py-12",
		],
		inner: "relative z-10 w-full max-w-sm flex flex-col gap-5",
		// セクションタイトル
		sectionTitle: "text-xs text-white/40 font-dot-gothic-16 tracking-widest uppercase",
		// プレイヤースコア
		playersSection: "flex flex-col gap-4",
		playerRow: "flex items-center justify-between",
		playerInfo: "flex items-center gap-2",
		playerFaceWrap: "relative w-8 h-8 shrink-0",
		playerName: "text-sm font-dot-gothic-16 text-white/60 whitespace-nowrap",
		playerScoreInner: "flex items-baseline gap-1.5",
		playerSep: "text-white/40 text-base",
		playerCount: "text-2xl font-cherry-bomb-one text-white tabular-nums",
		playerUnit: "text-xs text-white/40",
		// 区切り線
		divider: "w-full h-px bg-white/10",
		// 合計
		totalRow: "flex items-center justify-between",
		totalLabel: "text-sm text-white/50 font-dot-gothic-16",
		totalInner: "flex items-baseline gap-1.5",
		totalCount: "text-3xl font-cherry-bomb-one text-white tabular-nums",
		totalUnit: "text-sm text-white/40",
		// プログレスバー
		progressSection: "flex flex-col gap-2",
		progressHeader: "flex justify-between items-baseline",
		progressLabel: "text-sm text-white/50 font-dot-gothic-16",
		progressRateWrap: "flex items-baseline gap-1",
		progressRate: "text-3xl font-cherry-bomb-one text-brand-400 tabular-nums",
		progressRateSuffix: "text-lg text-brand-400/60",
		progressTrack: "relative w-full h-2.5 rounded-full bg-white/10 overflow-visible",
		progressTrackInner: "w-full h-full rounded-full overflow-hidden",
		progressBar: "h-full rounded-full",
		progressClearLine: [
			"absolute top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full",
			"bg-white/40",
		],
		progressFooter: "flex justify-between text-[10px] text-white/30 font-dot-gothic-16",
		// バッジ
		badgeWrap: "flex flex-col items-center gap-1 py-2",
		badge: [
			"text-5xl font-cherry-bomb-one tracking-[0.1em]",
			"[text-shadow:0_0_30px_currentColor]",
		],
		badgeCleared: "text-brand-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]",
		badgeFailed: "text-red-400",
		badgeSub: "text-xs text-white/30 font-dot-gothic-16 tracking-widest",
		// ボタンエリア
		buttonArea: "flex flex-col items-center gap-2",
		waitText: "text-xs text-brand-500/40 font-dot-gothic-16 tracking-wider text-center",
		returnBtn: [
			"px-8 py-3 rounded-xl",
			"bg-brand-500/10 border border-brand-500/40",
			"text-brand-300 text-sm font-dot-gothic-16",
			"hover:bg-brand-500/20 transition-colors cursor-pointer",
			"shadow-[0_0_12px_rgba(129,140,248,0.3)]",
		],
	},
});
