-- 1. RLS有効化 (error_events)
ALTER TABLE "error_events" ENABLE ROW LEVEL SECURITY;

-- 2. リアルタイム通信有効化 (error_events)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "error_events";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL; -- すでに追加されていれば何もしない
    END;
END $$;

-- 1. RLS有効化 (matches)
ALTER TABLE "matches" ENABLE ROW LEVEL SECURITY;

-- 2. リアルタイム通信有効化 (matches)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "matches";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL; -- すでに追加されていれば何もしない
    END;
END $$;
