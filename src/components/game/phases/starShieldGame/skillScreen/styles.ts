import { tv } from "tailwind-variants";

export const skillScreenStyles = tv({
	slots: {
		root: "flex flex-col gap-6 pb-8",
		loadoutSection:
			"rounded-2xl p-5 bg-white/2 border border-white/8 flex flex-col gap-3",
		loadoutTitle:
			"text-[11px] font-bold tracking-[0.2em] text-white/30 font-dot-gothic-16",
		loadoutRow: "flex items-center gap-3",
		typingCount: "text-2xl font-bold font-cherry-bomb-one text-white",
		tabSwitcher: "flex rounded-2xl overflow-hidden border border-white/8 mb-4",
		tabDivider: "w-px bg-white/8",
		tabContent: "flex flex-col gap-4",
	},
});

export const tabButtonStyles = tv({
	base: "flex-1 py-4 flex flex-col items-center justify-center gap-1 transition-all duration-300",
	variants: {
		tab: {
			attack: "",
			defence: "",
		},
		active: {
			true: "",
			false: "bg-white/2 text-white/35 hover:text-white/55 hover:bg-white/4",
		},
	},
	compoundVariants: [
		{
			tab: "attack",
			active: true,
			class:
				"bg-indigo-700/70 text-indigo-100 shadow-[inset_0_0_30px_rgba(99,102,241,0.2)]",
		},
		{
			tab: "defence",
			active: true,
			class:
				"bg-emerald-800/70 text-emerald-100 shadow-[inset_0_0_30px_rgba(16,185,129,0.2)]",
		},
	],
});
