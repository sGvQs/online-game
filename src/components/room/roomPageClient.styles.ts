import { tv } from "tailwind-variants";

export const roomPageClient = tv({
	slots: {
		layout: "grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-8 min-h-screen",
		leftColumn: "lg:col-span-1 flex flex-col gap-6",
		rightColumn: "lg:col-span-2",
		errorModalContent: "p-6 space-y-4",
		errorModalText: "text-brand-800",
		errorModalSub: "text-sm text-brand-600",
		errorModalActions: "flex justify-center pt-4",
	},
});
