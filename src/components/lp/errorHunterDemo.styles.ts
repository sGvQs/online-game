import { tv } from "tailwind-variants";

export const errorHunterDemo = tv({
	slots: {
		wrapper: [
			"relative rounded-xl overflow-hidden border-2 border-brand-500/50",
			"bg-[#008080] min-h-[400px]",
			"font-['MS_Sans_Serif','Segoe_UI',Tahoma,sans-serif] text-xs",
		],
		errorCard:
			"absolute translate-x-[-50%] translate-y-[-50%] z-10 animate-[win95-appear_0.15s_ease-out]",
		overlay:
			"absolute inset-0 flex items-center justify-center z-20 bg-black/30",
	},
});
