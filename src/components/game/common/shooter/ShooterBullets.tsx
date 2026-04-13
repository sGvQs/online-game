"use client";

import { motion } from "framer-motion";
import {
	SHOOTER_BULLET_W_PX,
	SHOOTER_BULLET_H_PX,
	SHOOTER_BULLET_INITIAL_SCALE,
} from "@/lib/shooter/config";
import type { BulletAnim } from "@/types";

interface ShooterBulletsProps {
	bullets: BulletAnim[];
}

/**
 * HOME 緊急モードと同じ弾ビームアニメーション。
 * BulletAnim.color で弾種ごとの色を表現する。
 * toX/toY（カーソル位置）で scale→0 になり通り過ぎない。
 */
export function ShooterBullets({ bullets }: ShooterBulletsProps) {
	return (
		<>
			{bullets.map((b) => (
				<motion.div
					key={b.id}
					className="absolute top-0 left-0 pointer-events-none z-[45] rounded-full"
					style={{
						width: SHOOTER_BULLET_W_PX,
						height: SHOOTER_BULLET_H_PX,
						rotate: b.angle,
						backgroundColor: b.color,
						boxShadow: `0 0 6px ${b.color}, 0 0 12px ${b.color}88`,
					}}
					initial={{
						x: b.fromX - SHOOTER_BULLET_W_PX / 2,
						y: b.fromY - SHOOTER_BULLET_H_PX / 2,
						scale: SHOOTER_BULLET_INITIAL_SCALE,
					}}
					animate={{
						x: b.toX - SHOOTER_BULLET_W_PX / 2,
						y: b.toY - SHOOTER_BULLET_H_PX / 2,
						scale: 0,
					}}
					transition={{ duration: b.durationSec, ease: "linear" }}
				/>
			))}
		</>
	);
}
