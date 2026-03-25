import { Typography } from "@/components/ui/typography";
import { starShieldTitle } from "./styles";

const SIZE_CLASS = {
	sm: "text-4xl",
	md: "text-[5.5rem]",
	lg: "text-[8rem]",
} as const;

interface StarShieldTitleProps {
	size?: "sm" | "md" | "lg";
}

export function StarShieldTitle({ size = "lg" }: StarShieldTitleProps) {
	const styles = starShieldTitle({ size });
	const sizeClass = SIZE_CLASS[size];
	return (
		<div className={styles.wrapper()}>
			<Typography
				variant="display"
				font="honk"
				as="span"
				className={`${styles.star()} ${sizeClass}`}
			>
				STAR
			</Typography>
			<Typography
				variant="display"
				font="honk"
				as="span"
				className={`${styles.shield()} ${sizeClass}`}
			>
				SHIELD
			</Typography>
		</div>
	);
}
