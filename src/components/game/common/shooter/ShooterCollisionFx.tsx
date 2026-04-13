"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export interface CollisionFx {
	id: string;
	x: number;
	y: number;
}

interface ShooterCollisionFxProps {
	collisions: CollisionFx[];
}

/**
 * HOME 緊急モードと同じ衝突エフェクト（collision.svg）。
 * 命中位置で scale 0.5→1.4、opacity 1→0 で拡大消滅する。
 * 親コンテナ内で absolute 配置される前提。
 */
export function ShooterCollisionFx({ collisions }: ShooterCollisionFxProps) {
	return (
		<>
			{collisions.map((c) => (
				<motion.div
					key={c.id}
					className="absolute top-0 left-0 w-16 h-16 pointer-events-none z-[46]"
					style={{ x: c.x, y: c.y, translateX: "-50%", translateY: "-50%" }}
					initial={{ scale: 0.5, opacity: 1 }}
					animate={{ scale: 1.4, opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				>
					<Image
						src="/svg/object/collision.svg"
						alt=""
						fill
						className="object-contain"
					/>
				</motion.div>
			))}
		</>
	);
}
