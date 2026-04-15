-- 1. RLS有効化 (janken_events)
ALTER TABLE "janken_events" ENABLE ROW LEVEL SECURITY;

-- 2. リアルタイム通信有効化 (janken_events)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "janken_events";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL; -- すでに追加されていれば何もしない
        WHEN OTHERS THEN
            NULL; -- FOR ALL TABLES パブリケーションへの追加エラー等を無視
    END;
END $$;