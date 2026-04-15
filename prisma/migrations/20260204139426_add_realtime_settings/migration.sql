-- 1. RLS有効化
ALTER TABLE "rooms" ENABLE ROW LEVEL SECURITY;

-- 2. リアルタイム通信有効化
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "rooms";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL; -- すでに追加されていれば何もしない
        WHEN OTHERS THEN
            NULL; -- FOR ALL TABLES パブリケーションへの追加エラー等を無視
    END;
END $$;

-- 1. RLS有効化
ALTER TABLE "room_users" ENABLE ROW LEVEL SECURITY;

-- 2. リアルタイム通信有効化
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "room_users";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL; -- すでに追加されていれば何もしない
        WHEN OTHERS THEN
            NULL; -- FOR ALL TABLES パブリケーションへの追加エラー等を無視
    END;
END $$;