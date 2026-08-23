import { tv } from "tailwind-variants";

export const lpPage = tv({
	slots: {
		main: "min-h-screen relative overflow-hidden",
		contentWrapper: "relative z-10 flex flex-col items-center",
		ctaSection: "py-24 px-8 w-full max-w-2xl",
		ctaInner: "relative text-center",
		ctaAurora: "absolute -inset-12 opacity-20 pointer-events-none",
		ctaReadyLabel: "text-brand-600 text-[10px] tracking-[0.4em] uppercase mb-6",
		ctaHeading: "text-5xl md:text-6xl leading-snug mb-2",
		ctaHeadingSpan:
			"bg-[linear-gradient(135deg,#e0e7ff,#a5b4fc,#c084fc)] bg-clip-text text-transparent",
		ctaButton: [
			"group inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full",
			"text-sm font-semibold tracking-wider text-white font-dot-gothic-16",
			"transition-all duration-300 hover:scale-105",
			"bg-[linear-gradient(135deg,rgba(99,102,241,0.15),rgba(168,85,247,0.15))]",
			"border border-brand-500/40",
			"shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
			"hover:shadow-[0_0_24px_rgba(129,140,248,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]",
			"hover:border-brand-500/70",
		],
		ctaPulse: "w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse",
		ctaArrow:
			"w-3.5 h-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all",
		ctaFreeLabel: "mt-6 text-[10px] text-brand-600",
		ctaLegal: "mt-3 text-[11px] text-brand-700/60",
		ctaLegalLink: "hover:text-brand-500 transition-colors",
		footer: "pb-12 text-center space-y-2",
		footerTitle: "text-brand-500 font-bold tracking-widest",
		footerSub: "text-xs text-brand-700 opacity-60",
	},
});
