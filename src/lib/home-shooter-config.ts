/**
 * HOME画面の射撃（キー / クリック）の色・弾速・火力などを一元管理する。
 */

export type HomeShooterModeKey = "keyboard" | "click";

/** 凡例で並べる順序 */
export const HOME_SHOOTER_LEGEND_ORDER: readonly HomeShooterModeKey[] = [
	"keyboard",
	"click",
] as const;

export const HOME_SHOOTER_SE = {
	shoot: "/se/shooting-se.mp3",
	cannotShoot: "/se/cannot-shoot-se.mp3",
	reload: "/se/reload-se.mp3",
} as const;

/** HOME下部HUDの弾数（段数）表示で使うアクティブ色 */
export const HOME_AMMO_BAR_ACTIVE_CLASSNAME =
	"bg-brand-300 shadow-[0_0_4px_rgba(239,68,68,0.55)]";

const BALL_W_PX = 6;
const BALL_H_BASE_PX = 22;
const BALL_HEIGHT_LONG_PX = BALL_H_BASE_PX * 5;

export type HomeShooterModeConfig = {
	damage: number;
	durationSec: number;
	ball: {
		widthPx: number;
		heightPx: number;
		initialScale: number;
		ease: "linear";
	};
	bulletClassName: string;
	legendChipClassName: string;
	legendInput: "keyboard" | "mouse";
	ammo:
		| { consumes: true; cost: number }
		| { consumes: false };
	a11yBulletLabel: string;
};

export const HOME_SHOOTER_MODES = {
	keyboard: {
		damage: 1,
		/** 弾がターゲットに到達するまでの時間（秒） */
		durationSec: 0.1,
		ball: {
			widthPx: BALL_W_PX,
			heightPx: BALL_HEIGHT_LONG_PX,
			initialScale: 2.5,
			ease: "linear" as const,
		},
		bulletClassName: "bg-brand-300",
		legendChipClassName:
			"h-1.5 w-5 shrink-0 rounded-full bg-brand-300 shadow-[0_0_4px_rgba(239,68,68,0.6)]",
		legendInput: "keyboard" as const,
		ammo: { consumes: true as const, cost: 1 },
		a11yBulletLabel: "濃い紫の球はキーボード",
	},
	click: {
		damage: 5,
		durationSec: 0.45,
		ball: {
			widthPx: BALL_W_PX,
			heightPx: BALL_HEIGHT_LONG_PX,
			initialScale: 2.5,
			ease: "linear" as const,
		},
		bulletClassName:
			"bg-brand-600 shadow-[0_0_4px_rgba(239,68,68,0.6)]",
		legendChipClassName:
			"h-1.5 w-5 shrink-0 rounded-full bg-brand-600 shadow-[0_0_4px_rgba(239,68,68,0.6)]",
		legendInput: "mouse" as const,
		ammo: { consumes: false as const },
		a11yBulletLabel: "黄色い球はクリック",
	},
} as const satisfies Record<HomeShooterModeKey, HomeShooterModeConfig>;
