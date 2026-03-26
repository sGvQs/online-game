import { tv } from "tailwind-variants";

/**
 * RoomCard コンポーネントのスタイル定義
 * slots機能を使用して構成要素ごとにスタイルを整理
 */
export const roomCard = tv({
	slots: {
		wrapper: [
			"glass-card rounded-xl p-5 flex flex-col justify-between group h-full relative overflow-hidden",
			"border-t-2 border-t-brand-500/50 hover:border-t-brand-400",
			"transition-all duration-300",
		],
		glowOverlay: [
			"absolute inset-0 bg-brand-500/5 opacity-0",
			"group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
		],
		main: "flex-1 min-w-0 flex flex-col gap-2 mb-4",
		title: [
			"text-lg font-bold text-brand-900 dark:text-brand-800",
			"transition-colors group-hover:text-glow",
		],
		meta: "flex items-center gap-2 text-sm text-brand-600 dark:text-brand-400",
		info: "flex flex-col gap-0.5",
		creatorName: "text-xs text-brand-500 font-mono",
		roomId: "text-[10px] text-brand-700 font-mono",
		statusBadge: ["px-2 py-1 rounded-md text-xs font-medium"],
		statusLobby:
			"bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
		statusPlaying:
			"bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
		actions: [
			"flex justify-between items-center pt-4 border-t border-brand-100/50 dark:border-brand-700/20",
		],
		joinButton: [
			"!bg-brand-400 hover:!bg-brand-500 text-white",
			"shadow-md hover:shadow-brand-500/25 transition-all duration-200",
			"rounded-full px-4 h-8 text-xs font-semibold tracking-wide uppercase gap-1.5",
		],
		joinButtonDisabled: "opacity-50 cursor-not-allowed",
	},
});

export const emptyState = tv({
	slots: {
		wrapper: [
			"col-span-full py-24 rounded-2xl backdrop-blur-sm",
			"border border-dashed border-brand-200 dark:border-brand-800/30",
			"flex flex-col items-center",
			"bg-brand-100/50 dark:bg-brand-50/30",
		],
		icon: "mb-6 opacity-90 w-full flex justify-center [&_img]:mx-auto",
		title: "text-xl font-bold mb-2 w-full text-center",
		description: "max-w-md w-full text-center",
	},
});
