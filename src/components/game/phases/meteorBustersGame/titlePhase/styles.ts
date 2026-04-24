import { tv } from "tailwind-variants";

export const titlePhase = tv({
	slots: {
		title: [
			"text-6xl font-cherry-bomb-one tracking-[0.1em] uppercase",
			"text-transparent bg-clip-text",
			"bg-linear-to-b from-white via-brand-500 to-brand-400",
			"drop-shadow-[0_0_40px_rgba(129,140,248,0.5)]",
		],
		subtitle: "flex gap-2 text-sm mt-6 text-brand-500 font-bold w-full justify-center",
		sectionLabel: "text-[10px] tracking-[0.4em] uppercase text-[rgba(129,140,248,0.6)]",
		difficultyCard: [
			"rounded-2xl p-5 bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)]",
		],
		difficultyBtn: [
			"py-3 px-4 rounded-xl",
			"text-sm font-dot-gothic-16",
			"transition-all duration-200",
			"cursor-pointer w-full",
		],
		controls: [
			"text-xs text-brand-500/40 font-dot-gothic-16 text-center leading-relaxed",
		],
		playerCard:
			"rounded-2xl p-5 bg-[rgba(129,140,248,0.05)] border border-[rgba(129,140,248,0.18)]",
		playerCardTitle:
			"text-[10px] tracking-[0.4em] uppercase mb-4 text-[rgba(129,140,248,0.6)]",
		statusDot:
			"w-2 h-2 rounded-full shrink-0 transition-colors duration-300 [background-color:var(--status-dot-color)]",
		playerName: "text-base flex-1 truncate [color:var(--player-name-color)]",
		playerNameSuffix: "text-xs text-brand-500/50 ml-1",
		readyBadge:
			"text-xs px-2 py-0.5 rounded-full text-indigo-400 bg-[rgba(129,140,248,0.15)] border border-[rgba(129,140,248,0.4)]",
		waitingBadge: "text-xs px-2 py-0.5 rounded-full text-white/20 border border-white/10",
		progressTrack: "mt-4 h-1 rounded-full overflow-hidden bg-white/6",
		progressBar:
			"h-full rounded-full transition-all duration-500 [width:var(--progress-pct)] bg-linear-to-r from-indigo-400 to-purple-400 [box-shadow:0_0_8px_rgba(129,140,248,0.6)]",
		howToCard:
			"rounded-2xl p-5 bg-[rgba(192,132,252,0.05)] border border-[rgba(192,132,252,0.18)]",
		howToTitle:
			"text-[10px] tracking-[0.4em] uppercase mb-4 text-[rgba(192,132,252,0.6)]",
		howToText: "text-xs leading-5 text-[rgba(203,213,225,0.7)]",
	},
});
