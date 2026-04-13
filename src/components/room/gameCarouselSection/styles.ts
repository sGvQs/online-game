import { tv } from "tailwind-variants";

export const gameCarouselSection = tv({
	slots: {
		wrapper: "flex flex-col items-center gap-4 w-full",
		stage:
			"relative flex items-center justify-center w-full h-56 [perspective:1200px]",
		cardBase: [
			"absolute w-64 h-44 rounded-2xl border-2 p-5 flex flex-col gap-3 items-center",
			"transition-all duration-500 ease-in-out cursor-pointer select-none",
			"[transform-style:preserve-3d]",
		],
		cardCenter:
			"scale-100 opacity-100 z-20 [transform:rotateY(0deg)_translateX(0)] hover:scale-110",
		cardLeft:
			"scale-75 opacity-50 z-10 [transform:rotateY(20deg)_translateX(-80%)]",
		cardRight:
			"scale-75 opacity-50 z-10 [transform:rotateY(-20deg)_translateX(80%)]",
		cardHidden:
			"scale-50 opacity-0 z-0 pointer-events-none [transform:translateX(0)] invisible",
		navButton:
			"p-2 rounded-full glass-card text-brand-600 hover:text-brand-900 transition-colors",
		gameIcon: "w-10 h-10 relative",
		gameDesc: "text-xs opacity-70 tracking-wider",
		cardInfo: "flex items-center gap-2 text-[10px] opacity-80 mt-auto",
		actionRow: "flex items-center gap-3",
		errorHunterCard: "border-teal-600 bg-teal-700/80 text-white",
		nullHandCard: [
			"border-[#FF4444] bg-black/80 text-[#FF4444]",
			"shadow-[0_0_20px_rgba(255,68,68,0.3)]",
		],
		starShieldCard: [
			"border-brand-500/60 bg-brand-50/80 text-brand-500",
			"shadow-[0_0_20px_rgba(129,140,248,0.3)]",
		],
		errorModalContent: "flex flex-col gap-4 p-2",
		errorModalText: "text-brand-700",
		errorModalSub: "text-brand-600",
		errorModalActions: "flex justify-end",
		modeTagCooperative:
			"px-2 py-0.5 rounded-full text-xs font-bold bg-teal-900/80 text-teal-300 border border-teal-300",
		modeTagCompetitive:
			"px-2 py-0.5 rounded-full text-xs font-bold bg-red-900/40 text-red-500 border border-red-500",
		kvContainer:
			"relative w-full max-w-md aspect-video rounded-xl overflow-hidden bg-white/5 border border-white/10",
		kvTabsOverlay: "absolute top-2 left-2 flex gap-1 z-10",
		kvTab: "px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wider transition-colors border cursor-pointer",
		kvTabActive: "bg-white/20 border-white/40 text-white",
		kvTabInactive: "bg-black/30 border-white/10 text-white/40 hover:text-white/70",
		ruleDesc: "text-xs text-center text-brand-600 max-w-xs leading-relaxed px-2",
	},
});
