/** ゲームタイプごとのプレイ可能人数 */
export const GAME_PLAYER_REQUIREMENTS = {
	"error-hunter": { min: 2, max: 8 },
	// TODO: 一時的に2人でもプレイ可能に。元: min: 3
	"null-hand": { min: 2, max: 8 },
	"star-shield": { min: 2, max: 2 },
} as const;

export type GameType = keyof typeof GAME_PLAYER_REQUIREMENTS;

/** 人数表示用の文字列（例: "2〜8人"） */
export function getPlayerRangeLabel(gameType: GameType): string {
	const { min, max } = GAME_PLAYER_REQUIREMENTS[gameType];
	return min === max ? `${min}人` : `${min}〜${max}人`;
}

/** 人数がゲームの要件を満たすか */
export function isPlayerCountValid(gameType: GameType, count: number): boolean {
	const { min, max } = GAME_PLAYER_REQUIREMENTS[gameType];
	return count >= min && count <= max;
}
