# ローカル開発手順

## 1. dbの立ち上げ
```
npx supabase start
```

## 2. マイグレートリセット
```
npx prisma migrate reset
```
 - これができないときは `DROP PUBLICATION IF EXISTS supabase_realtime;` をsupabaseのsqlに貼って実行

## 3. nextサーバー立ち上げ
```
npm run dev
```

## 3. realtimeを実行するためのクエリ

- 下記をsupabaseのsqlにはって実行
- これをしたら `2. マイグレートリセット` の手順でエラーになるから補足を見ること
- これをしないとpayload.newがnullになる

```
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
```


# 便利なコマンド集

### migrationの型がTSに反映されないとき
```
npx prisma migrate dev
```

### migrationを名前だけで作成したい時
```
npx prisma migrate dev --name <名前> --create-only
```


# 本番リリース手順

## 通常（migration がそのまま通る場合）

```
prisma migrate deploy
```

以上。手動操作不要。

---

## migration が落ちた場合のリカバリ

### ① publication を DROP（SQL エディタで実行）

```sql
DROP PUBLICATION IF EXISTS supabase_realtime;
```

> **注意:** この操作で Supabase 内部の Realtime 設定が消えるため、③ は必須。

### ② migration を流す

```
prisma migrate deploy
```

### ③ Realtime 設定を再構築（SQL エディタで実行・① を行ったら必須）

```sql
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
```

### ④ publication を per-table に切り替え（SQL エディタで実行）

`FOR ALL TABLES` のままだとダッシュボードの Realtime トグルがすべて OFF に見えるため切り替える。

まず現状確認：

```sql
SELECT pubname, puballtables FROM pg_publication WHERE pubname = 'supabase_realtime';
```

`puballtables = true` なら切り替える：

```sql
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

ALTER PUBLICATION supabase_realtime ADD TABLE
  rooms,
  room_users,
  matches,
  error_events,
  janken_events,
  typing_shoot_metrics,
  meteor_busters_matches;
```

### ⑤ 確認

`Database → Replication` で各テーブルのトグルが ON になっていることを確認する。

### ⑥ 待機

publication の再構築後、Supabase 内部のレプリケーションスロット再接続に数分〜数十分かかる。Realtime が反映されない場合は時間をおいて再確認する。

> **新しいテーブルを追加した場合** は `ALTER PUBLICATION supabase_realtime ADD TABLE <テーブル名>;` を追加で実行すること。
