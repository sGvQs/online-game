/** BGM/SE のベース音量にマスター音量を掛けた実効値（0〜1） */
export function effectiveSeVolume(base: number, masterVolume: number): number {
	return Math.min(1, Math.max(0, base * masterVolume));
}
