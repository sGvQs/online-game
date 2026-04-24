import { tv } from "tailwind-variants";

export const titlePhase = tv({
	slots: {
		titleWrapper: "leading-[0.8] select-none flex flex-col",
		titleLine1: "block font-honk text-[5.5rem]",
		titleLine2: "block font-honk text-[5.5rem]",
		subtitle: "flex gap-2 text-sm mt-6 text-brand-500 font-bold w-full justify-center",
		// 難易度カード
		difficultyCard:
			"rounded-2xl p-5 flex flex-col gap-3 transition-opacity bg-white/3 border border-white/8",
		difficultyCardTitle:
			"text-[11px] font-cherry-bomb-one text-[rgba(129,140,248,0.6)]",
		difficultyButton: [
			"flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 cursor-pointer",
			"hover:scale-[1.02] hover:brightness-110",
			"font-cherry-bomb-one",
			"[background:var(--diff-bg)] [border:var(--diff-border)] [box-shadow:var(--diff-glow)] [color:var(--diff-color)]",
		],
		rateLabel:
			"text-[10px] shrink-0 tabular-nums font-dot-gothic-16 [color:var(--diff-rate-color)]",
		successHint:
			"text-[10px] leading-relaxed mt-1 font-cherry-bomb-one [color:var(--diff-hint-color)] opacity-70",
		hostWaiting: "text-[10px] mt-1 font-cherry-bomb-one text-white/15",
		// プレイヤーカード
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
	},
});
