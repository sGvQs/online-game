import { tv, type VariantProps } from "tailwind-variants";


const button = tv({
    base: "inline-flex items-center justify-center rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-brand-500",
    variants: {
        screen: {
            default: "",
            "null-hand":
                "border-2 bg-black/20 font-black uppercase tracking-[0.3em] flex-col backdrop-blur-sm",
            "error-hunter":
                "min-w-[75px] h-[23px] bg-[#c0c0c0] border-2 border-solid border-t-white border-l-white border-r-[#808080] border-b-[#808080] text-xs rounded-none font-[inherit]",
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
            amber: "",
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
            class: "bg-brand-300 text-white hover:bg-brand-400",
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
            variant: "amber",
            class:
                "bg-pink-500/90 text-white border border-pink-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:scale-105 active:scale-95",
        },

        // --- null-hand ---
        {
            screen: "null-hand",
            variant: "solid",
            class: "border-white/20 text-white",
        },
        {
            screen: "null-hand",
            variant: "primary",
            class:
                "border-[#FF4444] bg-[#FF4444]/10 hover:bg-[#FF4444]/20 text-white",
        },
        {
            screen: "null-hand",
            variant: "success",
            class:
                "border-[#44FFFF] bg-[#44FFFF]/10 hover:bg-[#44FFFF]/20 text-[#44FFFF]",
        },
        {
            screen: "null-hand",
            variant: "danger",
            class:
                "border-[#FF4444] bg-[#FF4444]/10 text-[#FF4444] hover:bg-[#FF4444] hover:text-black",
        },
        {
            screen: "null-hand",
            variant: "ghost",
            class: "border-white/20 bg-transparent text-white hover:bg-white/10",
        },
        // null-hand 専用サイズ
        { screen: "null-hand", size: "sm", class: "px-4 py-1 text-[10px]" },
        { screen: "null-hand", size: "md", class: "px-10 py-3 text-sm" },
        { screen: "null-hand", size: "lg", class: "px-16 py-4 text-lg" },

        // --- error-hunter (Win95 固定サイズで size variant を上書き) ---
        { screen: "error-hunter", size: "sm", class: "px-3 py-0 text-xs" },
        { screen: "error-hunter", size: "md", class: "px-3 py-0 text-xs" },
        { screen: "error-hunter", size: "lg", class: "px-3 py-0 text-xs" },
        { screen: "error-hunter", size: "xl", class: "px-3 py-0 text-xs" },
        {
            screen: "error-hunter",
            variant: "success",
            class: "bg-[#008000] text-white border-t-[#00a000] border-l-[#00a000]",
        },
        {
            screen: "error-hunter",
            variant: "danger",
            class:
                "text-[#808080] [text-shadow:1px_1px_0_#ffffff] cursor-not-allowed",
        },

        // --- star-shield ---
        {
            screen: "star-shield",
            variant: "solid",
            class:
                "bg-[rgba(45,42,66,0.92)] border-2 border-[#4a4a6a] text-gray-400 hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]",
        },
        {
            screen: "star-shield",
            variant: "primary",
            class:
                "bg-[rgba(79,70,229,0.92)] border-2 border-indigo-400 text-indigo-100 shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:scale-[1.02] hover:brightness-110 active:scale-[0.98]",
        },
        {
            screen: "star-shield",
            variant: "success",
            class:
                "bg-[rgba(34,197,94,0.9)] border-2 border-green-400 text-green-100 shadow-[0_0_16px_rgba(34,197,94,0.4)] hover:scale-105 active:scale-95",
        },
    ],
    defaultVariants: {
        screen: "default",
        variant: "solid",
        size: "md",
    },
});

export { button };