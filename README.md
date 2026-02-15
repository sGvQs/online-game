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


