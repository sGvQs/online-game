/**
 * ホーム軌道の画面揺れ（HomeCursor の framer 用）。数値はここで調整。
 * small: 隕石を弾で破壊 / medium: 星破壊 / large: 脅威激突（画面覆い）
 */
export const HOME_ORBIT_SCREEN_SHAKE = {
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
} as const;
