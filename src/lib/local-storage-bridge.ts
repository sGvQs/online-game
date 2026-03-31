/**
 * ブラウザ localStorage への読み書きはこのモジュールのみを経由する。
 * キー文字列は export しない。
 */

const LOCAL_KEY_HAS_LOGGED_IN = "zero-g-has-logged-in";
const LOCAL_KEY_LOGIN_VISIT_COUNT = "zero-g-login-visit-count";
const LOCAL_KEY_HAS_VISITED = "zero-g-has-visited";
const LOCAL_KEY_NULLHAND_USER_COLOR = "nullhand_user_color";
const LOCAL_KEY_ACHIEVEMENT_ENEMY_OF_HUMANITY =
	"zero-g-achievement-enemy-of-humanity";

function getLocalStorage(): Storage | null {
	if (typeof window === "undefined") return null;
	try {
		return window.localStorage;
	} catch {
		return null;
	}
}

/** ログイン済みセッション（ログインページ文言切り替え用） */
export function getHasLoggedInSession(): boolean {
	const s = getLocalStorage();
	if (!s) return false;
	return s.getItem(LOCAL_KEY_HAS_LOGGED_IN) === "true";
}

/** ログインページ訪問回数（文言の温度感切り替え用） */
export function getLoginVisitCount(): number {
	const s = getLocalStorage();
	if (!s) return 0;
	const raw = s.getItem(LOCAL_KEY_LOGIN_VISIT_COUNT) ?? "0";
	const n = Number.parseInt(raw, 10);
	return Number.isFinite(n) ? n : 0;
}

export function setLoginVisitCount(next: number): void {
	const s = getLocalStorage();
	if (!s) return;
	s.setItem(LOCAL_KEY_LOGIN_VISIT_COUNT, String(next));
}

export function setHasLoggedInSession(value: boolean): void {
	const s = getLocalStorage();
	if (!s) return;
	if (value) {
		s.setItem(LOCAL_KEY_HAS_LOGGED_IN, "true");
	} else {
		s.removeItem(LOCAL_KEY_HAS_LOGGED_IN);
	}
}

export function getHasVisitedSite(): boolean {
	const s = getLocalStorage();
	if (!s) return false;
	return s.getItem(LOCAL_KEY_HAS_VISITED) === "true";
}

export function setHasVisitedSite(value: boolean): void {
	const s = getLocalStorage();
	if (!s) return;
	if (value) {
		s.setItem(LOCAL_KEY_HAS_VISITED, "true");
	} else {
		s.removeItem(LOCAL_KEY_HAS_VISITED);
	}
}

export function getNullHandUserColor(): string | null {
	const s = getLocalStorage();
	if (!s) return null;
	return s.getItem(LOCAL_KEY_NULLHAND_USER_COLOR);
}

export function setNullHandUserColor(color: string): void {
	const s = getLocalStorage();
	if (!s) return;
	s.setItem(LOCAL_KEY_NULLHAND_USER_COLOR, color);
}

/** 初回解除時のみ `true`（スナックバー表示用）。既に解除済みなら `false` */
export function tryUnlockEnemyOfHumanityAchievement(): boolean { 
	const s = getLocalStorage();
	if (!s) return false;
	if (s.getItem(LOCAL_KEY_ACHIEVEMENT_ENEMY_OF_HUMANITY) === "true") {
		return false;
	}
	s.setItem(LOCAL_KEY_ACHIEVEMENT_ENEMY_OF_HUMANITY, "true");
	return true;
}
