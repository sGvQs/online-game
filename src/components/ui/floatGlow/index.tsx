"use client";

import { motion } from "framer-motion";
import { GlowVariant, glowColors } from "./styles";

export { GlowVariant };

export function FloatGlow({
	active,
	variant = GlowVariant.Primary,
	className,
	children,
}: {
	active: boolean;
	variant?: GlowVariant;
	className?: string;
	children: React.ReactNode;
}) {
	const glowColor = glowColors[variant];
	return (
		<motion.div
			className={className ? `rounded-lg ${className}` : "rounded-lg"}
			animate={
				active
					? {
							y: [0, -2, 0],
							boxShadow: [
								`0 0 0px ${glowColor}`,
								`0 0 20px ${glowColor}`,
								`0 0 0px ${glowColor}`,
							],
						}
					: { y: 0, boxShadow: "0 0 0px transparent" }
			}
			transition={
				active ? { repeat: Infinity, duration: 1.6, ease: "easeInOut" } : {}
			}
		>
			{children}
		</motion.div>
	);
}
