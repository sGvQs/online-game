import type { MeteorDifficulty, MeteorBulletType } from "@/types";

export const CLEAR_RATE = 0.8; // 80%以上でクリア

export const MAX_AMMO = 12;

/** 軌道中心の垂直位置（コンテナ高さに対する比率）。HUDを避けてやや上寄せ */
/** 軌道・星・恐竜の垂直中心位置（コンテナ高さに対する比率）。小さくするほど上に移動 */
export const ORBIT_CENTER_Y_RATIO = 0.32;

/**
 * 軌道トラック定義。全フィールド必須。
 * - rx / ry        : 楕円半径（コンテナ幅に対する比率）
 * - tilt            : 楕円の傾き（ラジアン）。例: -Math.PI/6 = -30°（右上→左下）
 * - spawnAngle      : 出発角度（ラジアン）
 * - collisionAngles : 執着地点の角度配列（ラジアン）。隕石スポーン時に1つランダム選択。将来は各地点に恐竜を配置予定
 * - speedMultiplier : 難易度 orbitDurationMs に対する速度倍率（2.0=2倍速）
 * - minScale       : 奥（depth=-1）にいるときの表示スケール
 * - maxScale       : 手前（depth=+1）にいるときの表示スケール
 *
 * 配列なので同サイズ・別角度・別傾きのトラックも自由に追加できる。
 * インデックスが MeteorOrbitTrack（number）になる。
 */
export interface OrbitTrackConfig {
	rx: number;
	ry: number;
	/** 楕円の傾き（ラジアン）。正=時計回り、負=反時計回り */
	tilt: number;
	spawnAngle: number;
	/** 執着地点の角度配列。隕石スポーン時に1つランダム選択。将来は各地点に恐竜を配置 */
	collisionAngles: number[];
	speedMultiplier: number;
	minScale: number;
	maxScale: number;
	/** 楕円中心の水平オフセット（コンテナ幅比）。正=右、負=左 */
	offsetX: number;
	/** 楕円中心の垂直オフセット（コンテナ高さ比）。正=下、負=上 */
	offsetY: number;
}

// rx: 0.20〜0.58 を 6 本均等配置（ステップ ≈ 0.076）
// ry / maxScale も線形補間
export const ORBIT_TRACKS: OrbitTrackConfig[] = [
	{ rx: 0.28, ry: 0.042, tilt: -Math.PI / 6, spawnAngle: -Math.PI / 2, collisionAngles: [Math.PI * 4 / 3], speedMultiplier: 0.2, minScale: 0.01, maxScale: 0.4, offsetX: 0, offsetY: 0.03 },
	{ rx: 0.35, ry: 0.057, tilt: -Math.PI / 6, spawnAngle: -Math.PI / 2, collisionAngles: [Math.PI * 4 / 3], speedMultiplier: 0.22, minScale: 0.01, maxScale: 0.8, offsetX: 0, offsetY: 0.06 },
	{ rx: 0.43, ry: 0.071, tilt: -Math.PI / 6, spawnAngle: -Math.PI / 2, collisionAngles: [Math.PI * 4 / 3], speedMultiplier: 0.24, minScale: 0.01, maxScale: 1.6, offsetX: 0, offsetY: 0.09 },
	{ rx: 0.50, ry: 0.086, tilt: -Math.PI / 6, spawnAngle: -Math.PI / 2, collisionAngles: [Math.PI * 4 / 3], speedMultiplier: 0.26, minScale: 0.01, maxScale: 3.2, offsetX: 0, offsetY: 0.12 },
	{ rx: 0.58, ry: 0.100, tilt: -Math.PI / 6, spawnAngle: -Math.PI / 2, collisionAngles: [Math.PI * 4 / 3], speedMultiplier: 0.28, minScale: 0.01, maxScale: 6.4, offsetX: 0, offsetY: 0.15 },
];

/** 弾と隕石のグロー色 */
export const GLOW_COLORS: Record<MeteorBulletType, string> = {
	A: "#ff4444",  // 赤
	B: "#4488ff",  // 青
	C: "#ffcc00",  // 黄
};

export interface DifficultyConfig {
	totalSpawnCount: number;
	spawnIntervalMs: number;
	meteorHp: number;
	orbitDurationMs: number;
	pointsOnClear: number;
}

export const DIFFICULTY_CONFIG: Record<MeteorDifficulty, DifficultyConfig> = {
	EASY: {
		totalSpawnCount: 50,
		spawnIntervalMs: 1500,
		meteorHp: 8,
		orbitDurationMs: 7000,
		pointsOnClear: 1,
	},
	NORMAL: {
		totalSpawnCount: 100,
		spawnIntervalMs: 1000,
		meteorHp: 8,
		orbitDurationMs: 6000,
		pointsOnClear: 2,
	},
	HARD: {
		totalSpawnCount: 300,
		spawnIntervalMs: 500,
		meteorHp: 15,
		orbitDurationMs: 5000,
		pointsOnClear: 5,
	},
};

/** 一致時ダメージ */
export const DAMAGE_MATCH = 25;
/** 不一致時ダメージ */
export const DAMAGE_MISMATCH = 1;

/** 弾の有効射程（カーソルから隕石中心までの最大距離 px） */
export const BULLET_HIT_RADIUS = 80;

/** Y方向のオフセット最大値（px） */
export const MAX_Y_OFFSET = 28;

/** ゲーム終了後の待機時間（ms） */
export const GAME_END_DELAY_MS = 3000;
