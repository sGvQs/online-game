import { tv } from "tailwind-variants";

export const roomClient = tv({
	slots: {
		wrapper: "flex justify-center items-center gap-2 p-8 min-h-screen",
		inner: "flex",
		leftPanel:
			"flex flex-col items-center justify-baseline gap-6 px-8 py-4",
		memberSection: "flex flex-col gap-2",
		rightPanel:
			"flex flex-col items-center gap-6 px-8 py-12 w-[600px]",
	},
});
