import {
	SESSION_KEY_HAS_LOGGED_IN,
	SESSION_KEY_LOGIN_VISIT_COUNT,
} from "@/constants/common/storage";

function getSessionStorage(): Storage | null {
	if (typeof window === "undefined") return null;
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

/** ログイン済みセッション（ログインページ文言切り替え用） */
export function getHasLoggedInSession(): boolean {
	const s = getSessionStorage();
	if (!s) return false;
	return s.getItem(SESSION_KEY_HAS_LOGGED_IN) === "true";
}

/** ログインページ訪問回数（文言の温度感切り替え用） */
export function getLoginVisitCount(): number {
	const s = getSessionStorage();
	if (!s) return 0;
	const raw = s.getItem(SESSION_KEY_LOGIN_VISIT_COUNT) ?? "0";
	const n = Number.parseInt(raw, 10);
	return Number.isFinite(n) ? n : 0;
}

export function setLoginVisitCount(next: number): void {
	const s = getSessionStorage();
	if (!s) return;
	s.setItem(SESSION_KEY_LOGIN_VISIT_COUNT, String(next));
}

/** ログイン済みフラグを保存（未使用でも API はここに集約） */
export function setHasLoggedInSession(value: boolean): void {
	const s = getSessionStorage();
	if (!s) return;
	if (value) {
		s.setItem(SESSION_KEY_HAS_LOGGED_IN, "true");
	} else {
		s.removeItem(SESSION_KEY_HAS_LOGGED_IN);
	}
}
