import { tv } from "tailwind-variants";

/**
 * MemberItem コンポーネントのスタイル定義
 * slots機能を使用して構成要素ごとにスタイルを整理
 */
export const memberItem = tv({
	slots: {
		wrapper: [
			"flex items-center gap-2 p-1 rounded-xl",
			"hover:bg-white/10 transition-colors",
			"border border-transparent hover:border-brand-500",
		],
		avatar: [
			"w-8 h-8 rounded-full flex items-center justify-center",
			"text-sm font-bold text-brand-700 shadow-inner",
		],
		info: "flex-1 min-w-0",
		name: "text-xs font-semibold text-brand-900 truncate",
		status: "text-[10px] text-brand-900 font-medium",
		indicator: [
			"w-2 h-2 rounded-full bg-green-400 m-3",
			"shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse",
		],
	},
});
