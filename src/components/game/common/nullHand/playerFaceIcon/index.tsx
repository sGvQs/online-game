import Image from "next/image";
import {
	FACE_ICON_PATHS,
	DEFAULT_FACE_ICON,
	FaceIcon,
} from "@/constants/common/faceIcon";
import { playerFaceIcon } from "./styles";
import { cn } from "@/lib/utils";

const sizeMap = {
	sm: { w: 24, h: 24 },
	md: { w: 32, h: 32 },
	lg: { w: 40, h: 40 },
};

interface PlayerFaceIconProps {
	faceIcon?: FaceIcon | null;
	/** カスタムアイコン（恐竜など）。指定時は faceIcon より優先 */
	customSrc?: string | null;
	size?: "sm" | "md" | "lg";
	className?: string;
}

export function PlayerFaceIcon({
	faceIcon,
	customSrc,
	size = "md",
	className = "",
}: PlayerFaceIconProps) {
	const icon = faceIcon ?? DEFAULT_FACE_ICON;
	const path = customSrc ?? FACE_ICON_PATHS[icon];
	const { w, h } = sizeMap[size];

	return (
		<div className={cn(playerFaceIcon({ size }).root(), className)}>
			<Image
				src={path}
				alt=""
				width={w}
				height={h}
				className="object-contain"
			/>
		</div>
	);
}
