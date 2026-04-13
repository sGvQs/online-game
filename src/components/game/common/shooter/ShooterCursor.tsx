"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface ShooterCursorProps {
	x: number;
	y: number;
	visible: boolean;
}

/**
 * HOME 緊急モードと同じ照準カーソル（target-circle.svg）。
 * 親コンテナ内で absolute 配置される前提。
 * visible=false のとき非表示（ポインターイベントも無効）。
 */
export function ShooterCursor({ x, y, visible }: ShooterCursorProps) {
	if (!visible) return null;

	return (
		<motion.div
			className="absolute top-0 left-0 w-12 h-12 pointer-events-none z-[46]"
			style={{
				x,
				y,
				translateX: "-50%",
				translateY: "-50%",
			}}
		>
			<Image
				src="/svg/object/target-circle.svg"
				alt=""
				fill
				className="object-contain"
			/>
		</motion.div>
	);
}
