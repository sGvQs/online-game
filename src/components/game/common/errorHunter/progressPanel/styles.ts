import { tv } from "tailwind-variants";

export const progressPanel = tv({
	slots: {
		inner: "min-w-[380px]",
		remainingText: "text-black mb-2 text-xs",
		scoresSection: "mt-3",
		scoresLabel: "text-[11px] font-bold mb-1 text-black",
		scoreRow: "text-[11px] text-black mb-0.5",
		winnerBadge: "text-blue-600 font-bold ml-1",
	},
});
