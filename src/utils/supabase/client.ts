import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
	if (typeof window === "undefined") {
		// サーバー環境: キャッシュせず、都度新規作成（リクエスト間で共有しない）
		return createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				realtime: {
					worker: true,
					heartbeatCallback: () => {},
				},
			},
		);
	}

	// ブラウザ環境: シングルトン（コンポーネントが再レンダリングされても同じインスタンスを返す）
	if (!client) {
		client = createBrowserClient(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
			{
				realtime: {
					worker: true,
					heartbeatCallback: (status) => {
						if (status === "disconnected" && client) {
							client.realtime.connect();
						}
					},
				},
			},
		);

		if (typeof document !== "undefined") {
			document.addEventListener("visibilitychange", () => {
				if (document.visibilityState === "visible" && client) {
					client.realtime.connect();
				}
			});
		}
	}
	return client;
}
