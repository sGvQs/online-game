import { tv } from "tailwind-variants";

export const auroraGlow = tv({
	slots: {
		root: [
			"absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none",
			"[width:var(--aurora-width)] [height:var(--aurora-height)]",
			"[opacity:var(--aurora-opacity)] [filter:var(--aurora-filter)] [background:var(--aurora-bg)]",
		],
	},
});
