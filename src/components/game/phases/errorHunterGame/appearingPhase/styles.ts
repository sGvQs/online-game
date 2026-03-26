import { tv } from "tailwind-variants";

export const appearingPhase = tv({
	slots: {
		floatingDialog: [
			"absolute",
			"cursor-move",
			"animate-[win95-appear_0.15s_ease-out]",
			"w-[400px]",
			"[left:var(--dialog-left)] [top:var(--dialog-top)]",
		],
		errorMessage: "whitespace-pre-line text-xs",
	},
});
