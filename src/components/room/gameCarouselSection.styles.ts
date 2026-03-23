import { tv } from "tailwind-variants";

export const gameCarouselSection = tv({
	slots: {
		wrapper: "flex flex-col items-center gap-6 w-full",
		stage:
			"relative flex items-center justify-center w-full h-56 [perspective:1200px]",
		cardBase: [
			"absolute w-64 h-44 rounded-2xl border-2 p-5 flex flex-col gap-3",
			"transition-all duration-500 ease-in-out cursor-pointer select-none",
			"[transform-style:preserve-3d]",
		],
		cardCenter:
			"scale-100 opacity-100 z-20 [transform:rotateY(0deg)_translateX(0)]",
		cardLeft:
			"scale-75 opacity-50 z-10 [transform:rotateY(20deg)_translateX(-80%)]",
		cardRight:
			"scale-75 opacity-50 z-10 [transform:rotateY(-20deg)_translateX(80%)]",
		navButton:
			"p-2 rounded-full glass-card text-brand-600 hover:text-brand-900 transition-colors",
		gameIcon: "w-10 h-10 relative",
		gameTitle: "font-black text-xl tracking-widest",
		gameDesc: "text-xs opacity-70 font-mono tracking-wider",
		actionRow: "flex flex-col items-center gap-2",
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
		infoPanel: "flex items-center gap-4 text-sm text-brand-600",
		infoItem: "flex items-center gap-1.5",
		modeTagCooperative:
			"px-2 py-0.5 rounded-full text-xs font-bold bg-teal-700/30 text-teal-300 border border-teal-600/50",
		modeTagCompetitive:
			"px-2 py-0.5 rounded-full text-xs font-bold bg-red-900/30 text-red-400 border border-red-600/50",
	},
});
