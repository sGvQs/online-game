import { tv } from "tailwind-variants";

export const hand3D = tv({
	slots: {
		canvasWrapper: "bg-black",
	},
	variants: {
		size: {
			micro: { canvasWrapper: "w-[100px] h-[100px]" },
			small: { canvasWrapper: "w-[150px] h-[150px]" },
			medium: { canvasWrapper: "w-full h-[250px]" },
			large: { canvasWrapper: "w-full h-[400px]" },
		},
	},
	defaultVariants: {
		size: "medium",
	},
});
