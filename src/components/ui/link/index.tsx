"use client";

import { useCallback, useContext, type ComponentProps } from "react";
import NextLink from "next/link";
import { SoundContext } from "@/lib/sound-context";
import { effectiveSeVolume } from "@/lib/sound-volume";
import type { ButtonSE } from "@/components/ui/button";

const SE_FILES: Record<Exclude<ButtonSE, null>, string> = {
    push: "/se/select-se.mp3",
    submit: "/se/submit-se.mp3",
    click: "/se/click-se.mp3",
    buy: "/se/buy-se.mp3",
    leave: "/se/leave-se.mp3",
};

export interface LinkProps extends ComponentProps<typeof NextLink> {
    se?: ButtonSE;
}

export function Link({ se = "submit", onClick, ...props }: LinkProps) {
    const sound = useContext(SoundContext);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>) => {
            if (sound?.isPlaying && se !== null) {
                const audio = new Audio(SE_FILES[se]);
                audio.volume = effectiveSeVolume(0.1, sound.volume);
                audio.play().catch(() => {});
            }
            onClick?.(e);
        },
        [sound, se, onClick],
    );

    return <NextLink onClick={handleClick} {...props} />;
}
