import { tv } from "tailwind-variants";

export const playerFaceIcon = tv({
	slots: {
		root: "relative shrink-0 overflow-hidden rounded-full bg-black/40",
	},
	variants: {
		size: {
			sm: { root: "w-6 h-6" },
			md: { root: "w-8 h-8" },
			lg: { root: "w-10 h-10" },
		},
	},
	defaultVariants: {
		size: "md",
	},
});
