import { tv } from "tailwind-variants";

export const titlePhase = tv({
	slots: {
		container: [
			"relative min-h-screen w-full",
			"flex flex-col items-center justify-center",
			"gap-8 p-8",
		],
		title: [
			"text-6xl font-cherry-bomb-one tracking-[0.1em] uppercase",
			"text-transparent bg-clip-text",
			"bg-linear-to-b from-white via-brand-500 to-brand-400",
			"drop-shadow-[0_0_40px_rgba(129,140,248,0.5)]",
		],
		subtitle: [
			"text-xs text-brand-500/60 tracking-[0.4em] uppercase font-dot-gothic-16",
		],
		card: [
			"bg-[rgba(30,41,59,0.4)] border border-[rgba(129,140,248,0.18)]",
			"rounded-2xl p-6",
			"backdrop-blur-[12px]",
			"shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]",
			"w-full max-w-md",
		],
		sectionTitle: [
			"text-[10px] text-brand-500/60 mb-3 uppercase tracking-[0.4em]",
		],
		difficultyGrid: ["grid grid-cols-3 gap-3"],
		difficultyBtn: [
			"py-3 px-4 rounded-xl",
			"border text-sm font-dot-gothic-16",
			"transition-all duration-200",
			"cursor-pointer",
		],
		difficultyBtnActive: [
			"bg-brand-500/10 border-brand-500 text-brand-400",
			"shadow-[0_0_8px_rgba(129,140,248,0.4)]",
		],
		difficultyBtnInactive: [
			"bg-transparent border-white/10 text-white/40",
			"hover:border-white/30 hover:text-white/60",
		],
		playerList: ["space-y-2"],
		playerRow: [
			"flex items-center justify-between",
			"px-3 py-2 rounded-lg",
			"bg-[rgba(129,140,248,0.05)]",
		],
		playerName: ["text-sm text-white/80 tracking-wider"],
		readyBadge: ["text-xs px-2 py-0.5 rounded-full font-bold tracking-widest"],
		readyBadgeReady: ["text-brand-500"],
		readyBadgeWaiting: ["text-white/20"],
		actionRow: ["flex flex-col gap-3 mt-4"],
		readyBtn: [
			"w-full py-3 rounded-xl text-sm font-dot-gothic-16",
			"border transition-all duration-200",
			"cursor-pointer",
		],
		readyBtnActive: [
			"bg-brand-500/10 border-brand-500/40 text-brand-300",
			"hover:bg-brand-500/20 shadow-[0_0_8px_rgba(129,140,248,0.3)]",
		],
		readyBtnInactive: [
			"bg-white/5 border-white/10 text-white/50",
			"hover:bg-white/10 hover:border-white/20",
		],
		startBtn: [
			"w-full py-3 rounded-xl text-sm font-dot-gothic-16",
			"border transition-all duration-200",
		],
		startBtnEnabled: [
			"bg-brand-500/20 border-brand-500/50 text-brand-300",
			"hover:bg-brand-500/30 cursor-pointer",
			"shadow-[0_0_12px_rgba(129,140,248,0.4)]",
		],
		startBtnDisabled: [
			"bg-white/5 border-white/10 text-white/20",
			"cursor-not-allowed",
		],
		closeBtn: [
			"text-xs text-white/30 hover:text-white/60",
			"transition-colors cursor-pointer",
			"underline underline-offset-2",
		],
		controls: [
			"text-xs text-brand-500/50 font-dot-gothic-16",
			"space-y-1 text-center",
		],
	},
});
