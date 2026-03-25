import { tv } from "tailwind-variants";

export const rankingList = tv({
	slots: {
		wrapper: "glass-card w-full p-6 rounded-2xl",
		list: "divide-y divide-white/10",
		item: [
			"flex items-center justify-between py-4 px-4 rounded-lg",
			"transition-colors hover:bg-white/5",
		],
		itemHighlight: [
			"flex items-center justify-between py-4 px-4 rounded-lg",
			"bg-brand-500/20 border border-brand-500/30",
		],
		rank: "text-brand-300 w-12 shrink-0",
		name: "truncate flex-1 mx-4 text-white",
		points: "text-brand-400 shrink-0",
		empty: "text-brand-300 text-center py-8",
	},
});
