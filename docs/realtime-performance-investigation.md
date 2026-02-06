# リアルタイム通信パフォーマンス調査レポート

## 調査日
2026-02-06

## 概要
リアルタイム通信（Supabase Realtime）を使用しているコンポーネントのパフォーマンス調査結果です。

---

## 調査対象コンポーネント

| コンポーネント | 監視テーブル | イベント | フィルター |
|--------------|------------|---------|-----------|
| `RoomList.tsx` | `rooms` | `*` | なし |
| `RoomPageClient.tsx` | `rooms` | `*` | なし |
| `GamePageClient.tsx` | `rooms` | `UPDATE` | なし |
| `MemberList/index.tsx` | `room_users` | `*` | なし |
| `UserProfile.tsx` | `users` | `UPDATE` | `id=eq.${initialData.id}` |

---

## 🔴 重大な問題点

### 1. Supabaseクライアントのレンダリングごとの再作成

**問題箇所**: 全コンポーネント

```tsx
// ❌ 問題: レンダリングごとに新しいクライアントインスタンスが作成される
export function RoomList() {
    const supabase = createClient()  // 毎回新規インスタンス
    // ...
}
```

**影響**:
- 各レンダリングで新しいWebSocket接続が試行される可能性
- メモリリーク
- 不要なガベージコレクション

**解決策**:
```tsx
// ✅ 解決: useMemoでクライアントをキャッシュ
import { useMemo } from 'react'

export function RoomList() {
    const supabase = useMemo(() => createClient(), [])
    // ...
}

// または、シングルトンパターンを使用
// lib/supabase/client.ts
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
```

---

### 2. useEffectの依存配列に`supabase`を含む無限ループリスク

**問題箇所**: 全コンポーネント

```tsx
// ❌ 問題: supabaseが依存配列にあるとループの可能性
useEffect(() => {
    const channel = supabase.channel(...)
    // ...
}, [supabase, roomId])  // supabaseが毎回新規なのでeffectが毎回実行
```

**影響**:
- チャンネルの作成・削除が繰り返される
- CPU・メモリの無駄遣い
- WebSocket接続の不安定化

**解決策**:
```tsx
// ✅ 解決: supabaseを依存配列から除外（シングルトン化前提）
useEffect(() => {
    const channel = supabase.channel(...)
    // ...
}, [roomId])  // supabaseを除外
```

---

### 3. フィルターなしの全テーブル監視

**問題箇所**: `RoomList.tsx`, `RoomPageClient.tsx`, `GamePageClient.tsx`, `MemberList/index.tsx`

```tsx
// ❌ 問題: 全ての変更を監視（関係ないroomの変更も受信）
.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'rooms',
}, () => { ... })
```

**影響**:
- 無関係なルームの変更でもコールバックが実行される
- 特にダッシュボードで全ルームを監視すると大量のイベント

**解決策**:
```tsx
// ✅ 解決: 特定のルームのみ監視
.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'rooms',
    filter: `id=eq.${roomId}`  // フィルターを追加
}, () => { ... })

// room_usersの場合
.on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'room_users',
    filter: `room_id=eq.${roomId}`
}, () => { ... })
```

---

### 4. 同時に複数のチャンネルが開かれている

**問題箇所**: ルームページ

ルームページでは以下が同時に動作:
- `RoomPageClient.tsx` → `room_game_${room.id}` チャンネル
- `MemberList/index.tsx` → `room_${roomId}` チャンネル

**影響**:
- 2つのWebSocket接続が同時に開かれる
- 同じテーブル（rooms, room_users）を複数箇所で監視

**解決策**:
- 1つのチャンネルで複数テーブルを監視するか
- Context/Storeで状態を一元管理し、購読は1箇所で行う

```tsx
// ✅ 解決: 1つのチャンネルで複数イベントを監視
const channel = supabase
    .channel(`room_all_${roomId}`)
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'rooms',
        filter: `id=eq.${roomId}`
    }, handleRoomChange)
    .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'room_users',
        filter: `room_id=eq.${roomId}`
    }, handleMemberChange)
    .subscribe()
```

---

### 5. イベント発火時にServer Actionで全データ再取得

**問題箇所**: 全コンポーネント

```tsx
// ❌ 問題: 変更イベントのpayloadを無視して全データ再取得
.on('postgres_changes', { ... }, () => {
    fetchMessageData();  // Server Actionで全データ取得
})
```

**影響**:
- 毎回DBクエリが発生
- ネットワーク帯域の無駄
- レイテンシの増加

**解決策**:
```tsx
// ✅ 解決: payloadから差分更新
.on('postgres_changes', { ... }, (payload) => {
    if (payload.eventType === 'INSERT') {
        setMembers(prev => [...prev, payload.new as RoomUserWithUser])
    } else if (payload.eventType === 'DELETE') {
        setMembers(prev => prev.filter(m => m.id !== payload.old.id))
    } else if (payload.eventType === 'UPDATE') {
        setMembers(prev => prev.map(m => 
            m.id === payload.new.id ? payload.new as RoomUserWithUser : m
        ))
    }
})
```

> **注意**: payloadには関連テーブル（JOINデータ）が含まれないため、`room_users`の変更時に`user`情報が必要な場合は部分的な再取得が必要

---

## 🟡 中程度の問題

### 6. console.logがプロダクションでも残っている

```tsx
console.log('roomUsersはこれだ', roomUsers);
console.log(payload);
```

**解決策**: 開発時のみログ出力するか、削除する

---

## 📊 優先度別修正リスト

| 優先度 | 問題 | 影響度 | 修正コスト |
|-------|-----|-------|----------|
| 🔴 高 | Supabaseクライアントのシングルトン化 | 大 | 小 |
| 🔴 高 | useEffect依存配列の修正 | 大 | 小 |
| 🟠 中 | フィルターの追加 | 中 | 中 |
| 🟠 中 | チャンネルの統合 | 中 | 大 |
| 🟡 低 | 差分更新の実装 | 小 | 大 |
| 🟡 低 | console.logの削除 | 小 | 小 |

---

## 開発環境固有の可能性

- **Supabase CLI**: ローカルでSupabase CLIを実行している場合、PostgreSQL・Kong・GoTrue等の複数プロセスがCPU/メモリを消費
- **Turbopack**: Next.js 16のTurbopackはまだ最適化途中の可能性
- **HMR**: Hot Module Replacementでコンポーネントが頻繁にアンマウント・リマウントされるとチャンネルの作成・削除が繰り返される

---

## 推奨される即時対応

1. **lib/supabase/client.ts をシングルトンに変更**
2. **各コンポーネントの useEffect 依存配列から supabase を削除**
3. **フィルターを追加して監視範囲を限定**
