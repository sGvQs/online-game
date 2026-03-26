import { tv } from "tailwind-variants";

export const sideHeader = tv({
	slots: {
		root: "flex justify-between items-end border-b",
		engLabel: "font-bold tracking-[0.2em] uppercase",
		label: "text-white font-bold",
		badge: "text-black px-1.5 py-0.5 rounded text-[10px] font-bold mb-1",
	},
	variants: {
		variant: {
			cyan: {
				root: "border-[#44FFFF]",
				engLabel: "text-[#44FFFF]",
				badge: "bg-[#44FFFF]",
			},
			red: {
				root: "border-[#FF4444]",
				engLabel: "text-[#FF4444]",
				badge: "bg-[#FF4444]",
			},
		},
		compact: {
			true: {
				root: "mb-2 pb-1",
				engLabel: "text-[10px] mb-0.5",
				label: "text-base",
			},
			false: {
				root: "mb-4 pb-2 border-b-2",
				engLabel: "text-xs mb-1",
				label: "text-xl",
			},
		},
	},
	defaultVariants: {
		variant: "cyan",
		compact: false,
	},
});
