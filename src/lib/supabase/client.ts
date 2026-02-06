import { createBrowserClient } from '@supabase/ssr'

/**
 * Supabaseブラウザクライアント（シングルトン）
 * 
 * パフォーマンス最適化:
 * - 一度作成されたクライアントインスタンスをキャッシュ
 * - 複数のコンポーネントで同じインスタンスを共有
 * - WebSocket接続の多重化を防止
 */
let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    if (!client) {
        client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
    }
    return client
}