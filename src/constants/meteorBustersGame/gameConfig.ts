import type { MeteorDifficulty, MeteorBulletType } from "@/types";

export const CLEAR_RATE = 0.8; // 80%以上でクリア

export const MAX_AMMO = 12;

/** スポーン開始角度（ラジアン）: 右上付近に登場 */
export const SPAWN_ANGLE = -Math.PI / 6; // -30°
/** 衝突判定角度（ラジアン）: 左上から星の裏に回り込んだ地点 */
export const COLLISION_ANGLE = (7 * Math.PI) / 6; // 210°

/** 軌道楕円の水平半径（コンテナ幅に対する比率） */
export const ORBIT_RADIUS_X = 0.38;
/** 軌道楕円の垂直半径（コンテナ高さに対する比率） */
export const ORBIT_RADIUS_Y = 0.2;

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
		totalSpawnCount: 15,
		spawnIntervalMs: 4000,
		meteorHp: 75,
		orbitDurationMs: 8000,
		pointsOnClear: 3,
	},
	NORMAL: {
		totalSpawnCount: 20,
		spawnIntervalMs: 3000,
		meteorHp: 100,
		orbitDurationMs: 6000,
		pointsOnClear: 5,
	},
	HARD: {
		totalSpawnCount: 30,
		spawnIntervalMs: 2000,
		meteorHp: 150,
		orbitDurationMs: 5000,
		pointsOnClear: 8,
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
