import { type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
	type TypographyVariant,
	type TypographyFont,
	type GradientColor,
	typography,
	gradientTextStyle,
	getDefaultFont,
	DEFAULT_ELEMENTS,
} from "./styles";

interface TypographyProps extends HTMLAttributes<HTMLElement> {
	variant: TypographyVariant;
	font?: TypographyFont;
	gradientColor?: GradientColor;
	as?: any; // as ElementType isn't strictly inferred easily here without complex generics, `any` or explicit cast is fine as Tag down below
	className?: string;
	children: ReactNode;
}

export function Typography({
	variant,
	font,
	gradientColor,
	as,
	className,
	children,
	...props
}: TypographyProps) {
	const Tag = (as ?? DEFAULT_ELEMENTS[variant]) as any;
	const appliedFont = font ?? getDefaultFont(variant);

	return (
		<Tag
			className={cn(
				typography({ variant, font: appliedFont }),
				gradientColor && gradientTextStyle({ color: gradientColor }),
				className
			)}
			{...props}
		>
			{children}
		</Tag>
	);
}

