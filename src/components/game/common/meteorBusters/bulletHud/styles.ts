import { tv } from "tailwind-variants";

export const bulletHud = tv({
	slots: {
		container: [
			"flex flex-col items-center gap-2",
			"bg-[rgba(30,41,59,0.4)] border border-[rgba(129,140,248,0.18)]",
			"rounded-xl px-4 py-3",
			"backdrop-blur-[12px]",
		],
		typeLabel: ["text-[10px] font-dot-gothic-16 text-brand-500/60 uppercase tracking-[0.3em]"],
		typeBadge: [
			"w-8 h-8 rounded-full",
			"flex items-center justify-center",
			"text-sm font-bold text-white",
			"border-2",
		],
		ammoRow: ["flex gap-1 flex-wrap justify-center", "max-w-[120px]"],
		ammoDot: ["w-2 h-2 rounded-full transition-all duration-150"],
		ammoDotFull: ["opacity-100"],
		ammoDotEmpty: ["opacity-15"],
	},
});
