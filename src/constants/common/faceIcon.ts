import { FaceIcon } from "@prisma/client";

/**
 * FaceIcon enum と SVG パスのマッピング
 * public/svg/face/ 配下のファイルに対応
 */
export const FACE_ICON_PATHS: Record<FaceIcon, string> = {
	[FaceIcon.BOY_FACE]: "/svg/face/boy-face.svg",
	[FaceIcon.LADY_FACE]: "/svg/face/lady-face.svg",
	[FaceIcon.GRANPA_FACE]: "/svg/face/granpa-face.svg",
	[FaceIcon.WHITE_FACE]: "/svg/face/white-face.svg",
	[FaceIcon.BLACK_FACE]: "/svg/face/black-face.svg",
	[FaceIcon.BROWN_FACE]: "/svg/face/brown-face.svg",
	[FaceIcon.BUG_FACE]: "/svg/face/bug-face.svg",
};

/** デフォルトの顔アイコン（新規ユーザー用） */
export const DEFAULT_FACE_ICON = FaceIcon.BOY_FACE;

/** 顔アイコン一覧（設定画面の選択肢用） */
export const FACE_ICON_OPTIONS: { value: FaceIcon; label: string }[] = [
	{ value: FaceIcon.BOY_FACE, label: "少年" },
	{ value: FaceIcon.LADY_FACE, label: "女性" },
	{ value: FaceIcon.GRANPA_FACE, label: "おじいさん" },
	{ value: FaceIcon.WHITE_FACE, label: "白" },
	{ value: FaceIcon.BLACK_FACE, label: "黒" },
	{ value: FaceIcon.BROWN_FACE, label: "茶色" },
	{ value: FaceIcon.BUG_FACE, label: "虫" },
];

export { FaceIcon };
