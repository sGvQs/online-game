import { tv } from "tailwind-variants";

export const resultPhase = tv({
	slots: {
		container: [
			"min-h-screen w-full",
			"flex flex-col items-center justify-center gap-8 p-8",
		],
		badge: [
			"text-5xl font-cherry-bomb-one tracking-[0.1em]",
			"[text-shadow:0_0_30px_currentColor]",
		],
		badgeCleared: ["text-brand-400 drop-shadow-[0_0_20px_rgba(129,140,248,0.8)]"],
		badgeFailed: ["text-red-400"],
		card: [
			"bg-[rgba(30,41,59,0.4)] border border-[rgba(129,140,248,0.18)]",
			"rounded-2xl p-8 min-w-[300px]",
			"backdrop-blur-[12px]",
			"shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
			"text-center space-y-4",
		],
		rateDisplay: [
			"text-6xl font-cherry-bomb-one text-white",
			"drop-shadow-[0_0_20px_rgba(129,140,248,0.4)]",
		],
		rateLabel: [
			"text-[10px] text-brand-500/60 uppercase tracking-[0.4em]",
		],
		statsRow: ["flex justify-between text-sm"],
		statsLabel: ["text-white/40"],
		statsValue: ["text-white"],
		returnBtn: [
			"mt-4 px-8 py-3 rounded-xl",
			"bg-brand-500/10 border border-brand-500/40",
			"text-brand-300 text-sm font-dot-gothic-16",
			"hover:bg-brand-500/20 transition-colors cursor-pointer",
			"shadow-[0_0_12px_rgba(129,140,248,0.3)]",
		],
	},
});
