import { tv } from "tailwind-variants";

export const handCard = tv({
	slots: {
		root: "flex flex-col items-center transition-all duration-300",
		card: "relative flex items-center justify-center transition-all duration-500",
	},
	variants: {
		size: {
			small: {
				card: "w-24 h-24",
			},
			medium: {
				card: "w-40 h-40",
			},
			large: {
				card: "w-56 h-56",
			},
		},
		active: {
			true: {
				card: "opacity-100 scale-100",
			},
			false: {
				card: "opacity-10 scale-90 grayscale-[0.9]",
			},
		},
		color: {
			cyan: {
				card: "text-[#44FFFF]",
			},
			red: {
				card: "text-[#FF4444]",
			},
			gray: {
				card: "text-gray-500",
			},
		},
	},
	defaultVariants: {
		size: "medium",
		active: true,
		color: "cyan",
	},
});
