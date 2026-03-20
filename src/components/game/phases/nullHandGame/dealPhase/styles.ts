import { tv } from "tailwind-variants";

export const dealPhase = tv({
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
	},
});
