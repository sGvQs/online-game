import { tv } from "tailwind-variants";

export const lpHero = tv({
	slots: {
		section:
			"relative z-10 flex flex-col items-center justify-center pt-28 pb-20 px-8 text-center w-full max-w-5xl",
		specBadgesRow: "flex gap-3 mb-10 flex-wrap justify-center",
		specBadge:
			"flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 hover:scale-105 bg-brand-500/6 border border-brand-500/20",
		specBadgeTitle: "text-[11px] font-bold text-brand-400 tracking-wide",
		specBadgeSub: "text-[9px] text-brand-600 mt-0.5",
		catchCopy:
			"mt-8 text-brand-700 text-base md:text-lg max-w-md leading-relaxed",
		ctaPulse: "w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse",
		ctaArrow:
			"w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all",
		scrollIndicator:
			"mt-16 flex flex-col items-center gap-2 opacity-60 animate-bounce",
		scrollLabel: "text-[10px] tracking-[0.3em] text-brand-600",
		scrollBar: "w-px h-8 bg-linear-to-b from-brand-500/80 to-transparent",
	},
});
