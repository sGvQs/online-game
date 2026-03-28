import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { button } from "./styles";

type ButtonScreen = "default" | "null-hand" | "error-hunter" | "star-shield";
type ButtonVariant =
    | "solid"
    | "outline"
    | "ghost"
    | "primary"
    | "success"
    | "danger"
    | "secondary"
    | "amber";
type ButtonSize = "sm" | "md" | "lg" | "xl";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    screen?: ButtonScreen;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    className?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, screen, variant, size, fullWidth, ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(button({ screen, variant, size, fullWidth, className }))}
                {...props}
            />
        );
    },
);
Button.displayName = "Button";
export { Button };