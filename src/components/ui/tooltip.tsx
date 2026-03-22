"use client";

import { ReactNode } from "react";
import { tooltip } from "./tooltip.styles";

interface TooltipProps {
	children: ReactNode;
	content: string;
	position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ children, content, position = "top" }: TooltipProps) {
	const styles = tooltip({ position });

	return (
		<div className={styles.trigger()}>
			{children}
			<div className={styles.popover()}>
				<div className={styles.content()}>
					{content}
					<div className={styles.arrow()} />
				</div>
			</div>
		</div>
	);
}
