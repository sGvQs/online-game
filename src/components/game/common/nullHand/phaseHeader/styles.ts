import { tv } from "tailwind-variants";

export const phaseHeader = tv({
	slots: {
		root: "text-center",
		engLabel:
			"text-[#44FFFF] text-sm font-bold tracking-[0.3em] mb-2 font-sans uppercase",
		title: "text-white text-3xl font-bold tracking-wider",
		subLabel: "text-gray-500 text-xs mt-1 tracking-[0.2em] font-sans uppercase",
	},
});
