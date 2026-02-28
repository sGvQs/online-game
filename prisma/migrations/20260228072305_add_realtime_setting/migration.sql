-- This is an empty migration.-- 1. RLS有効化 (typing_shoot_matches)
ALTER TABLE "typing_shoot_matches" ENABLE ROW LEVEL SECURITY;

-- 2. リアルタイム通信有効化 (typing_shoot_matches)
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE "typing_shoot_matches";
    EXCEPTION
        WHEN undefined_object THEN
            RAISE NOTICE 'publication "supabase_realtime" does not exist, skipping...';
        WHEN duplicate_object THEN
            NULL; -- すでに追加されていれば何もしない
    END;
END $$;