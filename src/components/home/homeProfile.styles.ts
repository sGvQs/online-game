import { tv } from "tailwind-variants";

export const homeProfile = tv({
	slots: {
		profileCard: [
			"group flex items-center gap-2 mt-5 px-3 py-2 rounded-xl",
			"cursor-pointer transition-all duration-200",
			"hover:bg-white/10 hover:border-brand-500/50",
			"border border-transparent",
		],
		editHint: [
			"w-3 h-3 text-brand-400 ml-1",
			"opacity-0 group-hover:opacity-100 transition-opacity duration-200",
		],
		overlay: [
			"fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999]",
			"backdrop-blur-sm",
		],
		modal: [
			"w-[min(90vw,480px)] bg-slate-800/95 border border-brand-500/60",
			"rounded-2xl backdrop-blur-xl flex flex-col overflow-hidden",
			"shadow-[0_0_40px_rgba(129,140,248,0.2)]",
		],
		modalHeader: [
			"bg-linear-to-br from-brand-300 to-brand-400 px-6 py-4",
			"flex justify-between items-center",
		],
		modalTitle: "text-lg font-bold text-white",
		closeButton: [
			"text-white/80 hover:text-white transition-colors text-xl leading-none",
		],
		modalBody: "flex flex-col gap-5 p-6",
		sectionLabel: "text-xs font-semibold text-brand-300 mb-2",
		iconGrid: "grid grid-cols-7 gap-2",
		iconOption: [
			"relative w-10 h-10 rounded-full border-2 border-transparent",
			"cursor-pointer transition-all duration-150 overflow-hidden",
			"hover:border-brand-400 hover:scale-110",
		],
		iconOptionSelected: "border-brand-500 ring-2 ring-brand-400 scale-110",
		inputWrapper: "flex flex-col gap-1",
		nameCounter: "text-[10px] text-brand-400 text-right",
		commentArea: [
			"w-full rounded-lg border border-brand-300 bg-white/5 px-3 py-2 text-sm",
			"text-white placeholder:text-brand-400 resize-none",
			"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
		],
		actions: "flex gap-2 justify-end pt-2",
		errorText: "text-xs text-red-400 mt-1",
	},
});
