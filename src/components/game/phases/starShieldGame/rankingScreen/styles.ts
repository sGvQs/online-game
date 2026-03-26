import { tv } from "tailwind-variants";

export const rankingScreen = tv({
	slots: {
		container:
			"relative flex flex-col items-center min-h-screen py-12 px-8 gap-8",
		list: "flex flex-col gap-2",
		rankRow: [
			"flex items-center gap-3 rounded-2xl px-4 py-3",
			"bg-white/3 border border-white/6",
		],
		myRankRow: [
			"flex items-center gap-3 rounded-2xl px-4 py-3",
			"bg-[rgba(129,140,248,0.1)] border border-[rgba(129,140,248,0.35)]",
			"[box-shadow:0_0_16px_rgba(129,140,248,0.15)]",
		],
		rankNum:
			"text-sm font-bold tabular-nums text-white/40 w-8 shrink-0 text-center",
		medalBadge: "text-lg w-8 shrink-0 text-center",
		pairName: "flex-1 text-sm text-white/80 truncate",
		myPairName: "flex-1 text-sm text-white font-bold truncate",
		destroyedCount: "text-sm font-bold tabular-nums text-white/90 shrink-0",
		emptyState: "text-center text-white/30 text-sm py-12",
		myBadge:
			"text-[10px] px-1.5 py-0.5 rounded bg-[rgba(129,140,248,0.3)] text-indigo-300 shrink-0",
	},
});
