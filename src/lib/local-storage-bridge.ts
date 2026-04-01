/**
 * ブラウザ localStorage への読み書きはこのモジュールのみを経由する。
 * キー文字列は export しない。
 */

const LOCAL_KEY_HAS_LOGGED_IN = "pukapuka-space-has-logged-in";
const LOCAL_KEY_LOGIN_VISIT_COUNT = "pukapuka-space-login-visit-count";
const LOCAL_KEY_HAS_VISITED = "pukapuka-space-has-visited";
const LOCAL_KEY_NULLHAND_USER_COLOR = "nullhand_user_color";

/** 実績 ID ごとに `pukapuka-space-achievement-{id}`（キー文字列は export しない） */
const ACHIEVEMENT_KEY_PREFIX = "pukapuka-space-achievement-";

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

function achievementStorageKey(achievementId: string): string {
	return `${ACHIEVEMENT_KEY_PREFIX}${achievementId}`;
}

/**
 * 軌道などの実績を初回解除時のみ `true` を localStorage に保存する。
 * 戻り値が `true` のときだけトースト等を出す。既解除なら `false`。
 * `achievementId` は安定したスラッグ（例: `enemy-of-humanity`）。
 */
export function tryUnlockAchievement(achievementId: string): boolean {
	const s = getLocalStorage();
	if (!s) return false;
	const key = achievementStorageKey(achievementId);
	if (s.getItem(key) === "true") {
		return false;
	}
	s.setItem(key, "true");
	return true;
}

/** 実績が既に解除済みか（読み取りのみ） */
export function isAchievementUnlocked(achievementId: string): boolean {
	const s = getLocalStorage();
	if (!s) return false;
	return s.getItem(achievementStorageKey(achievementId)) === "true";
}
