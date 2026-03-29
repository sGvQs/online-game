/**
 * LogoWithOrbit と HomeCursor の間で当たり判定に使う情報を共有するブリッジ。
 * React state を使わず module-level の mutable object で管理（RAF から毎フレーム更新）。
 */
export const orbitBridge = {
	/** 星の画面上の座標 (clientX/Y) - LogoWithOrbit の RAF が毎フレーム更新 */
	clientX: -1000,
	clientY: -1000,
	/** 当たり判定の半径 (px) */
	hitRadius: 32,
	/** 命中時に呼ぶコールバック - LogoWithOrbit がセット */
	triggerHit: null as (() => void) | null,
};
