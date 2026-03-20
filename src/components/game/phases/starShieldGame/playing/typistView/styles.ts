import { tv } from "tailwind-variants";

export const typistView = tv({
	slots: {
		bullet: [
			"absolute pointer-events-none z-20 rounded-full",
			"left-full top-1/2 -translate-y-1/2 w-3 h-3",
			"[background-color:var(--bullet-color)] [box-shadow:0_0_8px_var(--bullet-shadow)]",
		],
		dialogueCard:
			"rounded-xl px-8 py-4 max-w-lg w-full text-center bg-[rgba(30,41,59,0.4)] border border-[rgba(129,140,248,0.2)]",
		scoreLabel: "text-base text-brand-500/80",
		scoreValue: "text-brand-500 font-bold text-4xl tabular-nums",
		hpLabel: "text-md text-white",
		hpBar:
			"absolute left-0 top-0 h-full bg-green-500 transition-all duration-150 [width:var(--hp-pct)]",
		damageFlash:
			"absolute top-0 h-full bg-red-500 z-10 origin-left [left:var(--hp-pct)]",
	},
});
