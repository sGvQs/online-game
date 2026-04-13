/**
 * 弾道計算ユーティリティ。
 * HOME の緊急モードと Meteor Busters で共有する純関数群。
 */

import { SHOOTER_BULLET_SPEED_PX_S } from "./config";
import type { BulletAnim } from "@/types";

/**
 * 点 (fromX, fromY) からカーソル方向への直線が
 * コンテナ境界と最初に交わる点を返す。
 * ※ makeBulletAnims では使用しない（カーソルが終点）。
 *    方向確認など別途利用したい場合向けに export しておく。
 */
export function calcExitPoint(
	fromX: number,
	fromY: number,
	targetX: number,
	targetY: number,
	containerWidth: number,
	containerHeight: number,
): { x: number; y: number } {
	const dx = targetX - fromX;
	const dy = targetY - fromY;

	let tMin = Infinity;

	if (dx > 0) tMin = Math.min(tMin, (containerWidth - fromX) / dx);
	if (dx < 0) tMin = Math.min(tMin, -fromX / dx);
	if (dy < 0) tMin = Math.min(tMin, -fromY / dy);
	if (dy > 0) tMin = Math.min(tMin, (containerHeight - fromY) / dy);

	if (!isFinite(tMin) || tMin <= 0) return { x: targetX, y: targetY };

	return {
		x: fromX + dx * tMin,
		y: fromY + dy * tMin,
	};
}

/**
 * 左下・右下コーナーからカーソル位置へ向かう弾アニメーション 2 本を生成する。
 * HOME の緊急モードと同じ挙動:
 *   - toX/toY = カーソル位置（通り過ぎない）
 *   - scale 1.5 → 0（カーソル到達時に消滅）
 *   - 弾種に応じた color を持つ
 */
export function makeBulletAnims(
	cursorX: number,
	cursorY: number,
	containerWidth: number,
	containerHeight: number,
	idPrefix: string,
	color: string,
): BulletAnim[] {
	const corners = [
		{ fromX: 0, fromY: containerHeight },
		{ fromX: containerWidth, fromY: containerHeight },
	] as const;

	return corners.map(({ fromX, fromY }, i) => {
		const dx = cursorX - fromX;
		const dy = cursorY - fromY;
		const dist = Math.hypot(dx, dy);
		const durationSec = Math.max(0.12, dist / SHOOTER_BULLET_SPEED_PX_S);
		const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;

		return {
			id: `${idPrefix}_${i}`,
			fromX,
			fromY,
			toX: cursorX,
			toY: cursorY,
			angle,
			durationSec,
			color,
		} satisfies BulletAnim;
	});
}
