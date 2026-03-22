import { tv } from "tailwind-variants";

export const battlePhase = tv({
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
		dataLabel: "text-gray-500 text-[10px] uppercase tracking-wider mb-1",
		dataValue: "font-bold text-white",
		lieTag:
			"inline-flex items-center gap-1 bg-[#FF4444]/10 border border-[#FF4444]/30 text-[#FF4444] px-2 py-0.5 rounded text-[10px] font-bold",
		trueTag:
			"inline-flex items-center gap-1 bg-[#44FFFF]/10 border border-[#44FFFF]/30 text-[#44FFFF] px-2 py-0.5 rounded text-[10px] font-bold",
	},
});
