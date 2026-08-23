/** 恐竜がタイピングイベントで入力する部屋名候補（15文字以内） */
export const DINOSAUR_TYPING_ROOM_NAMES = [
	"むかし、にんげんがいた",
	"windows95くれた",
	"あそびかた、おそわった",
	"ルール、あいまいだった",
	"なまえ、わすれた",
	"かおは、たぶんおぼえてる",
	"こなくなった",
	"パソコン、ここにある",
	"たまにとまる",
	"でもうごく",
	"あのひともあいまい",
	"てきじゃなかった",
	"ともだちでもなかった",
	"なんかある",
	"まあいいか",
	"ぷかぷかしてる",
	"おもいで、ばらばら",
	"ノイズ、たぶん",
	"あ、またわすれた",
	"いし、かたい",
	"さっきころんだ",
	"キー、ひかってる",
	"なんのおと？",
	"ぷかぷか",
	"ういてる",
];

export function getRandomDinosaurRoomName(): string {
	return DINOSAUR_TYPING_ROOM_NAMES[
		Math.floor(Math.random() * DINOSAUR_TYPING_ROOM_NAMES.length)
	]!;
}
