/**
 * スクリーンシェイクのプリセット定義。
 * HOME の home-orbit-screen-shake.ts と同じ値（共有参照可能な純粋な定数）。
 *
 * small  : 隕石を弾で破壊したとき
 * medium : 大物撃破・星破壊など
 * large  : 画面全体を覆うような大ダメージ
 */
export type ScreenShakeStrength = "small" | "medium" | "large";

export const SCREEN_SHAKE_PRESETS = {
	small: {
		x: [0, -4, 4, -3, 3, 0],
		y: [0, 3, -3, -2, 2, 0],
		durationSec: 0.4,
	},
	medium: {
		x: [0, -7, 7, -5, 5, -3, 3, 0],
		y: [0, 6, -6, -4, 4, 3, -3, 0],
		durationSec: 0.48,
	},
	large: {
		x: [0, -11, 11, -8, 8, -5, 5, 0],
		y: [0, 9, -9, -7, 7, 5, -5, 0],
		durationSec: 0.58,
	},
} as const satisfies Record<
	ScreenShakeStrength,
	{ x: number[]; y: number[]; durationSec: number }
>;
