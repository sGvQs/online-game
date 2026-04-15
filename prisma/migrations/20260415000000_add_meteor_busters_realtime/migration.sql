-- 1. RLS有効化
ALTER TABLE "meteor_busters_matches" ENABLE ROW LEVEL SECURITY;

-- 2. REPLICA IDENTITY FULL（UPDATE/DELETEイベントを受け取るため）
ALTER TABLE "meteor_busters_matches" REPLICA IDENTITY FULL;

-- 3. Realtimeパブリケーションに追加
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "meteor_busters_matches";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL;
        WHEN OTHERS THEN
            NULL; -- FOR ALL TABLES パブリケーションへの追加エラー等を無視
    END;
END $$;

-- 4. Realtime用SELECTポリシー
CREATE POLICY "Allow select for everyone" ON public.meteor_busters_matches
FOR SELECT USING (true);
