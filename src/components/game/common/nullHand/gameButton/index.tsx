"use client";
import { type ButtonHTMLAttributes } from "react";
import { Button } from "@/components/ui/button";
import { useSE } from "@/hooks/useSE";

type NullHandVariant = "primary" | "secondary" | "danger" | "cyan";

const VARIANT_MAP = {
	primary: "primary",
	secondary: "solid",
	danger: "danger",
	cyan: "success",
} as const;

interface GameButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: NullHandVariant;
	fullWidth?: boolean;
	size?: "sm" | "md" | "lg";
}

export const GameButton = ({
	variant = "primary",
	fullWidth,
	size = "md",
	onClick,
	...props
}: GameButtonProps) => {
	const { play } = useSE();

	return (
		<Button
			screen="null-hand"
			variant={VARIANT_MAP[variant]}
			size={size}
			fullWidth={fullWidth}
			se={null}
			onClick={(e) => {
				play(
					variant === "primary" || variant === "danger" ? "submit" : "select",
				);
				onClick?.(e);
			}}
			{...props}
		/>
	);
};
