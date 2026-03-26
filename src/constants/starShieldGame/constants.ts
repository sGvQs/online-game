/**
 * StarShieldGame 共通定数（フォント・色・アイコン・スタイル・メタデータ）
 */

import type { Difficulty } from "@/types/starShieldGame";
export type { Difficulty } from "@/types/starShieldGame";
export type RoleChoice = "SHOOTER" | "TYPIST";

// ========== フォント ==========
export const FONTS = {
	CHERRY_BOMB: "var(--font-cherry-bomb-one)",
	DOT_GOTHIC: "var(--font-dot-gothic-16)",
	RUBIK_PUDDLES: "var(--font-rubik-puddles)",
} as const;

// ========== 色 ==========
export const COLORS = {
	BRAND: "rgba(129,140,248)",
	BRAND_05: "rgba(129,140,248,0.05)",
	BRAND_06: "rgba(129,140,248,0.06)",
	BRAND_08: "rgba(129,140,248,0.08)",
	BRAND_15: "rgba(129,140,248,0.15)",
	BRAND_18: "rgba(129,140,248,0.18)",
	BRAND_2: "rgba(129,140,248,0.2)",
	BRAND_35: "rgba(129,140,248,0.35)",
	BRAND_4: "rgba(129,140,248,0.4)",
	BRAND_5: "rgba(129,140,248,0.5)",
	BRAND_6: "rgba(129,140,248,0.6)",
	PURPLE: "rgba(192,132,252)",
	PURPLE_05: "rgba(192,132,252,0.05)",
	PURPLE_18: "rgba(192,132,252,0.18)",
	PURPLE_6: "rgba(192,132,252,0.6)",
	PURPLE_7: "rgba(192,132,252,0.7)",
	PURPLE_8: "rgba(192,132,252,0.8)",
	VIOLET_7: "rgba(167,139,250,0.7)",
	GLASS_BG: "rgba(30,41,59,0.4)",
	GLASS_BORDER: "rgba(129,140,248,0.2)",
	WHITE_03: "rgba(255,255,255,0.03)",
	WHITE_08: "rgba(255,255,255,0.08)",
	WHITE_15: "rgba(255,255,255,0.15)",
	WHITE_2: "rgba(255,255,255,0.2)",
	WHITE_25: "rgba(255,255,255,0.25)",
	WHITE_35: "rgba(255,255,255,0.35)",
	WHITE_5: "rgba(255,255,255,0.5)",
	SLATE_7: "rgba(203,213,225,0.7)",
} as const;

// ========== アイコン ==========
export const ICONS = {
	DINO: "/svg/charactor/annoying-dinosaur.svg",
	SHOOTER: "/svg/object/target-circle.svg",
	TYPIST: "/svg/object/keyboard.svg",
	FIRE: "/svg/object/collision.svg",
	METOR: "/svg/object/metor.svg",
	TARGET_CIRCLE: "/svg/object/target-circle.svg",
	START: "/svg/starShield/start.svg",
	NOT_START: "/svg/starShield/not-start.svg",
	READY: "/svg/starShield/ready.svg",
	NOT_READY: "/svg/starShield/not-ready.svg",
	EXIT: "/svg/starShield/exit.svg",
	SKILL: "/svg/starShield/skill.svg",
} as const;

// ========== 恐竜・球アニメ ==========
/** 口から画面右上へ飛ぶ角度（rad）0=右、π/2=上 */
export const BALL_ANGLE = Math.PI / 4;
/** 画面外まで飛ばす距離（px） */
export const BALL_DISTANCE = 2000;
export const BALL_SPAWN_DELAY_MIN = 1500;
export const BALL_SPAWN_DELAY_MAX = 2500;
export const BALL_SIZE = 12;

/** 恐竜の位置（タイトル球スポーン・ゲーム内恐竜で共通） */
export const DINO_SPAWN = { left: 10, bottom: 10 } as const;
/** 弾・球の色 */
export const BULLET_COLOR = "#ef4444";

