import { tv } from "tailwind-variants";

export const roleBadge = tv({
	slots: {
		badge: [
			"text-xs px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1",
			"font-cherry-bomb-one [color:var(--badge-color)] [background:var(--badge-bg)] [border:var(--badge-border)]",
		],
	},
});
