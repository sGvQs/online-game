import { tv, type VariantProps } from "tailwind-variants";


const button = tv({
    base: "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-500",
    variants: {
        screen: {
            default: "font-cherry-bomb-one",
            "star-shield":
                "font-cherry-bomb-one rounded-2xl font-bold text-left select-none",
        },
        variant: {
            solid: "",
            outline: "",
            ghost: "",
            primary: "",
            success: "",
            danger: "",
            secondary: "",
            yellow: "",
            blue: "",
        },
        size: {
            sm: "text-xs px-3 py-1.5",
            md: "text-sm px-4 py-2",
            lg: "text-base px-6 py-3",
            xl: "text-lg px-8 py-4",
        },
        fullWidth: {
            true: "w-full",
        },
    },
    compoundVariants: [
        // --- default ---
        {
            screen: "default",
            variant: "solid",
            class: "bg-brand-300 text-white shadow-[0_0_15px_rgba(67,56,202,0.3)] hover:shadow-[0_0_25px_rgba(67,56,202,0.5)] hover:scale-105 active:scale-95",
        },
        {
            screen: "default",
            variant: "outline",
            class:
                "border border-brand-200 text-brand-600 hover:bg-brand-100 hover:border-brand-300",
        },
        {
            screen: "default",
            variant: "ghost",
            class: "text-brand-700 hover:bg-brand-100",
        },
        {
            screen: "default",
            variant: "primary",
            class:
                "bg-linear-to-r from-indigo-600 to-purple-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:scale-105 active:scale-95",
        },
        {
            screen: "default",
            variant: "success",
            class:
                "bg-green-600/90 text-white border border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)] hover:scale-105 active:scale-95",
        },
        {
            screen: "default",
            variant: "danger",
            class:
                "bg-red-600/90 text-white hover:bg-red-500 hover:scale-105 active:scale-95",
        },
        {
            screen: "default",
            variant: "secondary",
            class:
                "bg-linear-to-r from-yellow-200 to-pink-500 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105 active:scale-95",
        },
        {
            screen: "default",
            variant: "yellow",
            class:
                "bg-amber-400/90 text-white border border-amber-300/50 shadow-[0_0_15px_rgba(251,191,36,0.3)] hover:shadow-[0_0_25px_rgba(251,191,36,0.5)] hover:scale-105 active:scale-95",
        },
        {
            screen: "default",
            variant: "blue",
            class:
                "bg-blue-500/90 text-white border border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] hover:scale-105 active:scale-95",
        },
    ],
    defaultVariants: {
        screen: "default",
        variant: "solid",
        size: "md",
    },
});

export { button };