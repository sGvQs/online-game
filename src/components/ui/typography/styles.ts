import { tv } from "tailwind-variants";
import { type ElementType } from "react";

export type TypographyVariant =
    | "display"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "body"
    | "small"
    | "label"
    | "caption";
export type TypographyFont =
    | "cherry-bomb-one"
    | "dot-gothic-16"
    | "rubik-puddles"
    | "honk"
    | "sans"
    | "mono";

export const typography = tv({
    variants: {
        variant: {
            display: "text-8xl font-black tracking-tight leading-none",
            h1: "text-6xl",
            h2: "text-2xl",
            h3: "text-xl",
            h4: "text-sm font-bold uppercase tracking-wider",
            body: "text-sm leading-relaxed",
            small: "text-xs",
            label: "text-[11px] uppercase tracking-wider",
            caption: "text-[9px]",
        },
        font: {
            "cherry-bomb-one": "font-cherry-bomb-one",
            "dot-gothic-16": "font-dot-gothic-16",
            "rubik-puddles": "font-rubik-puddles",
            honk: "font-honk",
            sans: "font-sans",
            mono: "font-['Courier_New',monospace]",
        },
    },
});

export const FONT_VARIANTS = {
    "rubik-puddles": ["display"],
    "cherry-bomb-one": ["h1", "h2", "h3"],
    "dot-gothic-16": ["h4", "body", "small", "label", "caption"],
    honk: [],
    sans: [],
    mono: [],
} as const satisfies Record<TypographyFont, readonly TypographyVariant[]>;

export function getDefaultFont(variant: TypographyVariant): TypographyFont {
    for (const [font, variants] of Object.entries(FONT_VARIANTS) as [
        TypographyFont,
        readonly TypographyVariant[],
    ][]) {
        if ((variants as readonly string[]).includes(variant)) return font;
    }
    return "dot-gothic-16";
}

export const DEFAULT_ELEMENTS: Record<TypographyVariant, ElementType> = {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    body: "p",
    small: "p",
    label: "span",
    caption: "span",
};

export const GRADIENT_COLORS = {
    WHITE_TO_BLUE: "whiteToBlue",
    PURPLE_TO_PINK: "PurpleToPink",
    BLUE_TO_GREEN: "BlueToGreen",
    ORANGE_TO_PINK: "OrangeToPink",
    RED_TO_PURPLE: "RedToPurple",
    PINK_TO_PURPLE: "PinkToPurple",
    PURPLE_TO_RED: "PurpleToRed",
    PURPLE_TO_ORANGE: "PurpleToOrange",
    ORANGE_TO_RED: "OrangeToRed",
    RED_TO_ORANGE: "RedToOrange",
    ORANGE_TO_PURPLE: "OrangeToPurple",
} as const;

export type GradientColor = (typeof GRADIENT_COLORS)[keyof typeof GRADIENT_COLORS];

export const gradientTextStyle = tv({
    variants: {
        color: {
            [GRADIENT_COLORS.WHITE_TO_BLUE]:
                "bg-[linear-gradient(135deg,#ffffff_0%,#818cf8_50%,#a78bfa_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(129,140,248,0.5)]",
            [GRADIENT_COLORS.PURPLE_TO_PINK]:
                "bg-[linear-gradient(135deg,#818cf8_0%,#c084fc_60%,#f472b6_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(192,132,252,0.5)]",
            [GRADIENT_COLORS.BLUE_TO_GREEN]:
                "bg-[linear-gradient(135deg,#e0f2fe_0%,#38bdf8_50%,#2dd4bf_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(56,189,248,0.5)]",
            [GRADIENT_COLORS.ORANGE_TO_PINK]:
                "bg-[linear-gradient(135deg,#fef3c7_0%,#fb923c_60%,#e879f9_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]",
            [GRADIENT_COLORS.RED_TO_PURPLE]:
                "bg-[linear-gradient(135deg,#f43f5e_0%,#e879f9_60%,#818cf8_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.5)]",
            [GRADIENT_COLORS.PINK_TO_PURPLE]:
                "bg-[linear-gradient(135deg,#f472b6_0%,#e879f9_60%,#818cf8_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.5)]",
            [GRADIENT_COLORS.PURPLE_TO_RED]:
                "bg-[linear-gradient(135deg,#818cf8_0%,#e879f9_60%,#f43f5e_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.5)]",
            [GRADIENT_COLORS.PURPLE_TO_ORANGE]:
                "bg-[linear-gradient(135deg,#818cf8_0%,#e879f9_60%,#fb923c_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]",
            [GRADIENT_COLORS.ORANGE_TO_RED]:
                "bg-[linear-gradient(135deg,#fb923c_0%,#f43f5e_60%,#e879f9_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.5)]",
            [GRADIENT_COLORS.RED_TO_ORANGE]:
                "bg-[linear-gradient(135deg,#f43f5e_0%,#fb923c_60%,#e879f9_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,146,60,0.5)]",
            [GRADIENT_COLORS.ORANGE_TO_PURPLE]:
                "bg-[linear-gradient(135deg,#fb923c_0%,#e879f9_60%,#818cf8_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(232,121,249,0.5)]",
        },
    },
});
