import { tv } from "tailwind-variants";

export const gameOverPhase = tv({
	slots: {
		mainArea: [
			"col-span-12 lg:col-span-8",
			"border-[4px]",
			"border-[#FF4444]",
			"p-4",
			"min-h-[600px]",
			"flex",
			"flex-col",
			"justify-between",
		],
		sideArea: [
			"col-span-12 lg:col-span-4",
			"border-[4px]",
			"border-[#FF4444]",
			"p-4",
			"flex",
			"flex-col",
			"gap-3",
		],
		rankLabel: "text-[#44FFFF] text-xl font-bold mb-2 tracking-widest",
		rankContainer:
			"flex items-center justify-center gap-8 text-4xl font-sans font-bold",
		rankOld: "text-gray-500",
		rankArrow: "text-white",
		rankNew: "text-[#FF4444] text-5xl",
		pointsContainer:
			"mt-4 flex items-center justify-center gap-4 text-xl font-sans",
		pointsLabel: "text-gray-400",
		pointsOld: "text-gray-500",
		pointsArrow: "text-white",
		pointsNew: "text-[#44FFFF] font-bold text-2xl",
	},
});
