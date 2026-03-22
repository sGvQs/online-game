import { tv } from "tailwind-variants";

export const annoyingDinosaurComplaint = tv({
	slots: {
		inner: "flex items-start gap-2 w-full",
		imageWrapper: "relative w-14 h-14 sm:w-16 sm:h-16 shrink-0",
		bubbleWrapper: "shrink-0 mt-2 w-[200px]",
		bubble:
			"relative px-2.5 py-1.5 rounded-xl border border-white bg-white text-black text-[10px] font-medium shadow-sm",
		bubbleText: "tracking-wide font-cherry-bomb-one",
		bubbleTail:
			"absolute -left-1.5 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-r-[6px] border-r-white",
	},
});
