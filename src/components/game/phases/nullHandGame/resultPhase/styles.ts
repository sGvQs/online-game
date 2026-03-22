import { tv } from "tailwind-variants";

export const resultPhase = tv({
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
		playerName: "font-bold text-xl mb-4 tracking-widest",
		hostName: "text-white opacity-70",
		myselfName: "[color:var(--result-user-color,#44FFFF)]",
		vsText: "text-4xl font-bold text-white italic opacity-50",
		handWrapper: "transition-all duration-500",
		handWrapperWin: "w-48 h-48",
		handWrapperLose: "w-40 h-40 opacity-70",
		revealTitle:
			"text-[#FF4444] font-black text-2xl tracking-[0.2em] uppercase border-b-2 border-[#FF4444] inline-block pb-1",
		revealSubtitle: "text-gray-500 text-sm mt-2",
		sideFooter: "mt-auto pt-4 border-t border-[#44FFFF]/10",
		sideFooterContent:
			"flex justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold",
		youBadge:
			"text-[10px] bg-[#44FFFF]/10 text-[#44FFFF] border border-[#44FFFF]/20 px-1.5 py-0.5 rounded font-sans",
	},
	variants: {
		winner: {
			true: { playerName: "text-[#FF4444]" },
			false: { playerName: "text-white" },
		},
	},
});
