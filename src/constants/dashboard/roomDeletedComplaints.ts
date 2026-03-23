/**
 * ルーム削除時のメッセージ
 * 修正方針：
 * - ひらがなとカタカナのみ
 * - 相手を分析しない
 * - ただ事実を述べる
 * - 断片的
 */

const COMPLAINTS = [
	"へやが、なくなった。",
	"あのへや。",
	"だれも、こなかったんだ。",
	"かたづけておいた。",
	"ぼくが。",
	"そういうときもある。",
	"つくってた。",
	"きみが。",
	"もう、いいのか。",
	"また、つくる？",
	"へや。",
	"ぷかぷか。",
	"あ。",
];

export function getRandomComplaintMessage(): string {
	return COMPLAINTS[Math.floor(Math.random() * COMPLAINTS.length)]!;
}
