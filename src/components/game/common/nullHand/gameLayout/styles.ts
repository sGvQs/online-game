import { tv } from "tailwind-variants";

export const gameLayout = tv({
	slots: {
		container: [
			"bg-black",
			"h-screen",
			"w-screen",
			"font-sans",
			"text-white",
			"overflow-hidden",
			"flex",
			"items-center",
			"justify-center",
			"p-4",
			"md:p-8",
		],
		gameGrid: ["grid", "grid-cols-12", "gap-4", "w-full", "max-w-7xl"],
		phaseBox: [
			"col-span-12",
			"p-2",
			"text-center",
			"text-xl",
			"font-bold",
			"text-[#44FFFF]",
			"tracking-[0.3em]",
		],
	},
});