// ========== スタイル ==========
export const GLASS_CARD_STYLE = {
	background: COLORS.GLASS_BG,
	border: `1px solid ${COLORS.GLASS_BORDER}`,
} as const;

export const AURORA_GRADIENT_DEFAULT =
	"radial-gradient(ellipse at 50% 60%, rgba(192,132,252,0.7) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)";

export const AURORA_GRADIENT_TYPIST =
	"radial-gradient(ellipse at 50% 60%, rgba(168,85,247,0.6) 0%, rgba(99,102,241,0.4) 40%, transparent 70%)";

// ========== 星（ProtectedStar / TypistStar 用） ==========
export const STAR_GRADIENT_STOPS = [
	{ offset: "0%", color: "rgb(102,51,0)" },
	{ offset: "50%", color: "rgb(153,76,0)" },
	{ offset: "85%", color: "rgb(255,153,51)" },
	{ offset: "100%", color: "rgb(255,204,153)" },
] as const;

export const STAR_GLOW_FILTER = "drop-shadow(0 0 50px rgba(180,150,90,0.5))";

// ========== 難易度・役割メタ ==========
export const DIFFICULTIES: Difficulty[] = [
	"EASY",
	"NORMAL",
	"HARD",
	"HELL",
	"ABYSS",
];

export const DIFFICULTY_META: Record<
	Difficulty,
	{
		label: string;
		rate: string;
		bg: string;
		border: string;
		text: string;
		glow: string;
		emoji: string;
	}
> = {
	EASY: {
		label: "かんたん",
		rate: "+1pt",
		emoji: "🌿",
		bg: "rgba(134,239,172,0.12)",
		border: "rgba(134,239,172,0.5)",
		text: "#86efac",
		glow: "0 0 12px rgba(134,239,172,0.4)",
	},
	NORMAL: {
		label: "ふつう",
		rate: "+2pt",
		emoji: "🌟",
		bg: "rgba(253,224,71,0.12)",
		border: "rgba(253,224,71,0.5)",
		text: "#fde047",
		glow: "0 0 12px rgba(253,224,71,0.4)",
	},
	HARD: {
		label: "むずかしい",
		rate: "+3pt",
		emoji: "🔥",
		bg: "rgba(248,113,113,0.12)",
		border: "rgba(248,113,113,0.5)",
		text: "#f87171",
		glow: "0 0 12px rgba(248,113,113,0.4)",
	},
	HELL: {
		label: "じこく",
		rate: "+4pt",
		emoji: "💀",
		bg: "rgba(139,92,246,0.12)",
		border: "rgba(139,92,246,0.6)",
		text: "#8b5cf6",
		glow: "0 0 12px rgba(139,92,246,0.4)",
	},
	ABYSS: {
		label: "しんえん",
		rate: "+5pt/波",
		emoji: "🌑",
		bg: "rgba(15,10,30,0.6)",
		border: "rgba(100,50,200,0.7)",
		text: "#c084fc",
		glow: "0 0 18px rgba(100,50,200,0.6)",
	},
};

export const ROLE_META: Record<
	RoleChoice,
	{
		iconSrc: string;
		label: string;
		description: string;
		detail: string;
		bg: string;
		border: string;
		text: string;
		glow: string;
	}
> = {
	SHOOTER: {
		iconSrc: ICONS.SHOOTER,
		label: "シューター",
		description: "カーソルを動かして、隕石を狙う。",
		detail: "たいぴすとが打った文字のぶんだけ、ねらった隕石に弾が飛ぶよ。",
		bg: COLORS.BRAND_08,
		border: COLORS.BRAND_35,
		text: "#818cf8",
		glow: "0 0 14px rgba(129,140,248,0.3)",
	},
	TYPIST: {
		iconSrc: ICONS.TYPIST,
		label: "タイピスト",
		description: "名もなき恐竜のセリフをタイピング",
		detail: "1文字うつごとに1発、シューターの狙った隕石に弾がとぶよ。",
		bg: "rgba(16,185,129,0.08)",
		border: "rgba(16,185,129,0.35)",
		text: "#34d399",
		glow: "0 0 14px rgba(16,185,129,0.3)",
	},
};
