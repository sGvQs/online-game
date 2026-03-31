import Image from "next/image";
import { cn } from "@/lib/utils";

const ICON_PX = 20;

/**
 * 難易度チップ用。HOME 軌道と同じ天体 SVG（多色）。`DIFFICULTY_META.orbitIconSrc` を渡す。
 */
export function DifficultyOrbitIcon({
	src,
	glowBoxShadow,
	dimmed,
	className,
}: {
	src: string;
	/** `DIFFICULTY_META.glow`（box-shadow 形式）。アクティブ時のみ */
	glowBoxShadow?: string;
	/** ロック時などの視覚的弱体化 */
	dimmed?: boolean;
	className?: string;
}) {
	const filter =
		glowBoxShadow != null && glowBoxShadow !== "none"
			? `drop-shadow(${glowBoxShadow})`
			: undefined;

	return (
		<span
			className={cn(
				"relative inline-flex h-5 w-5 shrink-0 items-center justify-center",
				dimmed && "opacity-40 grayscale",
				className,
			)}
			style={{ filter }}
		>
			<Image
				src={src}
				alt=""
				width={ICON_PX}
				height={ICON_PX}
				className="object-contain"
				unoptimized
			/>
		</span>
	);
}
