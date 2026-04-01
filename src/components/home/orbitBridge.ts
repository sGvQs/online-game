/**
 * LogoWithOrbit と HomeCursor の間で当たり判定に使う情報を共有するブリッジ。
 * React state を使わず module-level の mutable object で管理（RAF から毎フレーム更新）。
 */

export type OrbitScreenShakeStrength = "small" | "medium" | "large";

export const orbitBridge = {
	/** 星の画面上の座標 (clientX/Y) - LogoWithOrbit の RAF が毎フレーム更新 */
	clientX: -1000,
	clientY: -1000,
	/** 当たり判定の半径 (px)。LogoWithOrbit の RAF が毎フレーム更新（未マウント時の仮値） */
	hitRadius: 40,
	/** 命中時に呼ぶコールバック - LogoWithOrbit がセット */
	triggerHit: null as ((damage: number) => void) | null,

	/** 星破壊後の隕石フェーズ中は true（星への命中を無効化） */
	isMeteorPhase: false,
	/**
	 * 隕石に当たったら true（当たった隕石は除去済み）。
	 * 引数は document の client 座標。
	 */
	tryHitMeteor: null as
		| ((
				clientX: number,
				clientY: number,
				bulletRadiusPx: number,
		  ) => boolean)
		| null,
	/** 画面揺れ（隕石破壊 small / 星破壊 medium / 脅威激突 large）。省略時は large */
	onScreenShake: null as
		| ((strength?: OrbitScreenShakeStrength) => void)
		| null,
};
