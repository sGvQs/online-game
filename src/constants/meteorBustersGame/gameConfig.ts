import type { MeteorDifficulty, MeteorBulletType } from "@/types";

export const CLEAR_RATE = 0.8; // 80%以上でクリア

export const MAX_AMMO = 12;

/** 軌道楕円の傾き（ラジアン）。HOMEの星軌道と同じ -30° */
export const ORBIT_TILT = -Math.PI / 6;
/** 軌道中心の垂直位置（コンテナ高さに対する比率）。HUDを避けてやや上寄せ */
export const ORBIT_CENTER_Y_RATIO = 0.42;

/**
 * 軌道トラック定義。
 * - rx / ry: 楕円半径（コンテナ幅に対する比率）
 * - spawnAngle: 出発角度（ラジアン）
 * - collisionAngle: 終着角度（ラジアン）
 * - speedMultiplier: 難易度 orbitDurationMs に対する速度倍率。2.0=2倍速、省略時=1.0
 *
 * 配列なので同サイズ・別角度のトラックも自由に追加できる。
 * インデックスが MeteorOrbitTrack（number）になる。
 */
export interface OrbitTrackConfig {
	rx: number;
	ry: number;
	spawnAngle: number;
	collisionAngle: number;
	speedMultiplier: number;
}

export const ORBIT_TRACKS: OrbitTrackConfig[] = [
	{ rx: 0.20, ry: 0.028, spawnAngle: -Math.PI / 6, collisionAngle: Math.PI * 7 / 6, speedMultiplier: 1.0 },
	{ rx: 0.24, ry: 0.034, spawnAngle: -Math.PI / 6, collisionAngle: Math.PI * 7 / 6, speedMultiplier: 1.0 },
	{ rx: 0.28, ry: 0.039, spawnAngle: -Math.PI / 6, collisionAngle: Math.PI * 7 / 6, speedMultiplier: 1.0 },
	{ rx: 0.38, ry: 0.050, spawnAngle: -Math.PI / 6, collisionAngle: Math.PI * 3 / 2, speedMultiplier: 1.0 },
	{ rx: 0.75, ry: 0.100, spawnAngle: -Math.PI / 6, collisionAngle: Math.PI * 3 / 2, speedMultiplier: 1.0 },
	{ rx: 1.10, ry: 0.154, spawnAngle: -Math.PI / 6, collisionAngle: Math.PI * 3 / 2, speedMultiplier: 0.6 },
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
