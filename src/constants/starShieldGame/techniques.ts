/**
 * StarShieldGame 技の定義
 * 赤い球（散弾）、青い球、黄色いビーム、紫の球、オレンジの球
 */

export type TechniqueId =
	| "red"
	| "blue"
	| "yellow_beam"
	| "purple"
	| "orange"
	| "pink";

export interface TechniqueConfig {
	id: TechniqueId;
	label: string;
	damage: number;
	speed: number;
	color: string;
	/** 1文字で発射する弾数（複数弾の場合） */
	count?: number;
	/** 進行方向への縦オフセット（正規化座標）。負=後方。黄色ビーム用 */
	verticalOffset?: number;
	/** 貫通（当たっても消えない） */
	piercing?: boolean;
	/** ヒット時に隕石を減速させる */
	slowOnHit?: boolean;
	/** 連鎖攻撃（一段。オレンジのみ。範囲・数は gameConfig で制御） */
	chainRadius?: number;
}

export const TECHNIQUES: Record<TechniqueId, TechniqueConfig> = {
	// 赤：　ダメージ ⭐️⭐️, 当てやすさ ⭐️⭐️⭐️⭐️, サポート ⭐️, 必殺技との相性　⭐️, かっこよさ ⭐️⭐️⭐️,
	red: {
		id: "red",
		label: "赤い球",
		damage: 1,
		speed: 1,
		color: "#ef4444",
	},
	// 青：　ダメージ ⭐️, 当てやすさ ⭐️, サポート ⭐️⭐️⭐️⭐️⭐️, 必殺技との相性　⭐️⭐️⭐️, かっこよさ ⭐️,
	blue: {
		id: "blue",
		label: "青い球",
		damage: 1,
		speed: 1,
		color: "#3b82f6",
		slowOnHit: true,
	},
	// ピンク：　ダメージ ⭐️⭐️⭐️⭐️⭐️, 当てやすさ ⭐️, サポート ⭐️, 必殺技との相性　⭐️, かっこよさ ⭐️⭐️⭐️⭐️⭐️,
	pink: {
		id: "pink",
		label: "ピンクの球",
		damage: 0.5,
		speed: 1,
		color: "#ec4899",
		count: 5,
	},
	// 黄色：　ダメージ ⭐️⭐️⭐️⭐️⭐️, 当てやすさ ⭐️⭐️, サポート ⭐️, 必殺技との相性　⭐️, かっこよさ ⭐️⭐️⭐️,
	yellow_beam: {
		id: "yellow_beam",
		label: "黄色いビーム",
		damage: 0.1,
		speed: 1,
		color: "#eab308",
		count: 30,
		verticalOffset: 0.01, // 進行方向に沿って3発オフセット（ビーム状）
	},
	// 紫：　ダメージ ⭐️⭐️, 当てやすさ ⭐️⭐️, サポート ⭐️, 必殺技との相性　⭐️⭐️⭐️⭐️⭐️, かっこよさ ⭐️,
	purple: {
		id: "purple",
		label: "紫の球",
		damage: 1,
		speed: 1,
		color: "#a855f7",
		piercing: true,
	},
	// オレンジ：　ダメージ ⭐️⭐️⭐️⭐️, 当てやすさ ⭐️, サポート ⭐️, 必殺技との相性　⭐️⭐️⭐️⭐️⭐️, かっこよさ ⭐️⭐️,
	orange: {
		id: "orange",
		label: "オレンジの球",
		damage: 1,
		speed: 1,
		color: "#f97316",
		chainRadius: 0.1,
	},
};

export const TECHNIQUE_IDS: TechniqueId[] = [
	"red",
	"blue",
	"yellow_beam",
	"purple",
	"orange",
	"pink",
];

/** 技の特性評価（五角形チャート用。各 1〜5） */
export type TechniqueStats = {
	damage: number;
	hitEase: number;
	support: number;
	specialCombo: number;
	coolness: number;
};

export const TECHNIQUE_STATS: Record<TechniqueId, TechniqueStats> = {
	red: { damage: 2, hitEase: 4, support: 1, specialCombo: 1, coolness: 3 },
	blue: { damage: 1, hitEase: 1, support: 5, specialCombo: 3, coolness: 1 },
	pink: { damage: 5, hitEase: 1, support: 1, specialCombo: 1, coolness: 5 },
	yellow_beam: {
		damage: 5,
		hitEase: 2,
		support: 1,
		specialCombo: 1,
		coolness: 3,
	},
	purple: { damage: 2, hitEase: 2, support: 1, specialCombo: 5, coolness: 1 },
	orange: { damage: 4, hitEase: 1, support: 1, specialCombo: 5, coolness: 2 },
};

/** デフォルト弾の色（red と同色） */
export const DEFAULT_BULLET_COLOR = "#ef4444";
