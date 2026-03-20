import { tv } from "tailwind-variants";

export const memberList = tv({
	slots: {
		wrapper: "glass-card p-6 rounded-2xl h-full",
		header: "flex items-center justify-between mb-6",
		title: "font-bold text-lg text-brand-900 flex items-center gap-2",
		count:
			"bg-brand-300 text-brand-700 text-xs font-bold px-3 py-1 rounded-full",
		list: "space-y-3",
	},
});
