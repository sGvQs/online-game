import { tv } from "tailwind-variants";

export const bgmPlayer = tv({
	slots: {
		wrapper:
			"fixed bottom-6 right-6 z-50 flex h-12 flex-row items-stretch gap-2",
		segments: "flex h-12 min-h-12 flex-row items-stretch gap-0.5",
		segment:
			"h-12 w-1.5 shrink-0 rounded-full border-0 bg-white/15 p-0 cursor-pointer transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-400/80",
		segmentActive: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]",
		button:
			"h-12 w-12 shrink-0 rounded-full text-white flex items-center justify-center bg-transparent hover:bg-white/10 transition-colors",
	},
});
