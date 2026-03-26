import { tv } from "tailwind-variants";

export const roomSearchList = tv({
	slots: {
		wrapper: "flex flex-col gap-4 w-full",
		searchInput:
			"w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-brand-600 outline-none focus:border-brand-500/50 transition-colors",
		grid: "grid gap-6 grid-cols-1 md:grid-cols-2",
		emptyState: "col-span-full text-center text-brand-600 py-12",
	},
});
