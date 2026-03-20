import { tv } from "tailwind-variants";

export const starVisual = tv({
	slots: {
		root: [
			"absolute pointer-events-none z-0 overflow-visible",
			"[left:var(--star-left)] [bottom:var(--star-bottom)] [width:var(--star-width)] [height:var(--star-height)] [transform:var(--star-transform)]",
		],
		svg: "w-full h-full overflow-visible",
		circle: "[filter:var(--star-glow-filter)]",
	},
});
