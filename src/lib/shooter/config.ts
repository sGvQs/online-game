/**
 * 射撃システムの共通設定定数。
 * HOME の home-shooter-config.ts と同じ値を保つ（並列実装）。
 */

export const SHOOTER_BULLET_W_PX = 6;
export const SHOOTER_BULLET_H_PX = 110; // 22 * 5
export const SHOOTER_BULLET_SPEED_PX_S = 4000; // pixels/s
export const SHOOTER_BULLET_INITIAL_SCALE = 1.5;
export const SHOOTER_BULLET_CLASS = "bg-brand-400";

export const SHOOTER_AMMO_MAX = 35;
export const SHOOTER_AMMO_ACTIVE_CLASS = "bg-brand-300";
export const SHOOTER_AMMO_INACTIVE_CLASS = "bg-white/15";

export const SHOOTER_SE = {
	shoot: "/se/shooting-se.mp3",
	cannotShoot: "/se/cannot-shoot-se.mp3",
	reload: "/se/reload-se.mp3",
	hit: "/se/star-damage-se.mp3",
} as const;
