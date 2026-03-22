import { tv } from "tailwind-variants";

export const rankingCard = tv({
	slots: {
		wrapper: "glass-card p-5 rounded-2xl shrink-0 w-full self-start",
		heading: "text-lg font-bold mb-4 text-brand-900 flex items-center gap-2",
		list: "space-y-1.5 mb-4 max-h-[280px] overflow-y-auto",
		listItem: "flex items-center gap-2 py-2 px-3 rounded-lg text-sm",
		listItemActive: "bg-brand-300/30",
		rank: "font-bold text-brand-700 w-7 shrink-0 text-sm",
		name: "truncate flex-1 min-w-0 font-medium",
		points: "text-brand-600 shrink-0 text-sm font-semibold",
		moreLink:
			"flex items-center justify-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-500 py-2",
	},
});
