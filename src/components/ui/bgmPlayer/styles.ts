import { tv } from "tailwind-variants";

export const bgmPlayer = tv({
	slots: {
		wrapper:
			"fixed bottom-6 right-6 z-50 flex flex-row items-center gap-0.5",
		segments:
			"flex flex-row items-center gap-0.5 self-center",
		segment:
			"w-1.25 shrink-0 self-center rounded-full border-0 bg-white/15 p-0 cursor-pointer transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-400/80",
		segmentActive: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.45)]",
		button:
			"h-10 w-10 shrink-0 cursor-pointer rounded-full text-white flex items-center justify-center bg-transparent hover:bg-white/10 transition-colors",
	},
});
