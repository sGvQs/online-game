import { tv } from "tailwind-variants";

export const starShieldTitle = tv({
	slots: {
		wrapper: "leading-[0.8] select-none flex items-center flex-col",
		star: "block",
		shield: "block",
	},
	variants: {
		size: {
			sm: { star: "text-4xl", shield: "text-4xl" },
			md: { star: "text-[5.5rem]", shield: "text-[5.5rem]" },
			lg: { star: "text-[8rem]", shield: "text-[8rem]" },
		},
	},
	defaultVariants: { size: "lg" },
});
