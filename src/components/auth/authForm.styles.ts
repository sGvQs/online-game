import { tv } from "tailwind-variants";

export const authForm = tv({
	slots: {
		wrapper: [
			"w-full rounded-2xl px-8 py-8 flex flex-col items-center gap-6",
			"bg-brand-500/5 border border-brand-500/18",
			"shadow-[0_8px_32px_rgba(0,0,0,0.14)] backdrop-blur-xl",
		],
		header: "text-center",
		headerTitle: "text-xl text-white font-cherry-bomb-one",
		headerSub: "mt-1.5 text-[10px] text-brand-700",
		separator: "w-full h-px bg-brand-500/10",
		errorBox:
			"w-full p-3 bg-red-900/40 text-red-300 border border-red-700/50 rounded-xl text-[11px] font-dot-gothic-16",
		legalText: "text-[10px] text-center text-brand-700/60 leading-relaxed",
		legalLink:
			"hover:text-brand-500 transition-colors underline underline-offset-2",
	},
});
