import { tv } from "tailwind-variants";

export const resultScreen = tv({
	slots: {
		bgGlow:
			"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] pointer-events-none [background-color:var(--result-bg-glow)]",
		iconGlowCleared:
			"absolute inset-0 rounded-full blur-xl bg-[rgba(129,140,248,0.35)]",
		iconGlowFailed:
			"absolute inset-0 rounded-full blur-xl [background-color:var(--result-icon-glow)]",
		iconImageFailed:
			"object-contain relative z-10 [filter:drop-shadow(0_0_20px_var(--result-icon-color))]",
		title:
			"text-7xl font-black tracking-[0.12em] uppercase leading-none select-none font-cherry-bomb-one [color:var(--result-title-color)] [text-shadow:0_0_30px_var(--result-title-glow)]",
		subtitle: "text-xs tracking-[0.5em] uppercase mt-3 text-white/35",
		earnedBadge:
			"flex items-center gap-2.5 px-6 py-2.5 rounded-2xl [background:var(--earned-bg)] [border:var(--earned-border)] [box-shadow:var(--earned-glow)]",
		earnedValue:
			"text-2xl font-black tracking-wider font-cherry-bomb-one [color:var(--earned-text)]",
		earnedSuffix: "text-xs [color:var(--earned-text)] opacity-70",
		dinoMessage: [
			"rounded-2xl px-5 py-4 flex items-start gap-4",
			"bg-[rgba(30,41,59,0.55)] backdrop-blur-[12px]",
			"[border:var(--dino-message-border)]",
			"shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.3)]",
		],
		dinoMessageText: "text-sm leading-relaxed text-slate-300",
		statCard: [
			"flex flex-col items-center gap-2 rounded-2xl py-4 px-3",
			"bg-[rgba(30,41,59,0.5)] backdrop-blur-[8px]",
			"border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]",
		],
		statValue:
			"text-2xl font-black tabular-nums leading-none font-cherry-bomb-one [color:var(--stat-color)] [text-shadow:0_0_12px_var(--stat-glow)]",
		statLabel: "text-[9px] tracking-[0.35em] uppercase text-white/25",
	},
});
