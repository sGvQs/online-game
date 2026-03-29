"use client";

import { type ButtonHTMLAttributes, forwardRef, useCallback, useContext } from "react";
import { cn } from "@/lib/utils";
import { button } from "./styles";
import { SoundContext } from "@/lib/sound-context";

type ButtonScreen = "default" | "null-hand" | "error-hunter" | "star-shield";
type ButtonVariant =
    | "solid"
    | "outline"
    | "ghost"
    | "primary"
    | "success"
    | "danger"
    | "secondary"
    | "yellow"
    | "blue";
type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonSE = "push" | "submit" | "click" | "buy" | "leave" | null;

const SE_FILES: Record<Exclude<ButtonSE, null>, string> = {
    push: "/se/select-se.mp3",
    submit: "/se/submit-se.mp3",
    click: "/se/click-se.mp3",
    buy: "/se/buy-se.mp3",
    leave: "/se/leave-se.mp3",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    screen?: ButtonScreen;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
    se?: ButtonSE;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, screen, variant, size, fullWidth, se = "push", onClick, ...props }, ref) => {
        const sound = useContext(SoundContext);

        const handleClick = useCallback(
            (e: React.MouseEvent<HTMLButtonElement>) => {
                if (sound?.isPlaying && se !== null) {
                    const audio = new Audio(SE_FILES[se]);
                    audio.volume = 0.1;
                    audio.play().catch(() => {});
                }
                onClick?.(e);
            },
            [sound, se, onClick],
        );

        return (
            <button
                ref={ref}
                className={cn(button({ screen, variant, size, fullWidth, className }))}
                onClick={handleClick}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";
export { Button };
