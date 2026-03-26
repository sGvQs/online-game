import { tv } from "tailwind-variants";

export const loadingOverlay = tv({
	slots: {
		overlay:
			"fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm",
		dots: "flex items-center gap-3",
		dot: "w-3 h-3 rounded-full bg-brand-500",
	},
});
