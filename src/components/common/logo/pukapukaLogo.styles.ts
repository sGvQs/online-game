import { tv } from "tailwind-variants";

export const pukapukaLogoStyles = tv({
    slots: {
        titleBlock:
            "text-6xl md:text-8xl font-black tracking-tight leading-[1.1] pb-4 mb-2 font-rubik-puddles",
        titleSpanWhite:
            "bg-[linear-gradient(135deg,#ffffff_0%,#818cf8_50%,#a78bfa_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(129,140,248,0.5)]",
        titleSpanPurple:
            "bg-[linear-gradient(135deg,#818cf8_0%,#c084fc_60%,#f472b6_100%)] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(192,132,252,0.5)]",
    },
});
