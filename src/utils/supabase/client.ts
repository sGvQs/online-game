import { createBrowserClient } from '@supabase/ssr'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
    // コンポーネントが再レンダリングされても同じインスタンスを返す
    if (!client) {
        client = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                realtime: {
                    worker: true,
                    heartbeatCallback: (status) => {
                        if (status === 'disconnected' && client) {
                            client.realtime.connect()
                        }
                    },
                },
            }
        )

        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (document.visibilityState === 'visible' && client) {
                    client.realtime.connect()
                }
            })
        }
    }
    return client
}
