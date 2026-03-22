import { tv } from "tailwind-variants";

export const dashboardSidebar = tv({
	slots: {
		wrapper: "glass-card p-6 rounded-2xl",
		heading: "text-xl font-bold mb-4 text-brand-900 flex items-center gap-2",
		formWrapper: "animate-in fade-in slide-in-from-top-2 duration-300",
		formInner: "flex flex-col gap-3",
		formActions: "flex gap-2 mt-1",
	},
});
